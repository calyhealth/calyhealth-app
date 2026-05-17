'use client';

import { useReducer, useState, useCallback } from 'react';
import { quizReducer, initialState } from '@/lib/quiz/state';
import { computeEligibility, calcBMI, imperialToMetric, bmiCategory, bmiMarkerPercent } from '@/lib/quiz/eligibility';
import type { QuizState, QuizAction, ScreenId } from '@/lib/quiz/types';

// ── Shared primitives ─────────────────────────────────────────────────────

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: 'var(--white)', border: '1px solid var(--border)',
      borderRadius: 3, padding: '2.5rem 2.75rem',
      animation: 'fadeUp 0.2s ease both',
    }}>
      {children}
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: '0.68rem', fontWeight: 500, letterSpacing: '0.12em',
      textTransform: 'uppercase' as const, color: 'var(--gold)', marginBottom: '0.75rem',
    }}>{children}</div>
  );
}

function QuestionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      fontFamily: "'Cormorant Garamond', Georgia, serif",
      fontSize: 'clamp(1.5rem, 3vw, 1.95rem)', fontWeight: 500,
      color: 'var(--teal-dark)', lineHeight: 1.2, marginBottom: '0.5rem',
      letterSpacing: '-0.02em',
    }}>{children}</h2>
  );
}

function QuestionSub({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 300,
      marginBottom: '1.75rem', lineHeight: 1.6,
    }}>{children}</p>
  );
}

function ChoiceCard({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '1rem 1.25rem',
      border: `1.5px solid ${selected ? 'var(--teal-mid)' : 'var(--border)'}`,
      borderRadius: 3, cursor: 'pointer',
      background: selected ? 'var(--teal-faint)' : 'var(--cream)',
      color: selected ? 'var(--teal-mid)' : 'var(--body-text)',
      fontWeight: selected ? 500 : 400, fontSize: '0.92rem',
      transition: 'all 0.15s', userSelect: 'none' as const,
    }}>
      <div style={{
        width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
        border: `1.5px solid ${selected ? 'var(--teal-mid)' : 'var(--border)'}`,
        background: selected ? 'var(--teal-mid)' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {selected && <CheckIcon />}
      </div>
      {label}
    </div>
  );
}

function TagCard({ label, selected, isNone, onClick }: {
  label: string; selected: boolean; isNone?: boolean; onClick: () => void;
}) {
  const isActive = selected && !isNone;
  return (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0.875rem 1.25rem',
      border: `1.5px ${isNone ? 'dashed' : 'solid'} ${isActive ? 'var(--teal-mid)' : 'var(--border)'}`,
      borderRadius: 3, cursor: 'pointer',
      background: isActive ? 'var(--teal-faint)' : 'var(--cream)',
      transition: 'all 0.15s', userSelect: 'none' as const,
    }}>
      <span style={{ fontSize: '0.88rem', color: isActive ? 'var(--teal-mid)' : 'var(--body-text)', fontWeight: isActive ? 500 : 400 }}>
        {label}
      </span>
      <div style={{
        width: 18, height: 18, borderRadius: 2, flexShrink: 0,
        border: `1.5px solid ${isActive ? 'var(--teal-mid)' : 'var(--border)'}`,
        background: isActive ? 'var(--teal-mid)' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {isActive && <CheckIcon size={9} />}
      </div>
    </div>
  );
}

function CheckIcon({ size = 10 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none">
      <polyline points="2,6 5,9 10,3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CardFooter({ onBack, onContinue, continueDisabled, continueLabel = 'Continue' }: {
  onBack?: () => void;
  onContinue: () => void;
  continueDisabled?: boolean;
  continueLabel?: string;
}) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)',
    }}>
      {onBack
        ? <button onClick={onBack} style={btnBackStyle}>← Back</button>
        : <span />
      }
      <button onClick={onContinue} disabled={continueDisabled} style={{
        ...btnContinueStyle,
        opacity: continueDisabled ? 0.4 : 1,
        cursor: continueDisabled ? 'not-allowed' : 'pointer',
      }}>
        {continueLabel} →
      </button>
    </div>
  );
}

function FieldInput({ label, type = 'number', value, onChange, placeholder, min, max }: {
  label: string; type?: string; value: string;
  onChange: (v: string) => void;
  placeholder?: string; min?: number; max?: number;
}) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--charcoal)', letterSpacing: '0.04em', textTransform: 'uppercase' as const, marginBottom: '0.45rem' }}>
        {label}
      </label>
      <input
        type={type} value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        min={min} max={max}
        style={{
          width: '100%', padding: '0.8rem 1rem', fontSize: '1rem',
          fontFamily: 'inherit', border: '1.5px solid var(--border)', borderRadius: 3,
          background: 'var(--cream)', color: 'var(--body-text)', outline: 'none',
          MozAppearance: 'textfield' as unknown as undefined,
        }}
      />
    </div>
  );
}

// ── Progress bar ──────────────────────────────────────────────────────────

const SECTION_MAP: Partial<Record<ScreenId, string>> = {
  'age':               'Section 1 of 4: About You',
  'biometric':         'Section 1 of 4: About You',
  'bmi-gate':          'Section 1 of 4: About You',
  'comorbidities':     'Section 2 of 4: Medical History',
  'contraindications': 'Section 2 of 4: Medical History',
  'pregnancy-kidney':  'Section 2 of 4: Medical History',
  'medications':       'Section 3 of 4: Medications',
  'other-meds':        'Section 3 of 4: Medications',
  'eating-disorder':   'Section 4 of 4: Lifestyle',
  'lifestyle':         'Section 4 of 4: Lifestyle',
  'history':           'Section 4 of 4: Lifestyle',
};

