'use client';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const PLANS: Record<string, { name: string; price: number; desc: string; features: string[] }> = {
  semaglutide: {
    name: 'Semaglutide Program', price: 199, desc: 'GLP-1 Therapy · Monthly subscription',
    features: ['Weekly injection pen', '15%+ avg body weight loss', 'Monthly physician check-ins', 'Free shipping'],
  },
  total: {
    name: 'Total Weight Loss Program', price: 349, desc: 'Comprehensive Plan · Monthly subscription',
    features: ['GLP-1 + metabolic boosters', 'Nutrition & lifestyle plan', 'Dedicated care coordinator', 'Bi-weekly physician consults'],
  },
  metabolic: {
    name: 'Metabolic Booster Rx', price: 149, desc: 'Metabolism Support · Monthly subscription',
    features: ['Tirzepatide & MIC/B12', 'Boosts resting metabolic rate', 'Monthly physician oversight', 'Free shipping'],
  },
};

type CheckoutStep = 'account' | 'shipping' | 'payment';

function CheckoutForm() {
  const searchParams = useSearchParams();
  const planId = searchParams.get('plan') || 'total';
  const plan = PLANS[planId] || PLANS.total;
  const supabase = createClient();

  const [step, setStep] = useState<CheckoutStep>('account');
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState({ line1: '', city: '', state: '', zip: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleAccountStep(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setError(error.message); setLoading(false); return; }
    } else {
      if (password.length < 8) { setError('Password must be at least 8 characters.'); setLoading(false); return; }
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { data: { first_name: firstName, last_name: lastName } },
      });
      if (error) { setError(error.message); setLoading(false); return; }
    }

    setStep('shipping');
    setLoading(false);
  }

  async function handleShippingStep(e: React.FormEvent) {
    e.preventDefault();
    if (!address.line1 || !address.city || !address.state || !address.zip) {
      setError('Please fill in all address fields.');
      return;
    }
    setStep('payment');
  }

  async function handlePaymentSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);

    try {
      // Step 1: Submit clinical intake to Beluga before charging
      const quizAnswers = JSON.parse(sessionStorage.getItem('quiz_answers') || '{}');
      const intakeRes = await fetch('/api/clinical/submit-intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizAnswers, planId, shippingAddress: address }),
      });

      if (!intakeRes.ok) {
        const err = await intakeRes.json();
        console.warn('Intake submission issue (non-blocking):', err);
        // Non-fatal — continue to payment even if intake has issues
      } else {
        const intakeData = await intakeRes.json();
        sessionStorage.setItem('beluga_intake_id', intakeData.intakeId || '');
      }

      // Step 2: Create Stripe checkout session
      const checkoutRes = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, address }),
      });
      const checkoutData = await checkoutRes.json();

      if (checkoutData.url) {
        sessionStorage.removeItem('quiz_answers'); // clean up after successful redirect
        window.location.href = checkoutData.url;
      } else {
        setError(checkoutData.error || 'Payment setup failed. Please try again.');
        setLoading(false);
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
      setLoading(false);
    }
  }

  const stepDone = (s: CheckoutStep) => {
    if (s === 'account') return step === 'shipping' || step === 'payment';
    if (s === 'shipping') return step === 'payment';
    return false;
  };

  return (
    <div style={{ background: 'var(--cream)', minHeight: '80vh', padding: '3rem 5%' }}>
      <div style={{ maxWidth: 980, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 360px', gap: '2rem', alignItems: 'start' }} className="checkout-grid">

        {/* ── Left: Steps ── */}
        <div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '2rem', fontWeight: 500, color: 'var(--teal-dark)', marginBottom: '2rem', letterSpacing: '-0.02em' }}>
            Complete your enrollment
          </h1>

          {/* Step 1: Account */}
          <StepCard
            num={1} title="Create your account" done={stepDone('account')}
            active={step === 'account'} onEdit={() => setStep('account')}
            preview={stepDone('account') ? email : null}
          >
            <form onSubmit={handleAccountStep}>
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
                {['New account', 'Sign in'].map((label, i) => (
                  <button key={label} type="button" onClick={() => { setIsLogin(i === 1); setError(''); }}
                    style={{ flex: 1, padding: '0.6rem', fontSize: '0.82rem', fontWeight: 500, borderRadius: '2px', border: `1px solid ${isLogin === (i === 1) ? 'var(--teal-mid)' : 'var(--border)'}`, background: isLogin === (i === 1) ? 'var(--teal-faint)' : 'transparent', color: isLogin === (i === 1) ? 'var(--teal-mid)' : 'var(--muted)', cursor: 'pointer' }}>
                    {label}
                  </button>
                ))}
              </div>
              {error && <div style={errorBox}>{error}</div>}
              {!isLogin && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                  <Field label="First name"><input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} required style={inputStyle} placeholder="Jane" /></Field>
                  <Field label="Last name"><input type="text" value={lastName} onChange={e => setLastName(e.target.value)} required style={inputStyle} placeholder="Smith" /></Field>
                </div>
              )}
              <Field label="Email address"><input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" style={inputStyle} placeholder="you@example.com" /></Field>
              <div style={{ marginTop: '1rem' }}>
                <Field label={`Password${!isLogin ? ' (min. 8 chars)' : ''}`}>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={inputStyle} placeholder="••••••••" />
                </Field>
              </div>
              {isLogin && (
                <div style={{ textAlign: 'right', marginTop: '0.4rem' }}>
                  <Link href="/forgot-password" style={{ fontSize: '0.78rem', color: 'var(--teal-mid)', textDecoration: 'none' }}>Forgot password?</Link>
                </div>
              )}
              <button type="submit" disabled={loading} style={{ ...btnPrimary, width: '100%', marginTop: '1.5rem', opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Please wait…' : 'Continue →'}
              </button>
            </form>
          </StepCard>

          {/* Step 2: Shipping */}
          <StepCard
            num={2} title="Shipping address" done={stepDone('shipping')}
            active={step === 'shipping'} onEdit={() => setStep('shipping')}
            preview={stepDone('shipping') ? `${address.line1}, ${address.city}, ${address.state} ${address.zip}` : null}
          >
            <form onSubmit={handleShippingStep}>
              {error && step === 'shipping' && <div style={errorBox}>{error}</div>}
              <Field label="Street address">
                <input type="text" value={address.line1} onChange={e => setAddress(a => ({ ...a, line1: e.target.value }))} required placeholder="123 Main St" style={inputStyle} />
              </Field>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem', marginTop: '1rem' }}>
                <Field label="City"><input type="text" value={address.city} onChange={e => setAddress(a => ({ ...a, city: e.target.value }))} required style={inputStyle} /></Field>
                <Field label="State"><input type="text" value={address.state} onChange={e => setAddress(a => ({ ...a, state: e.target.value }))} required placeholder="TX" maxLength={2} style={{ ...inputStyle, textTransform: 'uppercase' }} /></Field>
              </div>
              <div style={{ marginTop: '1rem', maxWidth: 160 }}>
                <Field label="ZIP code"><input type="text" value={address.zip} onChange={e => setAddress(a => ({ ...a, zip: e.target.value }))} required placeholder="78701" maxLength={5} style={inputStyle} /></Field>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setStep('account')} style={btnBack}>← Back</button>
                <button type="submit" style={{ ...btnPrimary, flex: 1 }}>Continue →</button>
              </div>
            </form>
          </StepCard>

          {/* Step 3: Payment */}
          <StepCard
            num={3} title="Payment" done={false}
            active={step === 'payment'} onEdit={undefined}
            preview={null}
          >
            <form onSubmit={handlePaymentSubmit}>
              {error && step === 'payment' && <div style={errorBox}>{error}</div>}
              <div style={{ background: 'var(--teal-faint)', border: '1px solid rgba(13,74,74,0.15)', borderRadius: '2px', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <svg viewBox="0 0 20 20" fill="none" style={{ width: 18, height: 18, flexShrink: 0, marginTop: 1 }}>
                  <path d="M10 2C6.7 2 4 4.7 4 8v4H3v5h14v-5h-1V8c0-3.3-2.7-6-6-6z" stroke="var(--teal-mid)" strokeWidth="1.3" strokeLinejoin="round"/>
                </svg>
                <p style={{ fontSize: '0.82rem', color: 'var(--teal-mid)', fontWeight: 300, margin: 0, lineHeight: 1.65 }}>
                  You&apos;ll be taken to <strong style={{ fontWeight: 500 }}>Stripe&apos;s secure checkout</strong>. Your card is not charged until a licensed physician approves your treatment — usually within 24 hours.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="button" onClick={() => setStep('shipping')} style={btnBack}>← Back</button>
                <button type="submit" disabled={loading} style={{ ...btnPrimary, flex: 1, opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'Submitting intake & redirecting…' : `Proceed to Pay $${plan.price}/mo →`}
                </button>
              </div>
            </form>
          </StepCard>
        </div>

        {/* ── Right: Order Summary ── */}
        <div style={{ position: 'sticky', top: 88 }}>
          <div style={{ background: 'var(--white)', border: '1px solid var(--border)', padding: '1.75rem', borderRadius: '2px' }}>
            <p style={{ fontSize: '0.72rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: '1.25rem' }}>Order Summary</p>
            <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1.25rem', marginBottom: '1.25rem' }}>
              <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.2rem', fontWeight: 600, color: 'var(--teal-mid)', marginBottom: '0.25rem' }}>{plan.name}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 300 }}>{plan.desc}</div>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.25rem' }}>
              {plan.features.map(f => (
                <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: 'var(--muted)', padding: '0.3rem 0', fontWeight: 300 }}>
                  <svg viewBox="0 0 12 12" fill="none" style={{ width: 10, height: 10, flexShrink: 0 }}>
                    <path d="M2 6l3 3 5-5" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Monthly subscription</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>${plan.price}.00</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Shipping</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--teal-mid)' }}>Free</span>
            </div>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--charcoal)' }}>Due after approval</span>
              <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.5rem', fontWeight: 500, color: 'var(--teal-dark)' }}>${plan.price}/mo</span>
            </div>
            <p style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: '0.75rem', lineHeight: 1.6 }}>
              Card authorized today, charged only after physician approval. Cancel anytime.
            </p>
          </div>

          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {['256-bit SSL encryption', 'HIPAA compliant & secure', 'Licensed physician review', 'Full refund if not approved'].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', color: 'var(--muted)' }}>
                <svg viewBox="0 0 12 12" fill="none" style={{ width: 10, height: 10, flexShrink: 0 }}>
                  <path d="M2 6l3 3 5-5" stroke="var(--teal-mid)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {item}
              </div>
            ))}
          </div>

          <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
            <Link href="/treatments" style={{ fontSize: '0.78rem', color: 'var(--muted)', textDecoration: 'none' }}>
              ← Change plan
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepCard({
  num, title, done, active, onEdit, preview, children,
}: {
  num: number; title: string; done: boolean; active: boolean;
  onEdit?: () => void; preview: string | null; children?: React.ReactNode;
}) {
  return (
    <div style={{
      background: 'var(--white)', border: `1px solid ${active ? 'var(--teal-mid)' : 'var(--border)'}`,
      borderRadius: '2px', padding: '1.75rem', marginBottom: '1rem',
      opacity: !active && !done ? 0.5 : 1,
      pointerEvents: !active && !done ? 'none' : 'auto',
      transition: 'border-color 0.2s, opacity 0.2s',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: active ? '1.5rem' : 0 }}>
        <h2 style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--charcoal)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            width: 26, height: 26, borderRadius: '50%', display: 'inline-flex',
            alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem',
            fontWeight: 600, flexShrink: 0,
            background: done ? 'var(--teal-mid)' : active ? 'var(--gold)' : 'var(--border)',
            color: done ? 'white' : active ? 'var(--teal-dark)' : 'var(--muted)',
          }}>
            {done ? '✓' : num}
          </span>
          {title}
        </h2>
        {done && onEdit && (
          <button onClick={onEdit} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.78rem', color: 'var(--teal-mid)', fontWeight: 500 }}>Edit</button>
        )}
      </div>
      {done && preview && !active && (
        <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginLeft: 36 }}>{preview}</p>
      )}
      {active && children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 500, color: 'var(--charcoal)', marginBottom: '0.4rem' }}>{label}</label>
      {children}
    </div>
  );
}

export default function CheckoutPage() {
  return <Suspense><CheckoutForm /></Suspense>;
}

const inputStyle: React.CSSProperties = { width: '100%', padding: '0.7rem 0.875rem', fontSize: '0.88rem', border: '1px solid var(--border)', borderRadius: '2px', background: 'var(--cream)', color: 'var(--body-text)', outline: 'none', fontFamily: 'inherit' };
const btnPrimary: React.CSSProperties = { background: 'var(--teal-mid)', color: 'var(--white)', padding: '0.875rem 1.5rem', fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: '0.85rem', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', border: 'none', cursor: 'pointer', borderRadius: '2px' };
const btnBack: React.CSSProperties = { background: 'transparent', color: 'var(--muted)', padding: '0.875rem 1.25rem', fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: '0.82rem', fontWeight: 400, border: '1px solid var(--border)', cursor: 'pointer', borderRadius: '2px' };
const errorBox: React.CSSProperties = { background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '2px', padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: '0.85rem', color: '#DC2626' };
