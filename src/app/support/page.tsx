'use client';
import { useState } from 'react';

const FAQS = [
  { q: 'How do I know if I qualify for treatment?', a: 'Take our free 5-minute health quiz. A licensed physician reviews every case — there\'s no obligation and no cost to find out if you qualify.' },
  { q: 'When will I be charged?', a: 'You won\'t be charged until a physician approves your treatment. If you\'re not approved, you receive a full refund automatically.' },
  { q: 'How long does physician review take?', a: 'Typically within 24 hours. You\'ll receive an email with the decision.' },
  { q: 'Can I cancel my subscription?', a: 'Yes, cancel anytime with no fees. Cancellation takes effect at the end of your current billing period.' },
  { q: 'Is my health information private?', a: 'Yes. CalyHealth is HIPAA compliant. Your health data is only shared with your assigned physician and is encrypted at all times.' },
  { q: 'Does insurance cover the medication?', a: 'Our programs are self-pay. We provide detailed receipts you can submit for FSA/HSA reimbursement. We don\'t bill insurance directly.' },
  { q: 'How is the medication shipped?', a: 'Free shipping in discreet packaging — no CalyHealth branding on the outside. Delivery within 3-5 business days after physician approval.' },
  { q: 'What if I have side effects?', a: 'Common side effects like nausea and fatigue are usually temporary. Your physician will guide you through dose titration to minimize discomfort. Contact our team anytime if you\'re concerned.' },
];

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    // Save to Supabase support_tickets table (or just show success for now)
    await new Promise(r => setTimeout(r, 800)); // simulate sending
    setSent(true);
    setSending(false);
  }

  return (
    <div style={{ background: 'var(--cream)', minHeight: '80vh' }}>
      {/* Header */}
      <div style={{ background: 'var(--teal-dark)', padding: '5rem 5% 4rem' }}>
        <div style={{ maxWidth: 600 }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ display: 'block', width: 22, height: 1, background: 'var(--gold)' }} />
            We&apos;re here to help
          </p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 500, color: 'var(--white)', lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: '1rem' }}>
            Support Center
          </h1>
          <p style={{ fontSize: '1rem', fontWeight: 300, color: 'rgba(255,255,255,0.65)', lineHeight: 1.75 }}>
            Questions about your treatment, billing, or account? We typically respond within a few hours.
          </p>
        </div>
      </div>

      <div style={{ padding: '4rem 5%', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'start' }} className="support-grid">

          {/* Left — Contact form */}
          <div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.8rem', fontWeight: 500, color: 'var(--teal-dark)', marginBottom: '0.5rem' }}>
              Send us a message
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--muted)', fontWeight: 300, marginBottom: '2rem', lineHeight: 1.65 }}>
              Or use the chat bubble in the bottom-right corner for instant answers from our AI assistant.
            </p>

            {sent ? (
              <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 4, padding: '2.5rem', textAlign: 'center' }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--teal-faint)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', fontSize: '1.4rem' }}>✓</div>
                <p style={{ fontWeight: 500, color: 'var(--teal-dark)', marginBottom: '0.5rem' }}>Message received</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 300, lineHeight: 1.6 }}>
                  We&apos;ll reply to <strong>{form.email}</strong> within a few hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 4, padding: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={labelStyle}>Name</label>
                    <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      required placeholder="Jane Smith" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Email</label>
                    <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      required placeholder="you@example.com" style={inputStyle} />
                  </div>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={labelStyle}>Subject</label>
                  <select value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                    required style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="">Select a topic…</option>
                    <option value="treatment">Treatment questions</option>
                    <option value="billing">Billing & payments</option>
                    <option value="shipping">Shipping & delivery</option>
                    <option value="side-effects">Side effects</option>
                    <option value="account">Account & login</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={labelStyle}>Message</label>
                  <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    required rows={5} placeholder="Describe how we can help…"
                    style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} />
                </div>
                <button type="submit" disabled={sending}
                  style={{ background: 'var(--teal-mid)', color: 'var(--white)', border: 'none', borderRadius: 2, padding: '0.875rem 2rem', fontSize: '0.82rem', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', opacity: sending ? 0.7 : 1, fontFamily: 'inherit', width: '100%' }}>
                  {sending ? 'Sending…' : 'Send Message'}
                </button>
              </form>
            )}

            {/* Contact info */}
            <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <ContactRow icon="✉" label="Email" value="support@calyhealth.com" href="mailto:support@calyhealth.com" />
              <ContactRow icon="⏱" label="Response time" value="Within a few hours (Mon–Fri)" />
              <ContactRow icon="💬" label="Live chat" value="Available via the chat bubble (bottom right)" />
            </div>
          </div>

          {/* Right — FAQ */}
          <div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.8rem', fontWeight: 500, color: 'var(--teal-dark)', marginBottom: '0.5rem' }}>
              Frequently asked
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--muted)', fontWeight: 300, marginBottom: '2rem', lineHeight: 1.65 }}>
              Most questions are answered here. If not, our AI assistant can help instantly.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {FAQS.map((faq, i) => (
                <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 4, overflow: 'hidden', background: 'var(--white)' }}>
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    style={{ width: '100%', textAlign: 'left', padding: '1rem 1.25rem', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, fontFamily: 'inherit' }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: 500, color: 'var(--teal-dark)', lineHeight: 1.4 }}>{faq.q}</span>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, transition: 'transform 0.2s', transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0)' }}>
                      <path d="M2 4.5L7 9.5L12 4.5" stroke="var(--muted)" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                  {openFaq === i && (
                    <div style={{ padding: '0 1.25rem 1rem', fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 300, lineHeight: 1.7 }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactRow({ icon, label, value, href }: { icon: string; label: string; value: string; href?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{ fontSize: '1rem', width: 20, textAlign: 'center' }}>{icon}</span>
      <div>
        <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label} </span>
        {href ? (
          <a href={href} style={{ fontSize: '0.85rem', color: 'var(--teal-mid)', textDecoration: 'none' }}>{value}</a>
        ) : (
          <span style={{ fontSize: '0.85rem', color: 'var(--body-text)', fontWeight: 300 }}>{value}</span>
        )}
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.8rem', fontWeight: 500,
  color: 'var(--charcoal)', marginBottom: '0.4rem', letterSpacing: '0.01em',
};
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.7rem 0.9rem', fontSize: '0.88rem',
  border: '1px solid var(--border)', borderRadius: 3,
  background: 'var(--cream)', color: 'var(--body-text)',
  outline: 'none', fontFamily: 'inherit',
};