const STEP_MAP: Partial<Record<ScreenId, number>> = {
  'age': 1, 'biometric': 2, 'bmi-gate': 3,
  'comorbidities': 4, 'contraindications': 5, 'pregnancy-kidney': 6,
  'medications': 7, 'other-meds': 8,
  'eating-disorder': 9, 'lifestyle': 10, 'history': 11,
};

function ProgressBar({ screen }: { screen: ScreenId }) {
  const section = SECTION_MAP[screen];
  const step = STEP_MAP[screen];
  if (!section || !step) return null;
  const pct = Math.round((step / 11) * 100);
  return (
    <div style={{ marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
        <span style={{ fontSize: '0.72rem', fontWeight: 500, color: 'var(--teal-mid)', letterSpacing: '0.1em', textTransform: 'uppercase' as const }}>
          {section}
        </span>
        <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>Step {step} of 11</span>
      </div>
      <div style={{ height: 3, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: 'var(--gold)', borderRadius: 2, transition: 'width 0.4s ease' }} />
      </div>
    </div>
  );
}

// ── Screen components ─────────────────────────────────────────────────────

function WelcomeScreen({ goTo }: { goTo: (s: ScreenId) => void }) {
  return (
    <Card>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--teal-faint)', border: '1px solid rgba(178,212,212,0.6)', borderRadius: 20, padding: '0.3rem 0.875rem', fontSize: '0.7rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'var(--teal-mid)', marginBottom: '1.25rem' }}>
        ✦ Medical Assessment
      </div>
      <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 500, color: 'var(--teal-dark)', lineHeight: 1.12, marginBottom: '0.75rem', letterSpacing: '-0.025em' }}>
        Is GLP-1 treatment <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>right for you?</em>
      </h1>
      <p style={{ fontSize: '0.88rem', color: 'var(--muted)', fontWeight: 300, lineHeight: 1.75, marginBottom: '1.75rem' }}>
        Answer a few questions and a Calyhealth physician will personally review your case. No obligation. Takes about 3 minutes.
      </p>
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        {[
          ['✓', 'US-licensed physicians'],
          ['🔒', 'HIPAA compliant'],
          ['◷', 'Doctor review within 24 hrs'],
        ].map(([icon, label]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '0.76rem', color: 'var(--body-text)' }}>
            <span style={{ color: 'var(--teal-mid)' }}>{icon}</span> {label}
          </div>
        ))}
      </div>
      <button onClick={() => goTo('age')} style={{ ...btnPrimaryFullStyle }}>
        Start My Assessment →
      </button>
      <p style={{ fontSize: '0.73rem', color: 'var(--muted)', lineHeight: 1.55, borderTop: '1px solid var(--border)', paddingTop: '1.25rem', marginTop: '1.25rem' }}>
        This assessment collects health information to assess your suitability for treatment. Your data is encrypted, never sold, and only shared with your assigned physician.
      </p>
    </Card>
  );
}

function AgeScreen({ state, dispatch, goTo, goBack }: ScreenProps) {
  const val = state.answers.age_confirmed;
  return (
    <Card>
      <Eyebrow>About You</Eyebrow>
      <QuestionTitle>Are you 18 years of age or older?</QuestionTitle>
      <QuestionSub>GLP-1 treatment is currently available to adults only.</QuestionSub>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        <ChoiceCard label="Yes, I am 18 or older" selected={val === true}
          onClick={() => dispatch({ type: 'PATCH', patch: { age_confirmed: true } })} />
        <ChoiceCard label="No, I am under 18" selected={val === false}
          onClick={() => { dispatch({ type: 'PATCH', patch: { age_confirmed: false } }); goTo('ineligible-age'); }} />
      </div>
      <CardFooter onBack={goBack} onContinue={() => goTo('biometric')} continueDisabled={val !== true} />
    </Card>
  );
}

