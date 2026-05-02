import type { BelugaIntakePayload, BelugaIntakeResponse } from './types';

const BELUGA_BASE_URL = process.env.BELUGA_API_URL || 'https://api.belugahealth.com/v1';
const BELUGA_API_KEY = process.env.BELUGA_API_KEY || '';
const IS_MOCK = !BELUGA_API_KEY || BELUGA_API_KEY.startsWith('mock_') || process.env.BELUGA_MOCK === 'true';

export async function submitPatientIntake(payload: BelugaIntakePayload): Promise<BelugaIntakeResponse> {
  if (IS_MOCK) {
    return mockSubmitIntake(payload);
  }

  const res = await fetch(`${BELUGA_BASE_URL}/intake`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${BELUGA_API_KEY}`,
      'X-Campaign-ID': process.env.BELUGA_CAMPAIGN_ID || '',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new BelugaError(`Intake submission failed: ${res.status}`, res.status, error);
  }

  return res.json();
}

export async function getPatientStatus(belugaPatientId: string): Promise<{ status: string; details?: unknown }> {
  if (IS_MOCK) {
    return mockGetStatus(belugaPatientId);
  }

  const res = await fetch(`${BELUGA_BASE_URL}/patients/${belugaPatientId}/status`, {
    headers: { 'Authorization': `Bearer ${BELUGA_API_KEY}` },
  });

  if (!res.ok) throw new BelugaError('Status fetch failed', res.status);
  return res.json();
}

// ── Mock layer (used when BELUGA_API_KEY is unset or prefixed mock_) ──

let mockCallCount = 0;

function mockSubmitIntake(payload: BelugaIntakePayload): BelugaIntakeResponse {
  console.log('[Beluga Mock] submitPatientIntake', { email: payload.email, plan: payload.patientPreference[0]?.name });
  mockCallCount++;
  return {
    success: true,
    patientId: `mock_patient_${Date.now()}`,
    intakeId: `mock_intake_${Date.now()}`,
    message: 'Patient intake submitted successfully (mock)',
  };
}

function mockGetStatus(patientId: string): { status: string; details?: unknown } {
  console.log('[Beluga Mock] getPatientStatus', patientId);
  // Simulate progression: first few calls return under_review, then approved
  const phase = mockCallCount > 2 ? 'approved' : 'under_review';
  return {
    status: phase,
    details: phase === 'approved' ? {
      prescription: {
        medicationName: 'Semaglutide',
        strength: '2.5mg/0.5ml',
        physicianName: 'Dr. Sarah Chen, MD',
        writtenAt: new Date().toISOString(),
      },
    } : { estimatedReviewTime: '24 hours' },
  };
}

export class BelugaError extends Error {
  constructor(message: string, public statusCode: number, public body?: unknown) {
    super(message);
    this.name = 'BelugaError';
  }
}

export { IS_MOCK };
