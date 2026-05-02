import type { BelugaIntakePayload } from './types';
import { BELUGA_MED_PREFERENCES } from './types';

interface QuizAnswers {
  age?: string;
  sex?: string;
  state?: string;
  height_ft?: string;
  height_in?: string;
  weight?: string;
  goal_weight?: string;
  conditions?: string[];
  medications?: string;
  prior_glp1?: string;
  timeline?: string;
  motivation?: string;
  program_preference?: string;
}

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dob?: string;
  address?: {
    line1: string;
    city: string;
    state: string;
    zip: string;
  };
}

export function buildBelugaPayload(
  quiz: QuizAnswers,
  user: UserProfile,
  planId: string,
  shippingAddress: { line1: string; city: string; state: string; zip: string }
): BelugaIntakePayload {
  const conditions = quiz.conditions?.filter(c => c !== 'None of the above') || [];
  const medicalConditions = conditions.length > 0 ? conditions.join(', ') : 'None reported';

  const meds = quiz.medications || 'No';
  const selfReportedMeds = meds === 'No' ? 'None' : meds;

  // Normalize sex field to Beluga's expected values
  const sexMap: Record<string, 'Male' | 'Female' | 'Other'> = {
    'Female': 'Female',
    'Male': 'Male',
    'Prefer not to say': 'Other',
  };
  const sex = sexMap[quiz.sex || ''] || 'Other';

  // Use the shipping address state if quiz state not filled
  const patientState = quiz.state || shippingAddress.state;

  return {
    campaignId: process.env.BELUGA_CAMPAIGN_ID || '',
    consentsSigned: true,
    firstName: user.firstName,
    lastName: user.lastName,
    dob: user.dob || '01/01/1980', // will be collected in a future profile step
    phone: (user.phone || '0000000000').replace(/\D/g, '').slice(0, 10),
    email: user.email,
    address: shippingAddress.line1,
    city: shippingAddress.city,
    state: patientState.slice(0, 2).toUpperCase(),
    zip: shippingAddress.zip.slice(0, 5),
    sex,
    selfReportedMeds,
    allergies: 'None reported',
    medicalConditions,
    heightFt: quiz.height_ft ? parseInt(quiz.height_ft) : undefined,
    heightIn: quiz.height_in ? parseInt(quiz.height_in) : undefined,
    weightLbs: quiz.weight ? parseInt(quiz.weight) : undefined,
    goalWeightLbs: quiz.goal_weight ? parseInt(quiz.goal_weight) : undefined,
    patientPreference: BELUGA_MED_PREFERENCES[planId] || BELUGA_MED_PREFERENCES.semaglutide,
  };
}