function BiometricScreen({ state, dispatch, goTo, goBack }: ScreenProps) {
  const { unit, heightFt, heightIn, weightLbs, heightCm, weightKg } = state;

  function getBMI(): number | null {
    if (unit === 'imperial') {
      const ft = parseFloat(heightFt), inches = parseFloat(heightIn) || 0, lbs = parseFloat(weightLbs);
      if (!ft || !lbs) return null;
      const { heightCm: hCm, weightKg: wKg } = imperialToMetric(ft, inches, lbs);
      return calcBMI(hCm, wKg);
    }
    const hCm = parseFloat(heightCm), wKg = parseFloat(weightKg);
    if (!hCm || !wKg) return null;
    return calcBMI(hCm, wKg);
  }

  const bmi = getBMI();
  const canContinue = bmi !== null && bmi > 10 && bmi < 70;

  function handleContinue() {
    if (!bmi) return;
    let hCm: number, wKg: number;
    if (unit === 'imperial') {
      const r = imperialToMetric(parseFloat(heightFt), parseFloat(heightIn) || 0, parseFloat(weightLbs));
      hCm = r.heightCm; wKg = r.weightKg;
    } else {
      hCm = parseFloat(heightCm); wKg = parseFloat(weightKg);
    }
    dispatch({ type: 'COMMIT_BMI', bmi, heightCm: hCm, weightKg: wKg });
    dispatch({ type: 'PATCH', patch: { age_over_65: false } }); // will be set if they entered an age; we don't ask age number
    goTo('bmi-gate');
  }

  return (
    <Card>
      <Eyebrow>About You</Eyebrow>
      <QuestionTitle>What is your height and weight?</QuestionTitle>
      <QuestionSub>We use this to calculate your BMI and check clinical eligibility thresholds.</QuestionSub>

      {/* Unit toggle */}
      <div style={{ display: 'inline-flex', border: '1.5px solid var(--border)', borderRadius: 3, overflow: 'hidden', marginBottom: '1.5rem' }}>
        {(['imperial', 'metric'] as const).map(u => (
          <button key={u} onClick={() => dispatch({ type: 'SET_UNIT', unit: u })} style={{
            padding: '0.45rem 1rem', fontSize: '0.75rem', fontWeight: 500,
            letterSpacing: '0.06em', textTransform: 'uppercase' as const, cursor: 'pointer',
            border: 'none', fontFamily: 'inherit',
            background: unit === u ? 'var(--teal-mid)' : 'var(--cream)',
            color: unit === u ? 'var(--white)' : 'var(--muted)',
            transition: 'all 0.15s',
          }}>{u}</button>
        ))}
      </div>

      {unit === 'imperial' ? (
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 100 }}>
            <FieldInput label="Height — Feet" value={heightFt} placeholder="5" min={4} max={7}
              onChange={v => dispatch({ type: 'SET_IMPERIAL', heightFt: v, heightIn, weightLbs })} />
          </div>
          <div style={{ width: 90 }}>
            <FieldInput label="Inches" value={heightIn} placeholder="6" min={0} max={11}
              onChange={v => dispatch({ type: 'SET_IMPERIAL', heightFt, heightIn: v, weightLbs })} />
          </div>
          <div style={{ flex: 1, minWidth: 100 }}>
            <FieldInput label="Weight — lbs" value={weightLbs} placeholder="185" min={80} max={600}
              onChange={v => dispatch({ type: 'SET_IMPERIAL', heightFt, heightIn, weightLbs: v })} />
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ flex: 1 }}>
            <FieldInput label="Height — cm" value={heightCm} placeholder="170" min={120} max={220}
              onChange={v => dispatch({ type: 'SET_METRIC', heightCm: v, weightKg })} />
          </div>
          <div style={{ flex: 1 }}>
            <FieldInput label="Weight — kg" value={weightKg} placeholder="85" min={40} max={300}
              onChange={v => dispatch({ type: 'SET_METRIC', heightCm, weightKg: v })} />
          </div>
        </div>
      )}

      {bmi && bmi > 10 && bmi < 70 && (
        <div style={{ background: 'var(--gold-faint)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 3, padding: '0.875rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div>
            <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '2.4rem', fontWeight: 500, color: 'var(--teal-dark)', lineHeight: 1 }}>{bmi}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 2 }}>Your BMI</div>
          </div>
          <div style={{ flex: 1, borderLeft: '1px solid rgba(201,168,76,0.3)', paddingLeft: '1rem' }}>
            <div style={{ fontSize: '0.82rem', color: 'var(--body-text)', fontWeight: 400 }}>{bmiCategory(bmi)}</div>
          </div>
        </div>
      )}

      <CardFooter onBack={goBack} onContinue={handleContinue} continueDisabled={!canContinue} />
    </Card>
  );
}

function BmiGateScreen({ state, goTo, goBack }: ScreenProps) {
  const bmi = state.bmi ?? state.answers.bmi ?? 0;
  const cat = bmiCategory(bmi);
  const markerPct = bmiMarkerPercent(bmi);

  let insight = '';
  if (bmi < 27) insight = 'Your BMI is below the eligibility threshold of 27. We\'ll complete your assessment — a doctor can discuss options with you.';
  else if (bmi < 30) insight = 'Your BMI is in the 27–30 range. GLP-1 may be appropriate if you have at least one qualifying health condition. We\'ll ask about those next.';
  else insight = 'Your BMI places you in the range where GLP-1 treatment is clinically indicated. We\'ll ask a few more questions to confirm suitability.';

  return (
    <Card>
      <Eyebrow>Your BMI</Eyebrow>
      <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '5rem', fontWeight: 500, color: 'var(--teal-dark)', lineHeight: 1, marginBottom: '0.25rem' }}>{bmi}</div>
      <div style={{ fontSize: '0.78rem', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: 'var(--gold)', marginBottom: '1.25rem' }}>{cat}</div>

      {/* BMI scale */}
      <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
        <div style={{ height: 8, borderRadius: 4, background: 'linear-gradient(to right, #93c5fd 0%, #86efac 25%, #fde68a 50%, #fca5a5 80%, #f87171 100%)' }} />
        <div style={{
          position: 'absolute', top: -4, left: `${markerPct}%`,
          width: 16, height: 16, borderRadius: '50%',
          background: 'var(--teal-mid)', border: '2px solid white',
          boxShadow: '0 1px 4px rgba(0,0,0,0.2)', transform: 'translateX(-50%)',
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--muted)', marginBottom: '1.25rem' }}>
        {['16', '18.5', '25', '30', '40+'].map(l => <span key={l}>{l}</span>)}
      </div>

      <div style={{ background: 'var(--teal-faint)', borderLeft: '3px solid var(--teal-mid)', borderRadius: '0 3px 3px 0', padding: '0.875rem 1.25rem', fontSize: '0.84rem', color: 'var(--body-text)', fontWeight: 300, lineHeight: 1.65 }}>
        {insight}
      </div>

      <CardFooter onBack={goBack} onContinue={() => goTo('comorbidities')} />
    </Card>
  );
}

