import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function isStripeConfigured() {
  const key = process.env.STRIPE_SECRET_KEY || '';
  return key.startsWith('sk_test_') || key.startsWith('sk_live_');
}

export async function POST(req: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });
  }

  const Stripe = (await import('stripe')).default;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-04-22.dahlia' as any });

  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig) return NextResponse.json({ error: 'No signature' }, { status: 400 });

  let event: import('stripe').default.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error('Stripe webhook signature failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = await createClient();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as import('stripe').default.Checkout.Session;
      const { user_id, plan_id } = session.metadata || {};

      if (user_id && plan_id) {
        const shipping = session.metadata?.shipping_address
          ? JSON.parse(session.metadata.shipping_address)
          : null;

        await supabase.from('orders').upsert({
          user_id,
          plan_id,
          stripe_session_id: session.id,
          stripe_subscription_id: session.subscription as string,
          status: 'pending_physician_approval',
          shipping_address: shipping,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'stripe_session_id' });
      }
      break;
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as import('stripe').default.Subscription;
      const status = sub.metadata?.status;
      if (status === 'active') {
        await supabase.from('orders')
          .update({ status: 'active', updated_at: new Date().toISOString() })
          .eq('stripe_subscription_id', sub.id);
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as import('stripe').default.Subscription;
      await supabase.from('orders')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('stripe_subscription_id', sub.id);
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as import('stripe').default.Invoice & { subscription?: string };
      if (invoice.subscription) {
        await supabase.from('orders')
          .update({ status: 'paused', updated_at: new Date().toISOString() })
          .eq('stripe_subscription_id', invoice.subscription);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
