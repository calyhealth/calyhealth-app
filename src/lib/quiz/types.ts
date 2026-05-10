export type ScreenId =
  | 'welcome'
  | 'age'
  | 'biometric'
  | 'bmi-gate'
  | 'comorbidities'
  | 'contraindications'
  | 'pregnancy-kidney'
  | 'medications'
  | 'other-meds'
  | 'eating-disorder'
  | 'lifestyle'
  | 'history'
  | 'result'
  | 'contact'
  | 'confirm'
  | 'ineligible-age';

export type EligibilityOutcome = 'eligible' | 'review' | 'ineligible';

export interface EligibilityResult {
  outcome: EligibilityOutcome;
  ineligibleReason?: string;
  softFlags: string[];
  bmi: number;
}

export interface QuizAnswersV2 {
  schema_version: 'v2';
  age_confirmed: boolean;
  age_over_65: boolean;
  height_cm: number;
  weight_kg: number;
  bmi: number;
  unit_preference: 'imperial' | 'metric';
  comorbidities: string[];
  contraindications: string[];
  pregnant_or_breastfeeding: boolean;
  esrd_or_dialysis: boolean;
  on_insulin: boolean;
  on_gliptin: boolean;
  other_medications: string;
  eating_disorder_history: boolean;
  alcohol_weekly: 'none' | '1-7' | '8-14' | '15+';
  exercise_frequency: 'sedentary' | 'light' | 'moderate' | 'active';
  prior_weight_loss_attempts: string[];
}

// Partial answers accumulated as the quiz progresses
export type PartialAnswers = { schema_version: 'v2' } & Partial<Omit<QuizAnswersV2, 'schema_version'>>;

export interface QuizState {
  currentScreen: ScreenId;
  history: ScreenId[];
  // Raw biometric inputs (kept separate for display purposes)
  heightFt: string;
  heightIn: string;
  weightLbs: string;
  heightCm: string;
  weightKg: string;
  unit: 'imperial' | 'metric';
  bmi: number | null;
  answers: PartialAnswers;
  eligibilityResult: EligibilityResult | null;
  submitting: boolean;
  submitError: string | null;
}

export type QuizAction =
  | { type: 'GO_TO'; screen: ScreenId }
  | { type: 'BACK' }
  | { type: 'PATCH'; patch: Partial<Omit<QuizAnswersV2, 'schema_version'>> }
  | { type: 'SET_UNIT'; unit: 'imperial' | 'metric' }
  | { type: 'SET_IMPERIAL'; heightFt: string; heightIn: string; weightLbs: string }
  | { type: 'SET_METRIC'; heightCm: string; weightKg: string }
  | { type: 'COMMIT_BMI'; bmi: number; heightCm: number; weightKg: number }
  | { type: 'TOGGLE_COMORBIDITY'; value: string }
  | { type: 'CLEAR_COMORBIDITIES' }
  | { type: 'TOGGLE_CONTRAINDICATION'; value: string }
  | { type: 'CLEAR_CONTRAINDICATIONS' }
  | { type: 'TOGGLE_WL_ATTEMPT'; value: string }
  | { type: 'CLEAR_WL_ATTEMPTS' }
  | { type: 'SET_ELIGIBILITY'; result: EligibilityResult }
  | { type: 'SET_SUBMITTING'; value: boolean }
  | { type: 'SET_SUBMIT_ERROR'; error: string | null };