function ComorbiditiesScreen({ state, dispatch, goTo, goBack }: ScreenProps) {
  const selected = state.answers.comorbidities ?? [];
  const isNoneSelected = selected.length === 0 && state.answers.comorbidities !== undefined;
  const hasSelection = selected.length > 0 || isNoneSelected;

  const options = [
    'Type 2 diabetes or pre-diabetes',
    'High blood pressure (hypertension)',
    'High cholesterol (hypercholesterolaemia)',
    'Fatty liver disease (NAFLD / MAFLD)',
    'Obstructive sleep apnoea',
    'Polycystic ovary syndrome (PCOS)',
    'Family history of heart attack or stroke before age 60',
  ];

  return (
    <Card>
      <Eyebrow>Medical History</Eyebrow>
      <QuestionTitle>Have you been diagnosed by a doctor with any of the following?</QuestionTitle>
      <QuestionSub>Select all that apply. Only include conditions confirmed by a physician.</QuestionSub>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {options.map(opt => (
          <TagCard key={opt} label={opt} selected={selected.includes(opt)}
            onClick={() => dispatch({ type: 'TOGGLE_COMORBIDITY', value: opt })} />
        ))}
        <TagCard label="None of the above" isNone selected={isNoneSelected}
          onClick={() => dispatch({ type: 'CLEAR_COMORBIDITIES' })} />
      </div>
      <CardFooter onBack={goBack} onContinue={() => goTo('contraindications')} continueDisabled={!hasSelection} />
    </Card>
  );
}

function ContraindicationsScreen({ state, dispatch, goTo, goBack }: ScreenProps) {
  const selected = state.answers.contraindications ?? [];
  const isNoneSelected = selected.length === 0 && state.answers.contraindications !== undefined;
  const hasSelection = selected.length > 0 || isNoneSelected;

  const options = [
    'Medullary thyroid cancer — personal history',
    'Medullary thyroid cancer — family member',
    'MEN2 syndrome (multiple endocrine neoplasia type 2) — personal',
    'MEN2 syndrome — family member',
    'History of pancreatitis',
    'Gallbladder disease or gallstones',
  ];

  function handleContinue() {
    const personalBlock = ['Medullary thyroid cancer — personal history', 'MEN2 syndrome (multiple endocrine neoplasia type 2) — personal'];
    const hasHardBlock = selected.some(c => personalBlock.includes(c));
    if (hasHardBlock) {
      const result = computeEligibility(state.answers);
      dispatch({ type: 'SET_ELIGIBILITY', result });
      goTo('result');
    } else {
      goTo('pregnancy-kidney');
    }
  }

  return (
    <Card>
      <Eyebrow>Medical History</Eyebrow>
      <QuestionTitle>Do you have a personal or family history of any of the following?</QuestionTitle>
      <QuestionSub>These are important safety checks. Your answers are confidential.</QuestionSub>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {options.map(opt => (
          <TagCard key={opt} label={opt} selected={selected.includes(opt)}
            onClick={() => dispatch({ type: 'TOGGLE_CONTRAINDICATION', value: opt })} />
        ))}
        <TagCard label="None of the above" isNone selected={isNoneSelected}
          onClick={() => dispatch({ type: 'CLEAR_CONTRAINDICATIONS' })} />
      </div>
      <CardFooter onBack={goBack} onContinue={handleContinue} continueDisabled={!hasSelection} />
    </Card>
  );
}

function PregnancyKidneyScreen({ state, dispatch, goTo, goBack }: ScreenProps) {
  const preg = state.answers.pregnant_or_breastfeeding;
  const kidney = state.answers.esrd_or_dialysis;
  const canContinue = preg !== undefined && kidney !== undefined;

  function handleContinue() {
    if (preg || kidney) {
      const result = computeEligibility(state.answers);
      dispatch({ type: 'SET_ELIGIBILITY', result });
      goTo('result');
    } else {
      goTo('medications');
    }
  }

  return (
    <Card>
      <Eyebrow>Medical History</Eyebrow>

      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.2rem', fontWeight: 500, color: 'var(--teal-dark)', marginBottom: '0.75rem', letterSpacing: '-0.01em' }}>
          Are you currently pregnant, trying to conceive, or breastfeeding?
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <ChoiceCard label="Yes" selected={preg === true}
            onClick={() => dispatch({ type: 'PATCH', patch: { pregnant_or_breastfeeding: true } })} />
          <ChoiceCard label="No" selected={preg === false}
            onClick={() => dispatch({ type: 'PATCH', patch: { pregnant_or_breastfeeding: false } })} />
        </div>
      </div>

      <div>
        <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.2rem', fontWeight: 500, color: 'var(--teal-dark)', marginBottom: '0.75rem', letterSpacing: '-0.01em' }}>
          Are you currently on dialysis, or have you been told you have end-stage kidney disease?
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <ChoiceCard label="Yes" selected={kidney === true}
            onClick={() => dispatch({ type: 'PATCH', patch: { esrd_or_dialysis: true } })} />
          <ChoiceCard label="No" selected={kidney === false}
            onClick={() => dispatch({ type: 'PATCH', patch: { esrd_or_dialysis: false } })} />
        </div>
      </div>

      <CardFooter onBack={goBack} onContinue={handleContinue} continueDisabled={!canContinue} />
    </Card>
  );
}

