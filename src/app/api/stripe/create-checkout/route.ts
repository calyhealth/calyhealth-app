import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const PLAN_AMOUNTS: Record<string, number> = {
  semaglutide: 19900,
  total: 34900,
  metabolic: 14900,
};

const PLAN_NAMES: Record<string, string> = {
  semaglutide: 'Semaglutide Program',
  total: 'Total Weight Loss Program',
  metabolic: 'Metabolic Booster Rx',
};

function isStripeConfigured() {
  const key = process.env.STRIPE_SECRET_KEY || '';
  return key.startsWith('sk_test_') || key.startsWith('sk_live_');
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { planId, address } = await req.json();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Demo mode: Stripe not configured — simulate enrollment without charging
    if (!isStripeConfigured()) {
      await supabase.from('orders').upsert({
        user_id: user.id,
        plan_id: planId,
        stripe_session_id: `demo_${user.id}_${Date.now()}`,
        status: 'pending_physician_approval',
        shipping_address: address,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'stripe_session_id' });

      return NextResponse.json({ url: `${appUrl}/dashboard?checkout=success` });
    }

    // Real Stripe checkout
    const Stripe = (await import('stripe')).default;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-04-22.dahlia' as any });

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: user.email,
      line_items: [{
        price_data: {
          currency: 'usd',
          recurring: { interval: 'month' },
          product_data: { name: PLAN_NAMES[planId] || 'CalyHealth Program' },
          unit_amount: PLAN_AMOUNTS[planId] || 34900,
        },
        quantity: 1,
      }],
      metadata: {
        user_id: user.id,
        plan_id: planId,
        shipping_address: JSON.stringify(address),
      },
      success_url: `${appUrl}/dashboard?checkout=success`,
      cancel_url: `${appUrl}/checkout?plan=${planId}`,
      subscription_data: {
        trial_period_days: 0,
        metadata: { user_id: user.id, plan_id: planId, status: 'pending_physician_approval' },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout error:', err);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
