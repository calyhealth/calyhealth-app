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
      <style>{`
        @media (max-width: 900px) {
          .wellness-grid { grid-template-columns: 1fr !important; }
          .tips-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
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
            src="/hero.jpg"
            alt="Healthy active adult" fill unoptimized style={{ objectFit: 'cover', objectPosition: 'center top', opacity: 0.75 }}
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

      {/* WELLNESS PROGRAM — Video Cards */}
      <section id="results" style={{ padding: '6rem 5%', background: 'var(--cream)' }}>
        <div className="fade-up" style={{ marginBottom: '3.5rem' }}>
          <SectionLabel>Your wellness program</SectionLabel>
          <h2 style={sectionTitle}>More than medication.<br />A complete lifestyle system.</h2>
          <p style={{ ...sectionSubtitle, marginTop: '0.5rem', maxWidth: 520 }}>
            Expert-guided movement, nutrition, and mindset content — alongside your physician-prescribed treatment.
          </p>
        </div>

        {/* Featured + side stack */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', marginBottom: '1.5rem' }} className="wellness-featured-grid">

          {/* Featured large card */}
          <a href="https://www.youtube.com/watch?v=IT94xC35u6k" target="_blank" rel="noopener noreferrer" className="fade-up" style={{ display: 'flex', flexDirection: 'column', background: 'var(--teal-dark)', borderRadius: 4, overflow: 'hidden', textDecoration: 'none', position: 'relative', minHeight: 340 }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, var(--teal-dark) 0%, var(--teal-light) 100%)', opacity: 0.9 }} />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="120" height="120" viewBox="0 0 120 120" fill="none" style={{ opacity: 0.2 }}>
                <circle cx="60" cy="28" r="12" stroke="white" strokeWidth="2"/>
                <path d="M60 40V70M40 52H80M45 90L60 70L75 90" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div style={{ position: 'relative', zIndex: 1, padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
              <span style={{ display: 'inline-block', fontSize: '0.65rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'var(--gold)', color: 'var(--teal-dark)', padding: '3px 10px', borderRadius: 2, marginBottom: '1rem', alignSelf: 'flex-start' }}>Featured</span>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', backdropFilter: 'blur(4px)' }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M5 3L13 8L5 13V3Z" fill="white"/></svg>
              </div>
              <p style={{ fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold-light)', marginBottom: '0.5rem' }}>🏃 Movement</p>
              <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.5rem', fontWeight: 600, color: 'var(--white)', lineHeight: 1.3, marginBottom: '0.5rem' }}>10-Minute Morning Stretch Routine for Beginners</h3>
              <p style={{ fontSize: '0.82rem', fontWeight: 300, color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, marginBottom: '1rem' }}>Gentle full-body stretches to ease stiffness, improve circulation, and set an energized tone for your day.</p>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
                <span>⏱ 10 min</span><span>·</span><span>Beginner friendly</span><span>·</span><span>No equipment</span>
              </div>
            </div>
          </a>

          {/* Side stack of 3 smaller cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { href: 'https://www.youtube.com/watch?v=nAmc9SNciTg', tag: '🥗 Nutrition', bg: '#EBF6F0', title: 'What to Eat on GLP-1 Medication', desc: 'Foods that maximize your results and minimize side effects.' },
              { href: 'https://www.youtube.com/watch?v=inpok4MKVLM', tag: '🧠 Mindset', bg: '#EEF2FA', title: '5-Minute Mindfulness for Stress Eating', desc: 'A quick reset to break emotional eating patterns.' },
              { href: 'https://www.youtube.com/watch?v=2L2lnxIcNmo', tag: '🏃 Movement', bg: '#EBF6F0', title: 'Low-Impact Walking Plan for Weight Loss', desc: 'Build a sustainable daily habit with this 4-week plan.' },
            ].map(v => (
              <a key={v.href} href={v.href} target="_blank" rel="noopener noreferrer" className="fade-up" style={{ display: 'flex', gap: '1rem', background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 4, padding: '1rem', textDecoration: 'none', alignItems: 'center' }}>
                <div style={{ width: 56, height: 56, borderRadius: 4, background: v.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative' }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--teal-mid)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="8" height="8" viewBox="0 0 10 10" fill="none"><path d="M3 2L8 5L3 8V2Z" fill="white"/></svg>
                  </div>
                </div>
                <div>
                  <p style={{ fontSize: '0.68rem', fontWeight: 500, color: 'var(--teal-mid)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>{v.tag}</p>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 500, color: 'var(--charcoal)', lineHeight: 1.35, marginBottom: '0.2rem' }}>{v.title}</h4>
                  <p style={{ fontSize: '0.78rem', fontWeight: 300, color: 'var(--muted)', lineHeight: 1.5 }}>{v.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Tips strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1px', background: 'var(--border)', border: '1px solid var(--border)' }} className="tips-grid">
          {[
            { bg: '#EBF6F0', icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="4" r="2.5" stroke="#2A7A4B" strokeWidth="1.3"/><path d="M9 7V12M5 9.5H13M6 16L9 12L12 16" stroke="#2A7A4B" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>, heading: 'Start with 10 minutes daily', body: 'Short, consistent movement beats sporadic intense workouts. Even a brisk walk boosts GLP-1 effectiveness.' },
            { bg: 'var(--gold-faint)', icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2C6 2 4 5 4 8C4 11 6 14 9 14C12 14 14 11 14 8C14 5 12 2 9 2Z" stroke="#C9A84C" strokeWidth="1.3"/><path d="M7 9H11M9 7V11" stroke="#C9A84C" strokeWidth="1.3" strokeLinecap="round"/></svg>, heading: 'Prioritize protein at every meal', body: 'High-protein foods preserve muscle mass and work in synergy with appetite-suppressing GLP-1 medications.' },
            { bg: '#EEF2FA', icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="7" stroke="#4A6FA5" strokeWidth="1.3"/><path d="M6.5 9C6.5 7.6 7.6 6.5 9 6.5C10.4 6.5 11.5 7.6 11.5 9" stroke="#4A6FA5" strokeWidth="1.3" strokeLinecap="round"/><circle cx="9" cy="9" r="1.2" fill="#4A6FA5"/></svg>, heading: 'Track progress, not perfection', body: 'Weight fluctuates daily. Focus on weekly trends and non-scale victories — energy, sleep quality, clothing fit.' },
          ].map(tip => (
            <div key={tip.heading} className="fade-up" style={{ background: 'var(--white)', padding: '1.75rem 1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: tip.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {tip.icon}
              </div>
              <div>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 500, color: 'var(--charcoal)', marginBottom: '0.3rem' }}>{tip.heading}</h4>
                <p style={{ fontSize: '0.82rem', fontWeight: 300, color: 'var(--muted)', lineHeight: 1.65 }}>{tip.body}</p>
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
  { icon: '<path d="M10 2C6.7 2 4 4.7 4 8C4 12.4 10 18 10 18C10 18 16 12.4 16 8C16 4.7 13.3 2 10 2ZM10 10.5C8.6 10.5 7.5 9.4 7.5 8C7.5 6.6 8.6 5.5 10 5.5C11.4 5.5 12.5 6.6 12.5 8C12.5 9.4 11.4 10.5 10 10.5Z" fill="#B36A00"/>', text: '<strong>Licensed physicians</strong> in all 50 states' },
  { icon: '<rect x="3" y="3" width="14" height="14" rx="2" stroke="#B36A00" stroke-width="1.5"/><path d="M7 10L9 12L13 8" stroke="#C9A84C" stroke-width="1.5" stroke-linecap="round"/>', text: '<strong>HIPAA compliant</strong> &amp; fully encrypted' },
  { icon: '<path d="M3 10L10 3L17 10V17H13V13H7V17H3V10Z" fill="none" stroke="#B36A00" stroke-width="1.5" stroke-linejoin="round"/>', text: 'Medications <strong>delivered to your door</strong>' },
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
    icon: '<svg width="44" height="44" viewBox="0 0 44 44" fill="none"><circle cx="22" cy="22" r="20" stroke="#B36A00" stroke-width="1.5"/><path d="M15 22C15 18.1 18.1 15 22 15C25.9 15 29 18.1 29 22" stroke="#C9A84C" stroke-width="1.5" stroke-linecap="round"/><circle cx="22" cy="22" r="3" fill="#B36A00"/></svg>',
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
    icon: '<svg width="44" height="44" viewBox="0 0 44 44" fill="none"><path d="M22 6L26 16H37L28.5 22.5L31.5 33L22 27L12.5 33L15.5 22.5L7 16H18L22 6Z" stroke="#B36A00" stroke-width="1.5" stroke-linejoin="round"/></svg>',
  },
];

const stats = [
  { num: '15%', label: 'Average body weight reduction in clinical GLP-1 trials over 68 weeks' },
  { num: '87%', label: 'Of CalyHealth patients report measurable weight loss within 12 weeks' },
  { num: '2.4×', label: 'Greater weight loss vs. lifestyle intervention alone in head-to-head trials' },
  { num: '94%', label: 'Patient satisfaction score based on 6-month program survey' },
];

const wellnessPillars = [
  {
    label: 'Movement',
    color: '#2A7A4B',
    bg: '#EBF6F0',
    icon: '<circle cx="11" cy="4.5" r="2.5" stroke="#2A7A4B" stroke-width="1.3"/><path d="M11 7V13M7 9.5H15M8 19L11 13L14 19" stroke="#2A7A4B" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>',
    title: 'Daily movement made simple',
    desc: 'Short, consistent movement amplifies your GLP-1 results. No gym required — just accessible routines that fit around your life.',
    items: ['10-min morning stretch for beginners', 'Low-impact walking plan (4-week)', 'Strength basics to preserve muscle mass'],
  },
  {
    label: 'Nutrition',
    color: '#C9A84C',
    bg: '#FBF5E6',
    icon: '<path d="M11 2C7.5 2 5 5.5 5 9C5 12.5 7.5 16 11 16C14.5 16 17 12.5 17 9C17 5.5 14.5 2 11 2Z" stroke="#C9A84C" stroke-width="1.3"/><path d="M8 9H14M11 6V12" stroke="#C9A84C" stroke-width="1.3" stroke-linecap="round"/>',
    title: 'Foods that work with your medication',
    desc: 'Learn what to eat on GLP-1 therapy to maximise weight loss, minimise side effects, and keep energy levels stable throughout the day.',
    items: ['What to eat on GLP-1 medication', 'High-protein meal ideas & timing', 'Managing nausea with food choices'],
  },
  {
    label: 'Mindset',
    color: '#4A6FA5',
    bg: '#EEF2FA',
    icon: '<circle cx="11" cy="11" r="8" stroke="#4A6FA5" stroke-width="1.3"/><path d="M7.5 11C7.5 9 9 7.5 11 7.5C13 7.5 14.5 9 14.5 11" stroke="#4A6FA5" stroke-width="1.3" stroke-linecap="round"/><circle cx="11" cy="11" r="1.5" fill="#4A6FA5"/>',
    title: 'Build habits that last',
    desc: 'Sustainable weight loss is as much about mindset as medication. Our guided content helps you break patterns and stay consistent long-term.',
    items: ['5-min mindfulness for stress eating', 'Tracking progress — not perfection', 'Building an identity around health'],
  },
];

const wellnessTips = [
  {
    heading: 'Start with 10 minutes daily',
    body: 'Short, consistent movement beats sporadic intense workouts. Even a brisk walk boosts GLP-1 medication effectiveness.',
    bg: '#EBF6F0',
    icon: '<circle cx="8" cy="3" r="2" stroke="#2A7A4B" stroke-width="1.2"/><path d="M8 5V10M5 7H11M6 14L8 10L10 14" stroke="#2A7A4B" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>',
  },
  {
    heading: 'Prioritise protein at every meal',
    body: 'High-protein foods preserve muscle mass during weight loss and work in synergy with appetite-suppressing GLP-1 medications.',
    bg: '#FBF5E6',
    icon: '<path d="M8 2C5.5 2 4 4.5 4 7C4 9.5 5.5 12 8 12C10.5 12 12 9.5 12 7C12 4.5 10.5 2 8 2Z" stroke="#C9A84C" stroke-width="1.2"/><path d="M6 7H10M8 5V9" stroke="#C9A84C" stroke-width="1.2" stroke-linecap="round"/>',
  },
  {
    heading: 'Track progress, not perfection',
    body: 'Weight fluctuates daily. Focus on weekly trends and non-scale victories — energy levels, sleep quality, clothing fit.',
    bg: '#EEF2FA',
    icon: '<circle cx="8" cy="8" r="6" stroke="#4A6FA5" stroke-width="1.2"/><path d="M5.5 8C5.5 6.6 6.6 5.5 8 5.5C9.4 5.5 10.5 6.6 10.5 8" stroke="#4A6FA5" stroke-width="1.2" stroke-linecap="round"/><circle cx="8" cy="8" r="1.2" fill="#4A6FA5"/>',
  },
];

const faqs = [
  { q: 'Am I a good candidate for GLP-1 medication?', a: "GLP-1 medications like semaglutide are generally appropriate for adults with a BMI of 27+ and at least one weight-related condition, or a BMI of 30+. Our free health quiz and physician review will assess your personal eligibility — there's no obligation and no cost to find out if you qualify." },
  { q: 'How is CalyHealth different from other online weight loss companies?', a: 'We focus exclusively on clinically proven, physician-prescribed medications rather than supplements or unregulated compounds. Every treatment plan is reviewed by a licensed physician, and you receive ongoing support from a dedicated care team — not just a one-time prescription.' },
  { q: 'What are the side effects of semaglutide?', a: 'The most common side effects include nausea, constipation, and mild fatigue — particularly in the first few weeks as your body adjusts. Most patients find these manageable and temporary. Your physician will guide you through a gradual dose titration to minimize discomfort.' },
  { q: 'Does insurance cover CalyHealth treatments?', a: 'Our programs are self-pay, which allows us to offer physician-supervised medication at significantly lower prices than brand-name alternatives. We provide detailed receipts that some patients use to apply for FSA/HSA reimbursement. We do not bill insurance directly at this time.' },
  { q: 'How quickly will I see results?', a: 'Most patients report noticeable appetite reduction within the first 1–2 weeks. Meaningful weight loss typically begins by week 4–8, with the most significant results appearing between months 3 and 6.' },
];