function MedicationsScreen({ state, dispatch, goTo, goBack }: ScreenProps) {
  const insulin = state.answers.on_insulin;
  const gliptin = state.answers.on_gliptin;
  const canContinue = insulin !== undefined && gliptin !== undefined;

  return (
    <Card>
      <Eyebrow>Medications</Eyebrow>
      <QuestionTitle>Are you currently taking any of the following?</QuestionTitle>
      <QuestionSub>These medications have known interactions with GLP-1 treatment.</QuestionSub>

      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.2rem', fontWeight: 500, color: 'var(--teal-dark)', marginBottom: '0.75rem', letterSpacing: '-0.01em' }}>
          Insulin (any type)
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <ChoiceCard label="Yes" selected={insulin === true} onClick={() => dispatch({ type: 'PATCH', patch: { on_insulin: true } })} />
          <ChoiceCard label="No" selected={insulin === false} onClick={() => dispatch({ type: 'PATCH', patch: { on_insulin: false } })} />
        </div>
      </div>

      <div>
        <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.2rem', fontWeight: 500, color: 'var(--teal-dark)', marginBottom: '0.35rem', letterSpacing: '-0.01em' }}>
          Any of these diabetes medications?
        </div>
        <p style={{ fontSize: '0.78rem', color: 'var(--muted)', marginBottom: '0.75rem', fontWeight: 300 }}>
          Sitagliptin · Saxagliptin · Linagliptin · Alogliptin · Vildagliptin
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <ChoiceCard label="Yes" selected={gliptin === true} onClick={() => dispatch({ type: 'PATCH', patch: { on_gliptin: true } })} />
          <ChoiceCard label="No" selected={gliptin === false} onClick={() => dispatch({ type: 'PATCH', patch: { on_gliptin: false } })} />
        </div>
      </div>

      <CardFooter onBack={goBack} onContinue={() => goTo('other-meds')} continueDisabled={!canContinue} />
    </Card>
  );
}

