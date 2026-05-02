import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getPatientStatus } from '@/lib/beluga/client';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Get their intake record from our DB
    const { data: intake } = await supabase
      .from('clinical_intakes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!intake) {
      return NextResponse.json({ status: 'no_intake', intake: null });
    }

    // If they have a Beluga patient ID, fetch live status
    if (intake.beluga_patient_id) {
      try {
        const liveStatus = await getPatientStatus(intake.beluga_patient_id);

        // Sync status back to our DB if it changed
        if (liveStatus.status !== intake.status) {
          await supabase
            .from('clinical_intakes')
            .update({ status: liveStatus.status, updated_at: new Date().toISOString() })
            .eq('id', intake.id);
        }

        return NextResponse.json({
          status: liveStatus.status,
          intake: { ...intake, status: liveStatus.status },
          details: liveStatus.details,
        });
      } catch {
        // Fall through to DB status if Beluga is unreachable
      }
    }

    return NextResponse.json({ status: intake.status, intake });
  } catch (err) {
    console.error('clinical/status error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
