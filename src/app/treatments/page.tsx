'use client';
import Link from 'next/link';

const TREATMENTS = [
  {
    id: 'semaglutide',
    name: 'Semaglutide Program',
    type: 'GLP-1 Therapy',
    price: '$199',
    period: '/month',
    badge: null,
    featured: false,
    desc: 'The same active ingredient as Ozempic® and Wegovy®, prescribed and monitored by our physicians at a fraction of the cost.',
    features: [
      'Weekly self-injection pen, easy to use',
      'Clinically proven 15%+ body weight loss',
      'Appetite regulation & blood sugar support',
      'Monthly physician check-ins',
      'Free shipping, discreet packaging',
      'Cancel anytime',
    ],
    highlight: 'Best for first-time GLP-1 users',
    icon: '<svg width="52" height="52" viewBox="0 0 52 52" fill="none"><circle cx="26" cy="26" r="24" stroke="#B36A00" stroke-width="1.5"/><path d="M18 26C18 21.6 21.6 18 26 18C30.4 18 34 21.6 34 26" stroke="#C9A84C" stroke-width="1.5" stroke-linecap="round"/><circle cx="26" cy="26" r="4" fill="#B36A00"/></svg>',
  },
  {
    id: 'total',
    name: 'Total Weight Loss Program',
    type: 'Comprehensive Plan',
    price: '$349',
    period: '/month',
    badge: 'Most Popular',
    featured: true,
    desc: 'Our most complete program: GLP-1 medication, metabolic support, nutrition coaching, and 1-on-1 physician guidance.',
    features: [
      'GLP-1 medication (semaglutide or tirzepatide)',
      'Metabolic booster compounds',
      'Personalized nutrition & lifestyle plan',
      'Dedicated care coordinator',
      'Bi-weekly physician consultations',
      'Priority support & same-day responses',
    ],
    highlight: 'Maximum results, maximum support',
    icon: '<svg width="52" height="52" viewBox="0 0 52 52" fill="none"><rect x="4" y="16" width="44" height="24" rx="3" stroke="white" stroke-width="1.5"/><path d="M16 16V12C16 10 17.8 8.5 20 8.5H32C34.2 8.5 36 10 36 12V16" stroke="#C9A84C" stroke-width="1.5"/><path d="M26 23V33M22 28H30" stroke="#C9A84C" stroke-width="1.5" stroke-linecap="round"/></svg>',
  },
  {
    id: 'metabolic',
    name: 'Metabolic Booster Rx',
    type: 'Metabolism Support',
    price: '$149',
    period: '/month',
    badge: null,
    featured: false,
    desc: 'Prescription-grade compounds that enhance metabolic rate, improve energy, and accelerate fat oxidation.',
    features: [
      'Tirzepatide & MIC/B12 formulations',
      'Boosts resting metabolic rate',
      'Increased energy & reduced fatigue',
      'Monthly physician oversight',
      'Ideal as a standalone or add-on treatment',
      'Free shipping, discreet packaging',
    ],
    highlight: 'Best as an add-on to GLP-1 therapy',
    icon: '<svg width="52" height="52" viewBox="0 0 52 52" fill="none"><path d="M26 6L31 20H45L34 29L38 43L26 35L14 43L18 29L7 20H21L26 6Z" stroke="#B36A00" stroke-width="1.5" stroke-linejoin="round"/></svg>',
  },
];