function OtherMedsScreen({ state, dispatch, goTo, goBack }: ScreenProps) {
  return (
    <Card>
      <Eyebrow>Medications</Eyebrow>
      <QuestionTitle>
        Any other medications?{' '}
        <span style={{ fontSize: '0.68rem', fontWeight: 400, color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase' as const, verticalAlign: 'middle' }}>Optional</span>
      </QuestionTitle>
      <QuestionSub>List any other prescription or over-the-counter medications you take regularly. Your reviewing physician will factor these in.</QuestionSub>
      <textarea
        value={state.answers.other_medications ?? ''}
        onChange={e => dispatch({ type: 'PATCH', patch: { other_medications: e.target.value } })}
        placeholder="e.g. metformin 500mg, lisinopril 10mg, aspirin…"
        style={{ width: '100%', padding: '0.875rem 1rem', fontSize: '0.9rem', fontFamily: 'inherit', border: '1.5px solid var(--border)', borderRadius: 3, background: 'var(--cream)', color: 'var(--body-text)', outline: 'none', resize: 'vertical', minHeight: 100, lineHeight: 1.6 }}
      />
      <CardFooter onBack={goBack} onContinue={() => goTo('eating-disorder')} />
    </Card>
  );
}

function EatingDisorderScreen({ state, dispatch, goTo, goBack }: ScreenProps) {
  const val = state.answers.eating_disorder_history;
  return (
    <Card>
      <Eyebrow>Lifestyle</Eyebrow>
      <QuestionTitle>Have you ever had a difficult relationship with food?</QuestionTitle>
      <QuestionSub>
        This includes being diagnosed with an eating disorder, or experiencing patterns like restricting food, purging, or episodes of binge eating.
      </QuestionSub>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        <ChoiceCard label="Yes" selected={val === true} onClick={() => dispatch({ type: 'PATCH', patch: { eating_disorder_history: true } })} />
        <ChoiceCard label="No" selected={val === false} onClick={() => dispatch({ type: 'PATCH', patch: { eating_disorder_history: false } })} />
      </div>
      <CardFooter onBack={goBack} onContinue={() => goTo('lifestyle')} continueDisabled={val === undefined} />
    </Card>
  );
}

function LifestyleScreen({ state, dispatch, goTo, goBack }: ScreenProps) {
  const alcohol = state.answers.alcohol_weekly;
  const exercise = state.answers.exercise_frequency;
  const canContinue = alcohol !== undefined && exercise !== undefined;

  const alcoholOpts: { value: typeof alcohol; label: string }[] = [
    { value: 'none',  label: 'None' },
    { value: '1-7',  label: '1 – 7 drinks per week' },
    { value: '8-14', label: '8 – 14 drinks per week' },
    { value: '15+',  label: '15 or more drinks per week' },
  ];
  const exerciseOpts: { value: typeof exercise; label: string }[] = [
    { value: 'sedentary', label: 'Rarely or never' },
    { value: 'light',     label: 'Light — 1–2 times a week' },
    { value: 'moderate',  label: 'Moderate — 3–4 times a week' },
    { value: 'active',    label: 'Active — 5 or more times a week' },
  ];

  return (
    <Card>
      <Eyebrow>Lifestyle</Eyebrow>
      <QuestionTitle>Tell us a little about your lifestyle.</QuestionTitle>
      <QuestionSub>This helps your doctor personalise your treatment plan.</QuestionSub>

      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.2rem', fontWeight: 500, color: 'var(--teal-dark)', marginBottom: '0.75rem', letterSpacing: '-0.01em' }}>
          How many alcoholic drinks do you have per week on average?
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {alcoholOpts.map(o => (
            <ChoiceCard key={o.value} label={o.label} selected={alcohol === o.value}
              onClick={() => dispatch({ type: 'PATCH', patch: { alcohol_weekly: o.value } })} />
          ))}
        </div>
      </div>

      <div>
        <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.2rem', fontWeight: 500, color: 'var(--teal-dark)', marginBottom: '0.75rem', letterSpacing: '-0.01em' }}>
          How often do you exercise?
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {exerciseOpts.map(o => (
            <ChoiceCard key={o.value} label={o.label} selected={exercise === o.value}
              onClick={() => dispatch({ type: 'PATCH', patch: { exercise_frequency: o.value } })} />
          ))}
        </div>
      </div>

      <CardFooter onBack={goBack} onContinue={() => goTo('history')} continueDisabled={!canContinue} />
    </Card>
  );
}

function HistoryScreen({ state, dispatch, goTo, goBack }: ScreenProps) {
  const selected = state.answers.prior_weight_loss_attempts ?? [];
  const isNoneSelected = selected.length === 0 && state.answers.prior_weight_loss_attempts !== undefined;
  const hasSelection = selected.length > 0 || isNoneSelected;

  const options = [
    'Diet or calorie restriction',
    'Structured exercise programme',
    'Weight loss medication (prescription or OTC)',
    'Meal replacement programme (e.g. Optifast, SlimFast)',
    'Bariatric surgery (gastric bypass, sleeve, band)',
  ];

  function handleContinue() {
    const result = computeEligibility(state.answers);
    dispatch({ type: 'SET_ELIGIBILITY', result });
    goTo('result');
  }

  return (
    <Card>
      <Eyebrow>Lifestyle</Eyebrow>
      <QuestionTitle>Which weight loss approaches have you tried before?</QuestionTitle>
      <QuestionSub>Select all that apply. This helps your physician understand your history.</QuestionSub>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {options.map(opt => (
          <TagCard key={opt} label={opt} selected={selected.includes(opt)}
            onClick={() => dispatch({ type: 'TOGGLE_WL_ATTEMPT', value: opt })} />
        ))}
        <TagCard label="None — this would be my first attempt" isNone selected={isNoneSelected}
          onClick={() => dispatch({ type: 'CLEAR_WL_ATTEMPTS' })} />
      </div>
      <CardFooter onBack={goBack} onContinue={handleContinue} continueDisabled={!hasSelection} continueLabel="See My Result" />
    </Card>
  );
}

function ResultScreen({ state, goTo }: ScreenProps) {
  const result = state.eligibilityResult;
  if (!result) return null;
  const { outcome, ineligibleReason, softFlags } = result;

  if (outcome === 'ineligible') {
    return (
      <Card>
        <ResultBadge outcome="ineligible" />
        <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', fontWeight: 500, color: 'var(--teal-dark)', lineHeight: 1.15, marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
          GLP-1 treatment isn&apos;t right for you right now.
        </h2>
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 3, padding: '1rem 1.25rem', fontSize: '0.84rem', color: '#991b1b', lineHeight: 1.6, marginBottom: '1.25rem' }}>
          {ineligibleReason}
        </div>
        <p style={{ fontSize: '0.88rem', color: 'var(--muted)', fontWeight: 300, lineHeight: 1.75, marginBottom: '1.25rem' }}>
          We recommend discussing weight management options with your GP or specialist, who can suggest safe and appropriate alternatives for your situation.
        </p>
        <EmailCaptureSmall label="Leave your email and we'll notify you if new options become available." />
      </Card>
    );
  }

  const isReview = outcome === 'review';
  return (
    <Card>
      <ResultBadge outcome={outcome} />
      <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', fontWeight: 500, color: 'var(--teal-dark)', lineHeight: 1.15, marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
        {isReview
          ? 'A doctor needs to look at your case more closely.'
          : 'You may be a suitable candidate for GLP-1 treatment.'}
      </h2>
      <p style={{ fontSize: '0.9rem', color: 'var(--muted)', fontWeight: 300, lineHeight: 1.75, marginBottom: '1.75rem' }}>
        {isReview
          ? <>Your answers include some factors that a physician should review before making a recommendation. This is <strong style={{ color: 'var(--body-text)', fontWeight: 500 }}>not a rejection</strong> — it simply means your case deserves more careful clinical consideration.</>
          : <>Based on your answers, your profile meets the clinical criteria for GLP-1 therapy. <strong style={{ color: 'var(--body-text)', fontWeight: 500 }}>A Calyhealth physician will personally review your case</strong> before any prescription is issued.</>}
      </p>

      {isReview && softFlags.length > 0 && (
        <div style={{ background: 'var(--gold-faint)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 3, padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 500, color: '#8a6a1a', letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: '0.5rem' }}>Items flagged for review</div>
          <ul style={{ margin: 0, padding: '0 0 0 1.1rem' }}>
            {softFlags.map(f => <li key={f} style={{ fontSize: '0.8rem', color: 'var(--body-text)', marginBottom: '0.25rem' }}>{f}</li>)}
          </ul>
        </div>
      )}

      <ResultSteps />
      <button onClick={() => goTo('contact')} style={btnPrimaryFullStyle}>Submit My Assessment →</button>
    </Card>
  );
}

function ResultBadge({ outcome }: { outcome: 'eligible' | 'review' | 'ineligible' }) {
  const config = {
    eligible:   { bg: 'var(--teal-faint)',  color: 'var(--teal-mid)',  label: 'Likely Eligible' },
    review:     { bg: 'var(--gold-faint)',   color: '#8a6a1a',          label: 'Physician Review Required' },
    ineligible: { bg: '#fef2f2',            color: '#b91c1c',           label: 'Not Eligible at This Time' },
  }[outcome];

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: config.bg, borderRadius: 20, padding: '0.35rem 0.875rem', fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: config.color, marginBottom: '1.25rem' }}>
      ● {config.label}
    </div>
  );
}

