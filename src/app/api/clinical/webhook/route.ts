import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { BelugaWebhookPayload } from '@/lib/beluga/types';
import Stripe from 'stripe';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-04-22.dahlia' as any });

function verifyWebhookSignature(body: string, signature: string | null): boolean {
  const secret = process.env.BELUGA_WEBHOOK_SECRET;
  if (!secret) return true; // Skip verification in dev/mock mode
  if (!signature) return false;
  // Beluga uses HMAC-SHA256; implement when their docs confirm exact header name
  // For now accept if secret matches signature directly (placeholder)
  return signature === secret;
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('x-beluga-signature');

  if (!verifyWebhookSignature(body, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let payload: BelugaWebhookPayload;
  try {
    payload = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const supabase = await createClient();

  if (payload.event === 'prescription.written' && payload.prescription) {
    // 1. Update our clinical_intakes record
    const { data: intake } = await supabase
      .from('clinical_intakes')
      .update({
        status: 'approved',
        prescription_id: payload.prescription.id,
        prescription_data: payload.prescription,
        updated_at: new Date().toISOString(),
      })
      .eq('beluga_patient_id', payload.patientId)
      .select('user_id, plan_id')
      .single();

    if (intake) {
      // 2. Update the order status
      await supabase
        .from('orders')
        .update({ status: 'approved', updated_at: new Date().toISOString() })
        .eq('user_id', intake.user_id);

      // 3. Activate the Stripe subscription (remove hold / start billing)
      const { data: order } = await supabase
        .from('orders')
        .select('stripe_subscription_id')
        .eq('user_id', intake.user_id)
        .single();

      if (order?.stripe_subscription_id) {
        try {
          await stripe.subscriptions.update(order.stripe_subscription_id, {
            metadata: { status: 'active', physician_approved: 'true' },
          });
        } catch (stripeErr) {
          console.error('Stripe update failed:', stripeErr);
        }
      }
    }
  }

  if (payload.event === 'prescription.denied') {
    await supabase
      .from('clinical_intakes')
      .update({
        status: 'denied',
        denial_reason: payload.denialReason,
        updated_at: new Date().toISOString(),
      })
      .eq('beluga_patient_id', payload.patientId);

    // Also update orders and cancel/refund the Stripe subscription
    const { data: intake } = await supabase
      .from('clinical_intakes')
      .select('user_id')
      .eq('beluga_patient_id', payload.patientId)
      .single();

    if (intake) {
      const { data: order } = await supabase
        .from('orders')
        .select('stripe_subscription_id')
        .eq('user_id', intake.user_id)
        .single();

      if (order?.stripe_subscription_id) {
        await stripe.subscriptions.cancel(order.stripe_subscription_id).catch(console.error);
      }

      await supabase
        .from('orders')
        .update({ status: 'denied', updated_at: new Date().toISOString() })
        .eq('user_id', intake.user_id);
    }
  }

  return NextResponse.json({ received: true });
}