export default function TreatmentsPage() {
  return (
    <div style={{ background: 'var(--cream)', minHeight: '80vh' }}>
      {/* Header */}
      <div style={{ background: 'var(--teal-dark)', padding: '5rem 5% 4rem' }}>
        <div style={{ maxWidth: 600 }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ display: 'block', width: 22, height: 1, background: 'var(--gold)' }} />
            Physician-supervised treatments
          </p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 500, color: 'var(--white)', lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: '1rem' }}>
            Choose your treatment plan
          </h1>
          <p style={{ fontSize: '1rem', fontWeight: 300, color: 'rgba(255,255,255,0.65)', lineHeight: 1.75 }}>
            All programs require a physician review after checkout. You won&apos;t be charged until your physician approves your treatment.
          </p>
        </div>
      </div>

      {/* Cards */}
      <div style={{ padding: '4rem 5%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.5rem', maxWidth: 1100, margin: '0 auto' }} className="treatments-grid">
          {TREATMENTS.map(t => (
            <div key={t.id} style={{
              border: '1px solid var(--border)',
              background: t.featured ? 'var(--teal-mid)' : 'var(--white)',
              padding: '2.5rem 2rem 2rem',
              position: 'relative',
              display: 'flex', flexDirection: 'column',
              borderRadius: '2px',
            }}>
              {t.badge && (
                <div style={{ position: 'absolute', top: -1, left: '2rem', background: 'var(--gold)', color: 'var(--teal-dark)', fontSize: '0.65rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 10px' }}>
                  {t.badge}
                </div>
              )}

              <div style={{ marginBottom: '1.5rem' }} dangerouslySetInnerHTML={{ __html: t.icon }} />

              <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: t.featured ? 'var(--gold-light)' : 'var(--gold)', marginBottom: '0.5rem', fontWeight: 500 }}>
                {t.type}
              </div>
              <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.4rem', fontWeight: 600, color: t.featured ? 'var(--white)' : 'var(--teal-mid)', marginBottom: '0.75rem' }}>
                {t.name}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: '1rem' }}>
                <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '2.2rem', fontWeight: 500, color: t.featured ? 'var(--white)' : 'var(--teal-dark)', lineHeight: 1 }}>
                  {t.price}
                </span>
                <span style={{ fontSize: '0.82rem', color: t.featured ? 'rgba(255,255,255,0.5)' : 'var(--muted)', fontWeight: 300 }}>
                  {t.period}
                </span>
              </div>
              <p style={{ fontSize: '0.88rem', fontWeight: 300, color: t.featured ? 'rgba(255,255,255,0.6)' : 'var(--muted)', lineHeight: 1.7, marginBottom: '1.5rem', flex: 1 }}>
                {t.desc}
              </p>

              <div style={{ fontSize: '0.75rem', fontWeight: 500, color: t.featured ? 'var(--gold-light)' : 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem' }}>
                {t.highlight}
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: 0, marginBottom: '2rem' }}>
                {t.features.map(f => (
                  <li key={f} style={{ fontSize: '0.83rem', color: t.featured ? 'rgba(255,255,255,0.75)' : 'var(--body-text)', padding: '0.4rem 0', borderBottom: `1px solid ${t.featured ? 'rgba(255,255,255,0.1)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', gap: 10, fontWeight: 300 }}>
                    <svg viewBox="0 0 12 12" fill="none" style={{ width: 12, height: 12, flexShrink: 0 }}>
                      <path d="M2 6l3 3 5-5" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={`/checkout?plan=${t.id}`}
                style={{
                  display: 'block', textAlign: 'center', padding: '0.875rem',
                  fontSize: '0.82rem', fontWeight: 500, letterSpacing: '0.08em',
                  textTransform: 'uppercase', textDecoration: 'none', borderRadius: '2px',
                  background: t.featured ? 'var(--gold)' : 'var(--teal-mid)',
                  color: t.featured ? 'var(--teal-dark)' : 'var(--white)',
                  border: 'none',
                }}
              >
                Select This Plan
              </Link>
            </div>
          ))}
        </div>

        {/* Trust note */}
        <div style={{ maxWidth: 1100, margin: '3rem auto 0', background: 'var(--white)', border: '1px solid var(--border)', padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <svg viewBox="0 0 24 24" fill="none" style={{ width: 28, height: 28, flexShrink: 0, color: 'var(--teal-mid)' }}>
            <path d="M12 2L4 6v6c0 5.25 3.5 9.74 8 11 4.5-1.26 8-5.75 8-11V6l-8-4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M9 12l2 2 4-4" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 300, lineHeight: 1.65, margin: 0 }}>
            <strong style={{ color: 'var(--charcoal)', fontWeight: 500 }}>You won&apos;t be charged until approved.</strong>{' '}
            After checkout, a licensed physician will review your health profile within 24 hours. If you&apos;re not a good candidate, you receive a full refund automatically.
          </p>
        </div>
      </div>
    </div>
  );
}