function ResultSteps() {
  const steps = [
    { label: 'Enter your name and email to submit your assessment', sub: 'Takes 30 seconds — no account required' },
    { label: 'A physician reviews your case', sub: 'Within 24 hours, you\'ll hear back by email' },
    { label: 'If approved, we send treatment options and pricing', sub: 'No obligation to proceed' },
  ];
  return (
    <div style={{ background: 'var(--cream)', borderRadius: 3, padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
      {steps.map((s, i) => (
        <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '0.6rem 0', borderBottom: i < steps.length - 1 ? '1px solid var(--border)' : 'none' }}>
          <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--teal-mid)', color: 'white', fontSize: '0.68rem', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
          <div>
            <div style={{ fontSize: '0.82rem', color: 'var(--body-text)', fontWeight: 400, lineHeight: 1.5 }}>{s.label}</div>
            <div style={{ fontSize: '0.76rem', color: 'var(--muted)', marginTop: 1 }}>{s.sub}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmailCaptureSmall({ label }: { label: string }) {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  return done ? (
    <p style={{ fontSize: '0.82rem', color: 'var(--teal-mid)', fontWeight: 400 }}>✓ We&apos;ll be in touch.</p>
  ) : (
    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
      <p style={{ fontSize: '0.78rem', color: 'var(--muted)', marginBottom: '0.75rem', fontWeight: 300 }}>{label}</p>
      <div style={{ display: 'flex', gap: '0.65rem' }}>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com"
          style={{ flex: 1, padding: '0.75rem 1rem', fontSize: '0.9rem', fontFamily: 'inherit', border: '1.5px solid var(--border)', borderRadius: 3, background: 'var(--cream)', color: 'var(--body-text)', outline: 'none' }} />
        <button onClick={() => email && setDone(true)} style={{ ...btnContinueStyle, flexShrink: 0 }}>Notify me</button>
      </div>
    </div>
  );
}

function ContactScreen({ state, dispatch, goTo, goBack }: ScreenProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [email, setEmail]         = useState('');
  const [hipaa, setHipaa]         = useState(false);
  const [error, setError]         = useState('');

  const canSubmit = firstName.trim() && lastName.trim() && email.includes('@') && hipaa;

  async function handleSubmit() {
    if (!canSubmit) return;
    setError('');
    dispatch({ type: 'SET_SUBMITTING', value: true });
    try {
      const res = await fetch('/api/clinical/submit-intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizAnswers: state.answers,
          eligibilityResult: state.eligibilityResult,
          contact: { firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim() },
          hipaaConsentAt: new Date().toISOString(),
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || 'Submission failed');
      }
      goTo('confirm');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
      dispatch({ type: 'SET_SUBMIT_ERROR', error: error });
    } finally {
      dispatch({ type: 'SET_SUBMITTING', value: false });
    }
  }

  return (
    <Card>
      <Eyebrow>Almost There</Eyebrow>
      <QuestionTitle>Where should we send your results?</QuestionTitle>
      <QuestionSub>Your assessment will be submitted to a Calyhealth physician who will review your case within 24 hours.</QuestionSub>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 140 }}>
          <FieldInput label="First name" type="text" value={firstName} onChange={setFirstName} placeholder="Sarah" />
        </div>
        <div style={{ flex: 1, minWidth: 140 }}>
          <FieldInput label="Last name" type="text" value={lastName} onChange={setLastName} placeholder="Johnson" />
        </div>
      </div>
      <div style={{ marginBottom: '1.25rem' }}>
        <FieldInput label="Email address" type="email" value={email} onChange={setEmail} placeholder="sarah@example.com" />
      </div>

      {/* HIPAA consent */}
      <div style={{ border: '1px solid var(--border)', borderRadius: 3, padding: '1rem 1.25rem', background: 'var(--cream)', display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <input type="checkbox" checked={hipaa} onChange={e => setHipaa(e.target.checked)}
          style={{ width: 16, height: 16, marginTop: 2, accentColor: 'var(--teal-mid)', flexShrink: 0, cursor: 'pointer' }} />
        <p style={{ fontSize: '0.78rem', color: 'var(--muted)', lineHeight: 1.55, margin: 0 }}>
          I consent to Calyhealth collecting and processing my health information to assess my suitability for treatment. My data will only be shared with my assigned physician.
        </p>
      </div>

      {error && (
        <p style={{ fontSize: '0.82rem', color: '#b91c1c', marginBottom: '1rem' }}>{error}</p>
      )}

      <button onClick={handleSubmit} disabled={!canSubmit || state.submitting} style={{ ...btnPrimaryFullStyle, opacity: canSubmit ? 1 : 0.45, cursor: canSubmit ? 'pointer' : 'not-allowed' }}>
        {state.submitting ? 'Submitting…' : 'Submit My Assessment →'}
      </button>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
        <button onClick={goBack} style={btnBackStyle}>← Back</button>
        <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>No payment required</span>
      </div>
    </Card>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function ConfirmScreen(_props: { state: QuizState }) {
  return (
    <Card>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--teal-faint)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--teal-mid)" strokeWidth="2.5">
            <path d="M22 11.1V12a10 10 0 1 1-5.9-9.1" /><polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '2rem', fontWeight: 500, color: 'var(--teal-dark)', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>Assessment submitted.</h2>
        <p style={{ fontSize: '0.88rem', color: 'var(--muted)', fontWeight: 300, lineHeight: 1.7, maxWidth: 420, margin: '0 auto 2rem' }}>
          A Calyhealth physician will personally review your case and be in touch within 24 hours.
        </p>
      </div>
      <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 3, overflow: 'hidden', marginBottom: '1.75rem' }}>
        {[
          { time: 'Now', desc: 'Assessment submitted', active: true },
          { time: 'Within 24 hrs', desc: 'Physician reviews your case', active: false },
          { time: 'After approval', desc: 'Treatment options sent to you', active: false },
        ].map((s, i) => (
          <div key={i} style={{ flex: 1, padding: '1rem', textAlign: 'center' as const, background: s.active ? 'var(--teal-faint)' : 'var(--cream)', borderRight: i < 2 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: 'var(--gold)', marginBottom: '0.25rem' }}>{s.time}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--body-text)', lineHeight: 1.4 }}>{s.desc}</div>
          </div>
        ))}
      </div>
      <p style={{ fontSize: '0.78rem', color: 'var(--muted)', textAlign: 'center' as const, lineHeight: 1.6 }}>
        Check your email — we&apos;ve sent a confirmation with next steps.
      </p>
    </Card>
  );
}

