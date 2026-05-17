import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { submitPatientIntake } from '@/lib/beluga/client';
import { buildBelugaPayload } from '@/lib/beluga/transform';
import type { EligibilityResult } from '@/lib/quiz/types';

interface GuestContact {
  firstName: string;
  lastName: string;
  email: string;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { quizAnswers, eligibilityResult, contact, hipaaConsentAt, planId, shippingAddress } = body as {
      quizAnswers: Record<string, unknown>;
      eligibilityResult?: EligibilityResult;
      contact?: GuestContact;
      hipaaConsentAt?: string;
      planId?: string;
      shippingAddress?: { line1: string; city: string; state: string; zip: string };
    };

    // ── Resolve identity: authenticated user OR guest contact ─────────────
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let userId: string;
    let userEmail: string;
    let firstName: string;
    let lastName: string;

    if (user) {
      userId    = user.id;
      userEmail = user.email!;
      firstName = user.user_metadata?.first_name || contact?.firstName || '';
      lastName  = user.user_metadata?.last_name  || contact?.lastName  || '';
    } else {
      // Guest path — require contact details
      if (!contact?.email || !contact?.firstName || !contact?.lastName) {
        return NextResponse.json({ error: 'Contact details are required for guest submissions' }, { status: 400 });
      }

      // Use service role to upsert a user record by email
      const svc = createServiceClient();
      const { data: existingUsers } = await svc.auth.admin.listUsers();
      const existing = existingUsers?.users?.find(u => u.email === contact.email);

      if (existing) {
        userId = existing.id;
      } else {
        const { data: created, error: createErr } = await svc.auth.admin.createUser({
          email: contact.email,
          email_confirm: true,
          user_metadata: { first_name: contact.firstName, last_name: contact.lastName },
        });
        if (createErr || !created?.user) {
          console.error('Failed to create guest user:', createErr);
          return NextResponse.json({ error: 'Failed to create user record' }, { status: 500 });
        }
        userId = created.user.id;
      }

      userEmail = contact.email;
      firstName = contact.firstName;
      lastName  = contact.lastName;
    }

    // ── Build Beluga payload ───────────────────────────────────────────────
    const resolvedPlanId = planId || 'semaglutide';
    const resolvedAddress = shippingAddress || { line1: '', city: '', state: 'CA', zip: '00000' };

    const belugaPayload = buildBelugaPayload(
      quizAnswers,
      { firstName, lastName, email: userEmail },
      resolvedPlanId,
      resolvedAddress
    );

    // ── Submit to Beluga ───────────────────────────────────────────────────
    const belugaResponse = await submitPatientIntake(belugaPayload);

    if (!belugaResponse.success) {
      return NextResponse.json({ error: 'Intake submission failed', details: belugaResponse }, { status: 422 });
    }

    // ── Persist to Supabase ────────────────────────────────────────────────
    const svc = createServiceClient();
    const { data: intake, error: dbError } = await svc
      .from('clinical_intakes')
      .insert({
        user_id:             userId,
        plan_id:             resolvedPlanId,
        beluga_patient_id:   belugaResponse.patientId,
        beluga_intake_id:    belugaResponse.intakeId,
        status:              'submitted',
        quiz_answers:        { ...quizAnswers, schema_version: 'v2' },
        eligibility_outcome: eligibilityResult?.outcome,
        soft_flags:          eligibilityResult?.softFlags ?? [],
        hipaa_consent_at:    hipaaConsentAt,
        shipping_address:    resolvedAddress,
        updated_at:          new Date().toISOString(),
      })
      .select()
      .single();

    if (dbError) {
      console.error('DB error saving intake:', JSON.stringify(dbError));
      // Return error so it's visible in logs — not silent
      return NextResponse.json({ error: 'Failed to save intake to database', details: dbError.message }, { status: 500 });
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
