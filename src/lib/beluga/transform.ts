import type { BelugaIntakePayload } from './types';
import { BELUGA_MED_PREFERENCES } from './types';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dob?: string;
  address?: { line1: string; city: string; state: string; zip: string };
}

// ── v2 quiz shape (state machine output) ─────────────────────────────────

interface QuizAnswersV2 {
  schema_version: 'v2';
  height_cm?: number;
  weight_kg?: number;
  bmi?: number;
  comorbidities?: string[];
  contraindications?: string[];
  on_insulin?: boolean;
  on_gliptin?: boolean;
  other_medications?: string;
  eating_disorder_history?: boolean;
  alcohol_weekly?: string;
  exercise_frequency?: string;
  prior_weight_loss_attempts?: string[];
  pregnant_or_breastfeeding?: boolean;
  esrd_or_dialysis?: boolean;
  eligibility_outcome?: string;
  soft_flags?: string[];
}

// ── Legacy v1 quiz shape ──────────────────────────────────────────────────

interface QuizAnswersV1 {
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
  program_preference?: string;
}

function cmToFtIn(cm: number): { ft: number; inches: number } {
  const totalInches = cm / 2.54;
  return { ft: Math.floor(totalInches / 12), inches: Math.round(totalInches % 12) };
}

function kgToLbs(kg: number): number {
  return Math.round(kg * 2.20462);
}

function buildFromV2(
  quiz: QuizAnswersV2,
  user: UserProfile,
  planId: string,
  shippingAddress: { line1: string; city: string; state: string; zip: string }
): BelugaIntakePayload {
  const { ft, inches } = cmToFtIn(quiz.height_cm ?? 170);
  const weightLbs = kgToLbs(quiz.weight_kg ?? 80);

  const comorbidities = quiz.comorbidities ?? [];
  const contraindications = (quiz.contraindications ?? []).filter(c => !c.includes('None'));
  const softFlags = quiz.soft_flags ?? [];

  const conditionsParts = [
    ...comorbidities,
    ...contraindications,
    ...softFlags,
  ];
  const medicalConditions = conditionsParts.length > 0 ? conditionsParts.join('; ') : 'None reported';

  const medParts: string[] = [];
  if (quiz.on_insulin)  medParts.push('Insulin');
  if (quiz.on_gliptin)  medParts.push('DPP-4 inhibitor (gliptin)');
  if (quiz.other_medications?.trim()) medParts.push(quiz.other_medications.trim());
  const selfReportedMeds = medParts.length > 0 ? medParts.join(', ') : 'None';

  return {
    campaignId:       process.env.BELUGA_CAMPAIGN_ID || '',
    consentsSigned:   true,
    firstName:        user.firstName,
    lastName:         user.lastName,
    dob:              user.dob || '01/01/1980',
    phone:            (user.phone || '0000000000').replace(/\D/g, '').slice(0, 10),
    email:            user.email,
    address:          shippingAddress.line1 || 'Pending',
    city:             shippingAddress.city  || 'Pending',
    state:            (shippingAddress.state || 'CA').slice(0, 2).toUpperCase(),
    zip:              (shippingAddress.zip   || '00000').slice(0, 5),
    sex:              'Other',
    selfReportedMeds,
    allergies:        'None reported',
    medicalConditions,
    heightFt:         ft,
    heightIn:         inches,
    weightLbs,
    patientPreference: BELUGA_MED_PREFERENCES[planId] || BELUGA_MED_PREFERENCES.semaglutide,
  };
}

function buildFromV1(
  quiz: QuizAnswersV1,
  user: UserProfile,
  planId: string,
  shippingAddress: { line1: string; city: string; state: string; zip: string }
): BelugaIntakePayload {
  const conditions = quiz.conditions?.filter(c => c !== 'None of the above') ?? [];
  const medicalConditions = conditions.length > 0 ? conditions.join(', ') : 'None reported';
  const selfReportedMeds = quiz.medications === 'No' ? 'None' : (quiz.medications || 'None');

  const sexMap: Record<string, 'Male' | 'Female' | 'Other'> = {
    Female: 'Female', Male: 'Male', 'Prefer not to say': 'Other',
  };

  return {
    campaignId:        process.env.BELUGA_CAMPAIGN_ID || '',
    consentsSigned:    true,
    firstName:         user.firstName,
    lastName:          user.lastName,
    dob:               user.dob || '01/01/1980',
    phone:             (user.phone || '0000000000').replace(/\D/g, '').slice(0, 10),
    email:             user.email,
    address:           shippingAddress.line1,
    city:              shippingAddress.city,
    state:             (quiz.state || shippingAddress.state).slice(0, 2).toUpperCase(),
    zip:               shippingAddress.zip.slice(0, 5),
    sex:               sexMap[quiz.sex || ''] || 'Other',
    selfReportedMeds,
    allergies:         'None reported',
    medicalConditions,
    heightFt:          quiz.height_ft  ? parseInt(quiz.height_ft)  : undefined,
    heightIn:          quiz.height_in  ? parseInt(quiz.height_in)  : undefined,
    weightLbs:         quiz.weight     ? parseInt(quiz.weight)     : undefined,
    goalWeightLbs:     quiz.goal_weight ? parseInt(quiz.goal_weight) : undefined,
    patientPreference: BELUGA_MED_PREFERENCES[planId] || BELUGA_MED_PREFERENCES.semaglutide,
  };
}

export function buildBelugaPayload(
  quiz: Record<string, unknown>,
  user: UserProfile,
  planId: string,
  shippingAddress: { line1: string; city: string; state: string; zip: string }
): BelugaIntakePayload {
  if (quiz.schema_version === 'v2') {
    return buildFromV2(quiz as unknown as QuizAnswersV2, user, planId, shippingAddress);
  }
  return buildFromV1(quiz as unknown as QuizAnswersV1, user, planId, shippingAddress);
}
