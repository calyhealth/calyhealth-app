export interface BelugaPatientPreference {
  name: string;
  strength: string;
  quantity: number;
  refills: number;
  medId: string;
}

export interface BelugaIntakePayload {
  consentsSigned: boolean;
  firstName: string;
  lastName: string;
  dob: string;           // MM/DD/YYYY
  phone: string;         // 10 digits, no formatting
  email: string;
  address: string;
  city: string;
  state: string;         // 2-letter abbreviation
  zip: string;           // 5 digits
  sex: 'Male' | 'Female' | 'Other';
  selfReportedMeds: string;
  allergies: string;
  medicalConditions: string;
  heightFt?: number;
  heightIn?: number;
  weightLbs?: number;
  goalWeightLbs?: number;
  patientPreference: BelugaPatientPreference[];
  campaignId: string;
}

export interface BelugaIntakeResponse {
  success: boolean;
  patientId?: string;
  intakeId?: string;
  message?: string;
  errors?: Record<string, string[]>;
}

// Webhook payload Beluga sends to your endpoint when an Rx is written
export interface BelugaWebhookPayload {
  event: 'prescription.written' | 'prescription.denied' | 'consultation.completed' | 'prescription.refill';
  patientId: string;
  intakeId: string;
  prescription?: {
    id: string;
    medicationName: string;
    strength: string;
    quantity: number;
    refills: number;
    directions: string;
    writtenAt: string;   // ISO timestamp
    physicianName: string;
    pharmacyName?: string;
    trackingNumber?: string;
  };
  denialReason?: string;
  consultationId?: string;
}

// What we store in Supabase
export interface ClinicalIntake {
  id: string;
  userId: string;
  planId: string;
  belugaPatientId?: string;
  belugaIntakeId?: string;
  status: 'submitted' | 'under_review' | 'approved' | 'denied' | 'needs_info';
  prescriptionId?: string;
  quizAnswers: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// Map our plan IDs to Beluga medicine IDs (fill in real IDs from Beluga portal)
export const BELUGA_MED_PREFERENCES: Record<string, BelugaPatientPreference[]> = {
  semaglutide: [{
    name: 'Semaglutide',
    strength: '2.5mg/0.5ml',
    quantity: 4,
    refills: 2,
    medId: process.env.BELUGA_MED_ID_SEMAGLUTIDE || 'med_semaglutide_placeholder',
  }],
  total: [
    {
      name: 'Semaglutide',
      strength: '5mg/1ml',
      quantity: 4,
      refills: 2,
      medId: process.env.BELUGA_MED_ID_SEMAGLUTIDE || 'med_semaglutide_placeholder',
    },
    {
      name: 'MIC/B12 Lipotropic',
      strength: '1ml',
      quantity: 4,
      refills: 2,
      medId: process.env.BELUGA_MED_ID_MICB12 || 'med_micb12_placeholder',
    },
  ],
  metabolic: [{
    name: 'MIC/B12 Lipotropic',
    strength: '1ml',
    quantity: 4,
    refills: 2,
    medId: process.env.BELUGA_MED_ID_MICB12 || 'med_micb12_placeholder',
  }],
};
