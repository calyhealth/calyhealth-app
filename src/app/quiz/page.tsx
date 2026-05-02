'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const US_STATES = ['Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming'];

const STEPS = [
  {
    id: 'basics',
    title: 'Let\'s start with the basics',
    subtitle: 'This information helps our physicians understand your health profile.',
    fields: [
      { id: 'age', label: 'What is your age?', type: 'number', placeholder: 'e.g. 42', min: 18, max: 80 },
      { id: 'sex', label: 'Biological sex', type: 'select', options: ['Female', 'Male', 'Prefer not to say'] },
      { id: 'state', label: 'Which state do you live in?', type: 'select', options: US_STATES },
    ],
  },
  {
    id: 'body',
    title: 'Tell us about your body',
    subtitle: 'We use this to calculate BMI and determine medication eligibility.',
    fields: [
      { id: 'height_ft', label: 'Height (feet)', type: 'number', placeholder: '5', min: 4, max: 7 },
      { id: 'height_in', label: 'Height (inches)', type: 'number', placeholder: '6', min: 0, max: 11 },
      { id: 'weight', label: 'Current weight (lbs)', type: 'number', placeholder: '185', min: 80, max: 500 },
      { id: 'goal_weight', label: 'Goal weight (lbs)', type: 'number', placeholder: '155', min: 80, max: 500 },
    ],
  },
  {
    id: 'health',
    title: 'Your health history',
    subtitle: 'Please answer honestly — this is reviewed by a licensed physician.',
    fields: [
      {
        id: 'conditions', label: 'Do you have any of the following? (select all that apply)',
        type: 'multicheck',
        options: ['Type 2 diabetes', 'High blood pressure', 'High cholesterol', 'Heart disease', 'Sleep apnea', 'None of the above'],
      },
      {
        id: 'medications', label: 'Are you currently taking any prescription medications?',
        type: 'select', options: ['No', 'Yes — weight related', 'Yes — other conditions'],
      },
      {
        id: 'prior_glp1', label: 'Have you previously tried GLP-1 medications (Ozempic, Wegovy, etc.)?',
        type: 'select', options: ['No, never', 'Yes, stopped due to side effects', 'Yes, stopped due to cost', 'Currently taking one'],
      },
    ],
  },
  {
    id: 'goals',
    title: 'Your weight loss goals',
    subtitle: 'Help us personalize your program.',
    fields: [
      {
        id: 'timeline', label: 'What is your weight loss timeline?',
        type: 'select', options: ['As fast as safely possible', '3–6 months', '6–12 months', 'Long-term gradual loss'],
      },
      {
        id: 'motivation', label: 'What is your primary motivation? (select one)',
        type: 'radio',
        options: ['Improve overall health', 'Reduce disease risk', 'Increase energy & fitness', 'Look and feel better', 'Doctor\'s recommendation'],
      },
      {
        id: 'program_preference', label: 'Which program interests you most?',
        type: 'radio',
        options: ['Semaglutide Program', 'Total Weight Loss Program', 'Metabolic Booster Rx', 'Not sure — let the physician decide'],
      },
    ],
  },
];

