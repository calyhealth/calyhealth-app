import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { submitPatientIntake } from '@/lib/beluga/client';
import { buildBelugaPayload } from '@/lib/beluga/transform';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { quizAnswers, planId, shippingAddress } = await req.json();

    // Build the Beluga-shaped payload from quiz answers
    const userMeta = user.user_metadata || {};
    const belugaPayload = buildBelugaPayload(
      quizAnswers,
      {
        firstName: userMeta.first_name || '',
        lastName: userMeta.last_name || '',
        email: user.email!,
      },
      planId,
      shippingAddress
    );

    // Submit to Beluga (or mock)
    const belugaResponse = await submitPatientIntake(belugaPayload);

    if (!belugaResponse.success) {
      return NextResponse.json({ error: 'Intake submission failed', details: belugaResponse }, { status: 422 });
    }

    // Persist to Supabase
    const { data: intake, error: dbError } = await supabase
      .from('clinical_intakes')
      .upsert({
        user_id: user.id,
        plan_id: planId,
        beluga_patient_id: belugaResponse.patientId,
        beluga_intake_id: belugaResponse.intakeId,
        status: 'submitted',
        quiz_answers: quizAnswers,
        shipping_address: shippingAddress,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })
      .select()
      .single();

    if (dbError) {
      console.error('DB error saving intake:', dbError);
      // Non-fatal — Beluga has the record even if our DB write fails
    }

    return NextResponse.json({
      success: true,
      intakeId: intake?.id || belugaResponse.intakeId,
      belugaPatientId: belugaResponse.patientId,
      message: belugaResponse.message,
    });
  } catch (err) {
    console.error('submit-intake error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
