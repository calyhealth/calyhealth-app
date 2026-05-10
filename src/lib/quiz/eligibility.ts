import type { PartialAnswers, EligibilityResult } from './types';

const PERSONAL_CONTRAINDICATIONS = [
  'Medullary thyroid cancer — personal history',
  'MEN2 syndrome (multiple endocrine neoplasia type 2) — personal',
];

export function computeEligibility(answers: PartialAnswers): EligibilityResult {
  const bmi = answers.bmi ?? 0;
  const contraindications = answers.contraindications ?? [];
  const comorbidities = answers.comorbidities ?? [];

  // ── Hard blocks ────────────────────────────────────────────────────────

  const hasPersonalThyroidOrMEN2 = contraindications.some(c =>
    PERSONAL_CONTRAINDICATIONS.includes(c)
  );
  if (hasPersonalThyroidOrMEN2) {
    return {
      outcome: 'ineligible',
      ineligibleReason:
        'You have indicated a personal history of medullary thyroid cancer or MEN2 syndrome. ' +
        'GLP-1 medications including Mounjaro are contraindicated with this condition per FDA prescribing guidelines.',
      softFlags: [],
      bmi,
    };
  }

  if (answers.pregnant_or_breastfeeding) {
    return {
      outcome: 'ineligible',
      ineligibleReason:
        'GLP-1 medications are not recommended during pregnancy, while trying to conceive, or while ' +
        'breastfeeding due to insufficient safety data. Treatment should be stopped at least 3 months before conception.',
      softFlags: [],
      bmi,
    };
  }

  if (answers.esrd_or_dialysis) {
    return {
      outcome: 'ineligible',
      ineligibleReason:
        'GLP-1 medications are contraindicated in patients with end-stage kidney disease or those currently on dialysis.',
      softFlags: [],
      bmi,
    };
  }

  // ── BMI threshold ──────────────────────────────────────────────────────

  if (bmi < 27) {
    return {
      outcome: 'ineligible',
      ineligibleReason:
        `Your BMI of ${bmi.toFixed(1)} is below the minimum threshold for GLP-1 treatment. ` +
        'Clinical guidelines indicate GLP-1 therapy for BMI ≥ 30, or ≥ 27 with a qualifying health condition.',
      softFlags: [],
      bmi,
    };
  }

  if (bmi < 30 && comorbidities.length === 0) {
    return {
      outcome: 'ineligible',
      ineligibleReason:
        `Your BMI of ${bmi.toFixed(1)} is in the 27–30 range. GLP-1 treatment at this BMI requires ` +
        'at least one qualifying diagnosed condition (such as diabetes, high blood pressure, or high cholesterol). ' +
        'None were indicated in your answers.',
      softFlags: [],
      bmi,
    };
  }

  // ── Soft flags → doctor review ─────────────────────────────────────────

  const softFlags: string[] = [];

  if (answers.age_over_65) {
    softFlags.push('Age over 65 — additional clinical review recommended');
  }

  const hasFamilyThyroidOrMEN2 = contraindications.some(
    c => c.includes('family member') && (c.includes('thyroid') || c.includes('MEN2'))
  );
  if (hasFamilyThyroidOrMEN2) {
    softFlags.push('Family history of thyroid cancer or MEN2');
  }

  if (contraindications.includes('History of pancreatitis')) {
    softFlags.push('History of pancreatitis');
  }
  if (contraindications.includes('Gallbladder disease or gallstones')) {
    softFlags.push('History of gallbladder disease');
  }

  if (answers.on_insulin) {
    softFlags.push('Currently taking insulin — hypoglycaemia monitoring required');
  }
  if (answers.on_gliptin) {
    softFlags.push('Currently taking DPP-4 inhibitor (gliptin) — medication switch review required');
  }
  if (answers.eating_disorder_history) {
    softFlags.push('History of eating disorder');
  }

  const wlAttempts = answers.prior_weight_loss_attempts ?? [];
  if (wlAttempts.includes('Bariatric surgery (gastric bypass, sleeve, band)')) {
    softFlags.push('Prior bariatric surgery — specialist review recommended');
  }

  if (bmi >= 27 && bmi < 30 && comorbidities.length > 0) {
    softFlags.push('BMI 27–30 with co-morbidity — borderline case, closer review recommended');
  }

  return {
    outcome: softFlags.length > 0 ? 'review' : 'eligible',
    softFlags,
    bmi,
  };
}

export function calcBMI(heightCm: number, weightKg: number): number {
  if (!heightCm || !weightKg) return 0;
  return Math.round((weightKg / Math.pow(heightCm / 100, 2)) * 10) / 10;
}

export function imperialToMetric(
  heightFt: number,
  heightIn: number,
  weightLbs: number
): { heightCm: number; weightKg: number } {
  const totalInches = heightFt * 12 + heightIn;
  return {
    heightCm: Math.round(totalInches * 2.54),
    weightKg: Math.round(weightLbs * 0.453592 * 10) / 10,
  };
}

export function bmiCategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25)   return 'Normal weight';
  if (bmi < 27)   return 'Overweight';
  if (bmi < 30)   return 'Overweight — eligible with qualifying condition';
  if (bmi < 35)   return 'Obese — Class I';
  if (bmi < 40)   return 'Obese — Class II';
  return 'Obese — Class III';
}

export function bmiMarkerPercent(bmi: number): number {
  // Scale 16–42, clamp to 0–100
  return Math.min(100, Math.max(0, Math.round(((bmi - 16) / (42 - 16)) * 100)));
}