export default function QuizPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [submitting, setSubmitting] = useState(false);

  const currentStep = STEPS[step];
  const progress = ((step) / STEPS.length) * 100;

  function handleChange(fieldId: string, value: string | string[]) {
    setAnswers(prev => ({ ...prev, [fieldId]: value }));
  }

  function handleMultiCheck(fieldId: string, option: string) {
    const current = (answers[fieldId] as string[]) || [];
    if (option === 'None of the above') {
      setAnswers(prev => ({ ...prev, [fieldId]: ['None of the above'] }));
      return;
    }
    const filtered = current.filter(v => v !== 'None of the above');
    if (filtered.includes(option)) {
      setAnswers(prev => ({ ...prev, [fieldId]: filtered.filter(v => v !== option) }));
    } else {
      setAnswers(prev => ({ ...prev, [fieldId]: [...filtered, option] }));
    }
  }

  function canAdvance() {
    return currentStep.fields.every(f => {
      const val = answers[f.id];
      if (f.type === 'multicheck') return (val as string[] || []).length > 0;
      return val && String(val).trim() !== '';
    });
  }

  async function handleNext() {
    if (step < STEPS.length - 1) {
      setStep(s => s + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setSubmitting(true);
      // Store quiz in sessionStorage to use in checkout
      sessionStorage.setItem('quiz_answers', JSON.stringify(answers));
      router.push('/treatments');
    }
  }

  return (
    <div style={{ minHeight: '80vh', background: 'var(--cream)', padding: '3rem 5%' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        {/* Progress */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 500, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Step {step + 1} of {STEPS.length}
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{Math.round(progress)}% complete</span>
          </div>
          <div style={{ height: 4, background: 'var(--border)', borderRadius: 2 }}>
            <div style={{ height: '100%', width: `${progress + 25}%`, background: 'var(--gold)', borderRadius: 2, transition: 'width 0.4s ease' }} />
          </div>
        </div>

        {/* Card */}
        <div style={{ background: 'var(--white)', border: '1px solid var(--border)', padding: '2.5rem', borderRadius: '2px' }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.8rem', fontWeight: 500, color: 'var(--teal-dark)', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
            {currentStep.title}
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: '2rem', fontWeight: 300 }}>
            {currentStep.subtitle}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {currentStep.fields.map(field => (
              <div key={field.id}>
                <label style={labelStyle}>{field.label}</label>

                {field.type === 'number' && (
                  <input
                    type="number"
                    value={(answers[field.id] as string) || ''}
                    onChange={e => handleChange(field.id, e.target.value)}
                    placeholder={field.placeholder}
                    min={field.min}
                    max={field.max}
                    style={inputStyle}
                  />
                )}

                {field.type === 'select' && (
                  <select
                    value={(answers[field.id] as string) || ''}
                    onChange={e => handleChange(field.id, e.target.value)}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                  >
                    <option value="">Select an option…</option>
                    {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                )}

                {field.type === 'radio' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.25rem' }}>
                    {field.options?.map(opt => (
                      <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0.75rem 1rem', border: `1px solid ${answers[field.id] === opt ? 'var(--teal-mid)' : 'var(--border)'}`, borderRadius: '2px', cursor: 'pointer', background: answers[field.id] === opt ? 'var(--teal-faint)' : 'var(--cream)', transition: 'all 0.15s' }}>
                        <input type="radio" name={field.id} value={opt} checked={answers[field.id] === opt} onChange={() => handleChange(field.id, opt)} style={{ accentColor: 'var(--teal-mid)' }} />
                        <span style={{ fontSize: '0.9rem', color: answers[field.id] === opt ? 'var(--teal-mid)' : 'var(--body-text)', fontWeight: answers[field.id] === opt ? 500 : 300 }}>{opt}</span>
                      </label>
                    ))}
                  </div>
                )}

                {field.type === 'multicheck' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.25rem' }}>
                    {field.options?.map(opt => {
                      const checked = ((answers[field.id] as string[]) || []).includes(opt);
                      return (
                        <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0.75rem 1rem', border: `1px solid ${checked ? 'var(--teal-mid)' : 'var(--border)'}`, borderRadius: '2px', cursor: 'pointer', background: checked ? 'var(--teal-faint)' : 'var(--cream)', transition: 'all 0.15s' }}>
                          <input type="checkbox" checked={checked} onChange={() => handleMultiCheck(field.id, opt)} style={{ accentColor: 'var(--teal-mid)' }} />
                          <span style={{ fontSize: '0.9rem', color: checked ? 'var(--teal-mid)' : 'var(--body-text)', fontWeight: checked ? 500 : 300 }}>{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
            {step > 0
              ? <button onClick={() => setStep(s => s - 1)} style={btnOutline}>← Back</button>
              : <Link href="/" style={{ fontSize: '0.82rem', color: 'var(--muted)', textDecoration: 'none' }}>Cancel</Link>
            }
            <button
              onClick={handleNext}
              disabled={!canAdvance() || submitting}
              style={{ ...btnPrimary, opacity: canAdvance() ? 1 : 0.5, cursor: canAdvance() ? 'pointer' : 'not-allowed' }}
            >
              {step < STEPS.length - 1 ? 'Next →' : submitting ? 'Processing…' : 'See My Treatment Options →'}
            </button>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.75rem', color: 'var(--muted)', lineHeight: 1.6 }}>
          Your answers are confidential and reviewed only by licensed physicians. No obligation to purchase.
        </p>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.85rem', fontWeight: 500,
  color: 'var(--charcoal)', marginBottom: '0.6rem',
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.75rem 1rem', fontSize: '0.9rem',
  border: '1px solid var(--border)', borderRadius: '2px',
  background: 'var(--cream)', color: 'var(--body-text)',
  outline: 'none', fontFamily: 'inherit',
};

const btnPrimary: React.CSSProperties = {
  background: 'var(--teal-mid)', color: 'var(--white)',
  padding: '0.875rem 1.75rem', fontFamily: "'DM Sans', system-ui, sans-serif",
  fontSize: '0.82rem', fontWeight: 500, letterSpacing: '0.06em',
  textTransform: 'uppercase', border: 'none', cursor: 'pointer', borderRadius: '2px',
};

const btnOutline: React.CSSProperties = {
  background: 'transparent', color: 'var(--muted)',
  padding: '0.875rem 1.5rem', fontFamily: "'DM Sans', system-ui, sans-serif",
  fontSize: '0.82rem', fontWeight: 400, letterSpacing: '0.04em',
  border: '1px solid var(--border)', cursor: 'pointer', borderRadius: '2px',
};
