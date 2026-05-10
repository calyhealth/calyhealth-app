import type { QuizState, QuizAction } from './types';

export const initialState: QuizState = {
  currentScreen: 'welcome',
  history: [],
  heightFt: '',
  heightIn: '',
  weightLbs: '',
  heightCm: '',
  weightKg: '',
  unit: 'imperial',
  bmi: null,
  answers: { schema_version: 'v2' },
  eligibilityResult: null,
  submitting: false,
  submitError: null,
};

export function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {

    case 'GO_TO':
      return {
        ...state,
        history: [...state.history, state.currentScreen],
        currentScreen: action.screen,
      };

    case 'BACK': {
      if (state.history.length === 0) return state;
      const prev = state.history[state.history.length - 1];
      return {
        ...state,
        currentScreen: prev,
        history: state.history.slice(0, -1),
      };
    }

    case 'PATCH':
      return { ...state, answers: { ...state.answers, ...action.patch } };

    case 'SET_UNIT':
      return { ...state, unit: action.unit };

    case 'SET_IMPERIAL':
      return {
        ...state,
        heightFt: action.heightFt,
        heightIn: action.heightIn,
        weightLbs: action.weightLbs,
      };

    case 'SET_METRIC':
      return {
        ...state,
        heightCm: action.heightCm,
        weightKg: action.weightKg,
      };

    case 'COMMIT_BMI':
      return {
        ...state,
        bmi: action.bmi,
        answers: {
          ...state.answers,
          bmi: action.bmi,
          height_cm: action.heightCm,
          weight_kg: action.weightKg,
          unit_preference: state.unit,
        },
      };

    case 'TOGGLE_COMORBIDITY': {
      const current = state.answers.comorbidities ?? [];
      const next = current.includes(action.value)
        ? current.filter(v => v !== action.value)
        : [...current, action.value];
      return { ...state, answers: { ...state.answers, comorbidities: next } };
    }

    case 'CLEAR_COMORBIDITIES':
      return { ...state, answers: { ...state.answers, comorbidities: [] } };

    case 'TOGGLE_CONTRAINDICATION': {
      const current = state.answers.contraindications ?? [];
      const next = current.includes(action.value)
        ? current.filter(v => v !== action.value)
        : [...current, action.value];
      return { ...state, answers: { ...state.answers, contraindications: next } };
    }

    case 'CLEAR_CONTRAINDICATIONS':
      return { ...state, answers: { ...state.answers, contraindications: [] } };

    case 'TOGGLE_WL_ATTEMPT': {
      const current = state.answers.prior_weight_loss_attempts ?? [];
      const next = current.includes(action.value)
        ? current.filter(v => v !== action.value)
        : [...current, action.value];
      return { ...state, answers: { ...state.answers, prior_weight_loss_attempts: next } };
    }

    case 'CLEAR_WL_ATTEMPTS':
      return { ...state, answers: { ...state.answers, prior_weight_loss_attempts: [] } };

    case 'SET_ELIGIBILITY':
      return { ...state, eligibilityResult: action.result };

    case 'SET_SUBMITTING':
      return { ...state, submitting: action.value };

    case 'SET_SUBMIT_ERROR':
      return { ...state, submitError: action.error };

    default:
      return state;
  }
}
