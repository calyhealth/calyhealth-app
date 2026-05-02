'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.12 }
    );
    document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* HERO */}
      <section style={{
        background: 'var(--teal-dark)', minHeight: '92vh',
        display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'stretch',
        position: 'relative', overflow: 'hidden',
      }} className="hero-section">
        <div style={{ padding: '7rem 5% 7rem 7%', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', zIndex: 2 }}>
          <p style={{
            fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.14em',
            textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '1.5rem',
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <span style={{ display: 'block', width: 28, height: 1, background: 'var(--gold)' }} />
            Physician-prescribed weight loss
          </p>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 'clamp(2.8rem, 4.5vw, 4rem)', fontWeight: 500,
            color: 'var(--white)', lineHeight: 1.1, marginBottom: '1.5rem', letterSpacing: '-0.02em',
          }}>
            Lose weight with <em style={{ fontStyle: 'italic', color: 'var(--gold-light)' }}>science</em><br />that actually works
          </h1>
          <p style={{ fontSize: '1rem', fontWeight: 300, color: 'rgba(255,255,255,0.68)', maxWidth: 440, marginBottom: '2.5rem', lineHeight: 1.75 }}>
            Clinically proven GLP-1 medications, personalized programs, and licensed physicians — all from the comfort of home.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
            <Link href="/quiz" style={btnPrimary}>Take the Free Quiz</Link>
            <Link href="/treatments" style={btnOutline}>View Treatments</Link>
          </div>
          <div style={{ display: 'flex', gap: '2.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem', flexWrap: 'wrap' }}>
            {[{ num: '18k+', label: 'Patients treated' }, { num: '87%', label: 'See results in 12 wks' }, { num: '500+', label: 'Licensed physicians' }].map(s => (
              <div key={s.label}>
                <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.85rem', fontWeight: 500, color: 'var(--gold-light)', lineHeight: 1, marginBottom: 2 }}>{s.num}</div>
                <div style={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 400 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ position: 'relative', overflow: 'hidden' }} className="hero-img-col">
          <Image
            src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=900&q=80&auto=format&fit=crop"
            alt="Healthy active adult" fill style={{ objectFit: 'cover', opacity: 0.55 }}
            unoptimized
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, var(--teal-dark) 0%, transparent 40%)' }} />
        </div>
      </section>

      {/* TRUST BAR */}
      <div style={{
        background: 'var(--white)', borderBottom: '1px solid var(--border)',
        padding: '1.25rem 5%', display: 'flex', alignItems: 'center',
        justifyContent: 'center', gap: '3rem', flexWrap: 'wrap',
      }}>
        {trustItems.map((item, i) => (
          <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: '3rem' }}>
            {i > 0 && <div style={{ width: 1, height: 20, background: 'var(--border)' }} className="trust-divider" />}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.82rem', fontWeight: 400, color: 'var(--muted)' }}>
              <svg style={{ width: 20, height: 20, flexShrink: 0 }} viewBox="0 0 20 20" fill="none" dangerouslySetInnerHTML={{ __html: item.icon }} />
              <span dangerouslySetInnerHTML={{ __html: item.text }} />
            </div>
          </div>
        ))}
      </div>

      {/* HOW IT WORKS */}
      <section id="how" style={{ padding: '6rem 5%', background: 'var(--cream)' }}>
        <div className="fade-up" style={{ maxWidth: 560, marginBottom: '4rem' }}>
          <SectionLabel>Simple process</SectionLabel>
          <h2 style={sectionTitle}>From quiz to medication<br />in three steps</h2>
          <p style={sectionSubtitle}>Our clinical team reviews your health profile and prescribes the right treatment for your body — no in-person visits required.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '2px', background: 'var(--border)', border: '1px solid var(--border)' }} className="steps-grid">
          {steps.map((step, i) => (
            <div key={step.title} className="fade-up" style={{ background: 'var(--white)', padding: '2.5rem 2rem', position: 'relative' }}>
              <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '3.5rem', fontWeight: 400, color: 'var(--teal-faint)', lineHeight: 1, marginBottom: '1rem', letterSpacing: '-0.04em' }}>
                0{i + 1}
              </div>
              <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: 'var(--teal-mid)', marginBottom: '0.75rem' }}>{step.title}</div>
              <p style={{ fontSize: '0.9rem', fontWeight: 300, color: 'var(--muted)', lineHeight: 1.7 }}>{step.desc}</p>
              {i < steps.length - 1 && (
                <div style={{
                  position: 'absolute', right: -14, top: '50%', transform: 'translateY(-50%)',
                  width: 26, height: 26, background: 'var(--gold)', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2,
                }}>
                  <svg viewBox="0 0 10 10" fill="none" style={{ width: 10, height: 10 }}>
                    <path d="M3 5H7M5 3L7 5L5 7" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* PRODUCTS PREVIEW */}
      <section id="products" style={{ padding: '6rem 5%', background: 'var(--white)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '3rem', gap: '2rem', flexWrap: 'wrap' }}>
          <div className="fade-up">
            <SectionLabel>Treatments</SectionLabel>
            <h2 style={sectionTitle}>Choose your path<br />to lasting results</h2>
          </div>
          <p className="fade-up" style={{ ...sectionSubtitle, marginBottom: 0 }}>All programs supervised by licensed physicians. Pricing available after your free consultation.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.5rem' }} className="products-grid">
          {products.map((p) => (
            <div key={p.name} className="fade-up product-card" style={{
              border: '1px solid var(--border)', background: p.featured ? 'var(--teal-mid)' : 'var(--cream)',
              padding: '2rem 1.75rem 1.75rem', position: 'relative', display: 'flex', flexDirection: 'column',
              transition: 'box-shadow 0.2s, transform 0.2s',
            }}>
              {p.badge && (
                <div style={{ position: 'absolute', top: -1, left: '1.75rem', background: 'var(--gold)', color: 'var(--teal-dark)', fontSize: '0.65rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 10px' }}>
                  {p.badge}
                </div>
              )}
              <div style={{ marginBottom: '1.5rem' }} dangerouslySetInnerHTML={{ __html: p.icon }} />
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: p.featured ? 'var(--gold-light)' : 'var(--gold)', marginBottom: '1rem', fontWeight: 500 }}>{p.type}</div>
              <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.35rem', fontWeight: 600, color: p.featured ? 'var(--white)' : 'var(--teal-mid)', marginBottom: '0.5rem' }}>{p.name}</div>
              <p style={{ fontSize: '0.88rem', fontWeight: 300, color: p.featured ? 'rgba(255,255,255,0.6)' : 'var(--muted)', lineHeight: 1.7, marginBottom: '1.5rem', flex: 1 }}>{p.desc}</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, marginBottom: '2rem' }}>
                {p.features.map(f => (
                  <li key={f} style={{ fontSize: '0.83rem', color: p.featured ? 'rgba(255,255,255,0.75)' : 'var(--body-text)', padding: '0.35rem 0', borderBottom: `1px solid ${p.featured ? 'rgba(255,255,255,0.1)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', gap: 8, fontWeight: 300 }}>
                    <span style={{ display: 'block', width: 4, height: 4, borderRadius: '50%', background: 'var(--gold)', flexShrink: 0 }} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/quiz" style={{
                display: 'block', textAlign: 'center', padding: '0.75rem',
                fontSize: '0.78rem', fontWeight: 500, letterSpacing: '0.08em',
                textTransform: 'uppercase', textDecoration: 'none', borderRadius: '2px',
                background: p.featured ? 'var(--gold)' : 'transparent',
                color: p.featured ? 'var(--teal-dark)' : 'var(--teal-mid)',
                border: p.featured ? '1px solid var(--gold)' : '1px solid var(--teal-mid)',
              }}>
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link href="/treatments" style={{ ...btnPrimaryTeal, display: 'inline-block' }}>View All Treatments</Link>
        </div>
      </section>

      {/* CLINICAL STATS */}
      <section id="results" style={{ background: 'var(--teal-dark)', padding: '6rem 5%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'center' }} className="clinical-grid">
          <div className="fade-up">
            <SectionLabel gold>Clinical evidence</SectionLabel>
            <h2 style={{ ...sectionTitle, color: 'var(--white)' }}>Results backed by peer-reviewed research</h2>
            <p style={{ ...sectionSubtitle, color: 'rgba(255,255,255,0.55)', maxWidth: 'none' }}>Our protocols are built on the same clinical evidence used in landmark NIH and NEJM trials on GLP-1 receptor agonist therapies.</p>
            <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', marginTop: '2rem', fontWeight: 300, lineHeight: 1.6 }}>
              *Results based on clinical trial data and internal patient outcomes. Individual results may vary.
            </p>
          </div>
          <div className="fade-up" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {stats.map(s => (
              <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', padding: '2rem 1.75rem' }}>
                <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '3rem', fontWeight: 500, color: 'var(--gold-light)', lineHeight: 1, marginBottom: '0.5rem', letterSpacing: '-0.03em' }}>{s.num}</div>
                <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', fontWeight: 300, lineHeight: 1.5 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ padding: '6rem 5%', background: 'var(--cream)' }}>
        <div className="fade-up" style={{ marginBottom: '3.5rem' }}>
          <SectionLabel>Patient stories</SectionLabel>
          <h2 style={sectionTitle}>Real people. Real results.</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.5rem' }} className="stories-grid">
          {testimonials.map(t => (
            <div key={t.name} className="fade-up" style={{ background: 'var(--white)', border: '1px solid var(--border)', padding: '2rem 1.75rem' }}>
              <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '4rem', lineHeight: 0.6, color: 'var(--gold-faint)', marginBottom: '1.25rem', display: 'block' }}>&ldquo;</span>
              <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.05rem', fontStyle: 'italic', color: 'var(--charcoal)', lineHeight: 1.7, marginBottom: '1.5rem' }}>{t.text}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--teal-faint)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1rem', fontWeight: 500, color: 'var(--teal-mid)', flexShrink: 0 }}>
                  {t.initials}
                </div>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 500, color: 'var(--charcoal)' }}>{t.name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 300 }}>{t.meta}</div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--teal-mid)' }}>{t.result}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" style={{ padding: '6rem 5%', background: 'var(--white)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '5rem', alignItems: 'start' }} className="faq-grid">
          <div className="fade-up">
            <SectionLabel>Common questions</SectionLabel>
            <h2 style={sectionTitle}>We&apos;ve got answers</h2>
            <p style={{ ...sectionSubtitle, marginTop: '1rem' }}>
              Can&apos;t find what you&apos;re looking for? Reach our care team anytime at{' '}
              <a href="mailto:support@calyhealth.com" style={{ color: 'var(--teal-mid)' }}>support@calyhealth.com</a>
            </p>
          </div>
          <div>
            {faqs.map((faq, i) => (
              <details key={faq.q} style={{ borderBottom: '1px solid var(--border)' }} open={i === 0}>
                <summary style={{ padding: '1.25rem 0', fontSize: '0.95rem', fontWeight: 400, color: 'var(--charcoal)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', userSelect: 'none', listStyle: 'none' }}>
                  {faq.q}
                  <svg style={{ width: 20, height: 20, flexShrink: 0, color: 'var(--gold)' }} viewBox="0 0 20 20" fill="none">
                    <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </summary>
                <p style={{ padding: '0 0 1.25rem', fontSize: '0.88rem', fontWeight: 300, color: 'var(--muted)', lineHeight: 1.75 }}>{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section style={{ background: 'var(--teal-mid)', padding: '6rem 5%', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <SectionLabel center gold>Your transformation starts today</SectionLabel>
        <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 'clamp(2rem, 3.5vw, 3rem)', fontWeight: 500, color: 'var(--white)', marginBottom: '1rem', letterSpacing: '-0.02em' }}>
          Ready to lose weight<br />the right way?
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontWeight: 300, maxWidth: 480, margin: '0 auto 2.5rem', fontSize: '1rem' }}>
          Take our free 5-minute health quiz and a licensed physician will review your profile — no commitment required.
        </p>
        <Link href="/quiz" style={{ ...btnPrimary, fontSize: '0.85rem', padding: '1rem 2.5rem' }}>
          Start Your Free Quiz →
        </Link>
      </section>
    </>
  );
}

function SectionLabel({ children, gold, center }: { children: React.ReactNode; gold?: boolean; center?: boolean }) {
  return (
    <p style={{
      fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase',
      color: gold ? 'var(--gold-light)' : 'var(--gold)', marginBottom: '1rem',
      display: 'flex', alignItems: 'center', gap: 10,
      justifyContent: center ? 'center' : 'flex-start',
    }}>
      <span style={{ display: 'block', width: 22, height: 1, background: gold ? 'var(--gold-light)' : 'var(--gold)', flexShrink: 0 }} />
      {children}
    </p>
  );
}

const btnPrimary: React.CSSProperties = {
  background: 'var(--gold)', color: 'var(--teal-dark)',
  padding: '0.875rem 2rem', fontFamily: "'DM Sans', system-ui, sans-serif",
  fontSize: '0.8rem', fontWeight: 500, letterSpacing: '0.08em',
  textTransform: 'uppercase', textDecoration: 'none', border: 'none',
  cursor: 'pointer', borderRadius: '2px', display: 'inline-block',
};

const btnPrimaryTeal: React.CSSProperties = {
  background: 'var(--teal-mid)', color: 'var(--white)',
  padding: '0.875rem 2rem', fontFamily: "'DM Sans', system-ui, sans-serif",
  fontSize: '0.8rem', fontWeight: 500, letterSpacing: '0.08em',
  textTransform: 'uppercase', textDecoration: 'none', border: 'none',
  cursor: 'pointer', borderRadius: '2px',
};

const btnOutline: React.CSSProperties = {
  background: 'transparent', color: 'var(--white)',
  padding: '0.875rem 2rem', fontFamily: "'DM Sans', system-ui, sans-serif",
  fontSize: '0.8rem', fontWeight: 500, letterSpacing: '0.08em',
  textTransform: 'uppercase', textDecoration: 'none',
  border: '1px solid rgba(255,255,255,0.3)', cursor: 'pointer', borderRadius: '2px',
  display: 'inline-block',
};

const sectionTitle: React.CSSProperties = {
  fontFamily: "'Cormorant Garamond', Georgia, serif",
  fontSize: 'clamp(2rem, 3vw, 2.7rem)', fontWeight: 500,
  color: 'var(--teal-dark)', lineHeight: 1.15,
  letterSpacing: '-0.02em', marginBottom: '1.25rem',
};

const sectionSubtitle: React.CSSProperties = {
  fontSize: '1rem', fontWeight: 300, color: 'var(--muted)', maxWidth: 520, lineHeight: 1.75,
};

const trustItems = [
  { icon: '<path d="M10 2L12.4 7.4L18 8.2L14 12.1L14.9 17.7L10 15L5.1 17.7L6 12.1L2 8.2L7.6 7.4L10 2Z" fill="#C9A84C"/>', text: '<strong>FDA-Approved</strong> medications only' },
  { icon: '<path d="M10 2C6.7 2 4 4.7 4 8C4 12.4 10 18 10 18C10 18 16 12.4 16 8C16 4.7 13.3 2 10 2ZM10 10.5C8.6 10.5 7.5 9.4 7.5 8C7.5 6.6 8.6 5.5 10 5.5C11.4 5.5 12.5 6.6 12.5 8C12.5 9.4 11.4 10.5 10 10.5Z" fill="#0D4A4A"/>', text: '<strong>Licensed physicians</strong> in all 50 states' },
  { icon: '<rect x="3" y="3" width="14" height="14" rx="2" stroke="#0D4A4A" stroke-width="1.5"/><path d="M7 10L9 12L13 8" stroke="#C9A84C" stroke-width="1.5" stroke-linecap="round"/>', text: '<strong>HIPAA compliant</strong> &amp; fully encrypted' },
  { icon: '<path d="M3 10L10 3L17 10V17H13V13H7V17H3V10Z" fill="none" stroke="#0D4A4A" stroke-width="1.5" stroke-linejoin="round"/>', text: 'Medications <strong>delivered to your door</strong>' },
];

const steps = [
  { title: 'Take the Health Quiz', desc: 'Answer a short series of clinically validated questions about your health history, goals, and lifestyle. Takes less than 5 minutes.' },
  { title: 'Physician Review', desc: 'A board-certified physician reviews your profile and determines the safest, most effective treatment protocol tailored to you.' },
  { title: 'Start Your Program', desc: 'Your prescription is sent to a licensed pharmacy and delivered discreetly to your door. Ongoing check-ins keep you on track.' },
];

const products = [
  {
    name: 'Semaglutide Program', type: 'GLP-1 Therapy', featured: false, badge: null,
    desc: 'The same active ingredient as Ozempic® and Wegovy®, prescribed and monitored by our physicians at a fraction of the cost.',
    features: ['Weekly self-injection, easy to use', 'Clinically proven 15%+ body weight loss', 'Appetite regulation & blood sugar support', 'Monthly check-ins with your care team'],
    cta: 'Learn More & Get Started',
    icon: '<svg width="44" height="44" viewBox="0 0 44 44" fill="none"><circle cx="22" cy="22" r="20" stroke="#0D4A4A" stroke-width="1.5"/><path d="M15 22C15 18.1 18.1 15 22 15C25.9 15 29 18.1 29 22" stroke="#C9A84C" stroke-width="1.5" stroke-linecap="round"/><circle cx="22" cy="22" r="3" fill="#0D4A4A"/></svg>',
  },
  {
    name: 'Total Weight Loss Program', type: 'Comprehensive Plan', featured: true, badge: 'Most Popular',
    desc: 'Our most complete program combines GLP-1 medication, metabolic support, nutrition coaching, and 1-on-1 physician guidance.',
    features: ['GLP-1 medication + metabolic boosters', 'Personalized nutrition & lifestyle plan', 'Dedicated care coordinator', 'Bi-weekly physician consultations'],
    cta: 'Get Your Custom Plan',
    icon: '<svg width="44" height="44" viewBox="0 0 44 44" fill="none"><rect x="4" y="14" width="36" height="20" rx="3" stroke="white" stroke-width="1.5"/><path d="M14 14V11C14 9.3 15.3 8 17 8H27C28.7 8 30 9.3 30 11V14" stroke="#C9A84C" stroke-width="1.5"/><path d="M22 20V28M18 24H26" stroke="#C9A84C" stroke-width="1.5" stroke-linecap="round"/></svg>',
  },
  {
    name: 'Metabolic Booster Rx', type: 'Metabolism Support', featured: false, badge: null,
    desc: 'Prescription-grade compounds that enhance metabolic rate, improve energy levels, and support fat oxidation for accelerated results.',
    features: ['Tirzepatide & MIC/B12 formulations', 'Boosts resting metabolic rate', 'Increased energy & reduced fatigue', 'Ideal as a standalone or add-on'],
    cta: 'Explore This Treatment',
    icon: '<svg width="44" height="44" viewBox="0 0 44 44" fill="none"><path d="M22 6L26 16H37L28.5 22.5L31.5 33L22 27L12.5 33L15.5 22.5L7 16H18L22 6Z" stroke="#0D4A4A" stroke-width="1.5" stroke-linejoin="round"/></svg>',
  },
];

const stats = [
  { num: '15%', label: 'Average body weight reduction in clinical GLP-1 trials over 68 weeks' },
  { num: '87%', label: 'Of CalyHealth patients report measurable weight loss within 12 weeks' },
  { num: '2.4×', label: 'Greater weight loss vs. lifestyle intervention alone in head-to-head trials' },
  { num: '94%', label: 'Patient satisfaction score based on 6-month program survey' },
];

const testimonials = [
  { initials: 'ML', name: 'Michelle L.', meta: 'Age 47 · Dallas, TX', result: 'Lost 38 lbs over 5 months', text: "I'd tried every diet for 15 years. Within 8 weeks on the CalyHealth program I lost 22 pounds — and I finally feel in control of my hunger for the first time." },
  { initials: 'DR', name: 'David R.', meta: 'Age 52 · Chicago, IL', result: 'Lost 29 lbs over 4 months', text: 'As a busy dad of three I had no time for a complicated program. CalyHealth made it simple — my physician is always just a message away and the medication works.' },
  { initials: 'AP', name: 'Angela P.', meta: 'Age 39 · Austin, TX', result: 'Lost 44 lbs over 6 months', text: "The physician review gave me so much confidence. I knew exactly what I was taking, why, and what to expect. This isn't a fad — it's real medicine done right." },
];

const faqs = [
  { q: 'Am I a good candidate for GLP-1 medication?', a: "GLP-1 medications like semaglutide are generally appropriate for adults with a BMI of 27+ and at least one weight-related condition, or a BMI of 30+. Our free health quiz and physician review will assess your personal eligibility — there's no obligation and no cost to find out if you qualify." },
  { q: 'How is CalyHealth different from other online weight loss companies?', a: 'We focus exclusively on clinically proven, physician-prescribed medications rather than supplements or unregulated compounds. Every treatment plan is reviewed by a licensed physician, and you receive ongoing support from a dedicated care team — not just a one-time prescription.' },
  { q: 'What are the side effects of semaglutide?', a: 'The most common side effects include nausea, constipation, and mild fatigue — particularly in the first few weeks as your body adjusts. Most patients find these manageable and temporary. Your physician will guide you through a gradual dose titration to minimize discomfort.' },
  { q: 'Does insurance cover CalyHealth treatments?', a: 'Our programs are self-pay, which allows us to offer physician-supervised medication at significantly lower prices than brand-name alternatives. We provide detailed receipts that some patients use to apply for FSA/HSA reimbursement. We do not bill insurance directly at this time.' },
  { q: 'How quickly will I see results?', a: 'Most patients report noticeable appetite reduction within the first 1–2 weeks. Meaningful weight loss typically begins by week 4–8, with the most significant results appearing between months 3 and 6.' },
];