function IneligibleAgeScreen({ goTo }: { goTo: (s: ScreenId) => void }) {
  return (
    <Card>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fef2f2', borderRadius: 20, padding: '0.35rem 0.875rem', fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#b91c1c', marginBottom: '1.25rem' }}>
        ● Not Eligible
      </div>
      <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', fontWeight: 500, color: 'var(--teal-dark)', lineHeight: 1.15, marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
        GLP-1 treatment is for adults only.
      </h2>
      <p style={{ fontSize: '0.88rem', color: 'var(--muted)', fontWeight: 300, lineHeight: 1.75, marginBottom: '1.5rem' }}>
        Calyhealth&apos;s GLP-1 programme is currently available to patients aged 18 and over. We recommend speaking with a paediatrician or family physician about age-appropriate weight management support.
      </p>
      <button onClick={() => goTo('welcome')} style={{ ...btnBackStyle, display: 'block', width: '100%', textAlign: 'center' as const }}>
        ← Start Over
      </button>
    </Card>
  );
}

// ── Shared props type ─────────────────────────────────────────────────────

interface ScreenProps {
  state: QuizState;
  dispatch: React.Dispatch<QuizAction>;
  goTo: (s: ScreenId) => void;
  goBack: () => void;
}

// ── Shared styles ─────────────────────────────────────────────────────────

const btnPrimaryFullStyle: React.CSSProperties = {
  width: '100%', background: 'var(--teal-mid)', color: 'var(--white)',
  border: 'none', padding: '1rem 1.75rem', fontFamily: 'inherit',
  fontSize: '0.82rem', fontWeight: 500, letterSpacing: '0.08em',
  textTransform: 'uppercase', cursor: 'pointer', borderRadius: 3,
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
};

const btnContinueStyle: React.CSSProperties = {
  background: 'var(--teal-mid)', color: 'var(--white)', border: 'none',
  padding: '0.875rem 1.75rem', fontFamily: 'inherit', fontSize: '0.78rem',
  fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase',
  cursor: 'pointer', borderRadius: 3, transition: 'background 0.15s',
};

const btnBackStyle: React.CSSProperties = {
  background: 'transparent', border: '1px solid var(--border)',
  color: 'var(--muted)', padding: '0.8rem 1.4rem', fontFamily: 'inherit',
  fontSize: '0.78rem', fontWeight: 400, letterSpacing: '0.05em',
  cursor: 'pointer', borderRadius: 3, transition: 'all 0.15s',
};

// ── Main page ─────────────────────────────────────────────────────────────

export default function QuizPage() {
  const [state, dispatch] = useReducer(quizReducer, initialState);

  const goTo = useCallback((screen: ScreenId) => {
    dispatch({ type: 'GO_TO', screen });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const goBack = useCallback(() => {
    dispatch({ type: 'BACK' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const props: ScreenProps = { state, dispatch, goTo, goBack };
  const screen = state.currentScreen;

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        input[type=number]::-webkit-outer-spin-button,
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        input[type=number] { -moz-appearance: textfield; }
      `}</style>
      <div style={{ minHeight: 'calc(100vh - 68px)', background: 'var(--cream)', padding: '2.5rem 1.25rem 5rem' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <ProgressBar screen={screen} />
          {screen === 'welcome'           && <WelcomeScreen goTo={goTo} />}
          {screen === 'age'               && <AgeScreen {...props} />}
          {screen === 'biometric'         && <BiometricScreen {...props} />}
          {screen === 'bmi-gate'          && <BmiGateScreen {...props} />}
          {screen === 'comorbidities'     && <ComorbiditiesScreen {...props} />}
          {screen === 'contraindications' && <ContraindicationsScreen {...props} />}
          {screen === 'pregnancy-kidney'  && <PregnancyKidneyScreen {...props} />}
          {screen === 'medications'       && <MedicationsScreen {...props} />}
          {screen === 'other-meds'        && <OtherMedsScreen {...props} />}
          {screen === 'eating-disorder'   && <EatingDisorderScreen {...props} />}
          {screen === 'lifestyle'         && <LifestyleScreen {...props} />}
          {screen === 'history'           && <HistoryScreen {...props} />}
          {screen === 'result'            && <ResultScreen {...props} />}
          {screen === 'contact'           && <ContactScreen {...props} />}
          {screen === 'confirm'           && <ConfirmScreen state={state} />}
          {screen === 'ineligible-age'    && <IneligibleAgeScreen goTo={goTo} />}
        </div>
      </div>
    </>
  );
}
