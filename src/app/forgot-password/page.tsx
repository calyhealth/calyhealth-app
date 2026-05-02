'use client';
export const dynamic = 'force-dynamic';
import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
    });
    if (error) { setError(error.message); setLoading(false); return; }
    setSent(true);
  }

  if (sent) {
    return (
      <div style={pageWrap}>
        <div style={{ maxWidth: 440, textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, background: 'var(--teal-faint)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <svg viewBox="0 0 24 24" fill="none" style={{ width: 24, height: 24 }}>
              <path d="M3 8l9 6 9-6M3 8v10a1 1 0 001 1h16a1 1 0 001-1V8M3 8l9-5 9 5" stroke="var(--teal-mid)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 style={headingStyle}>Check your email</h1>
          <p style={{ color: 'var(--muted)', lineHeight: 1.75, marginBottom: '2rem', fontWeight: 300 }}>
            We sent a password reset link to <strong style={{ color: 'var(--charcoal)' }}>{email}</strong>.
          </p>
          <Link href="/login" style={btnPrimary}>Back to Sign In</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={pageWrap}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={headingStyle}>Reset your password</h1>
          <p style={{ color: 'var(--muted)', fontWeight: 300, fontSize: '0.9rem' }}>Enter your email and we&apos;ll send you a reset link.</p>
        </div>
        <form onSubmit={handleSubmit} style={{ background: 'var(--white)', border: '1px solid var(--border)', padding: '2rem', borderRadius: '2px' }}>
          {error && <div style={errorBox}>{error}</div>}
          <label style={labelStyle}>Email address</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus style={inputStyle} placeholder="you@example.com" />
          <button type="submit" disabled={loading} style={{ ...btnPrimary, width: '100%', marginTop: '1.25rem', display: 'block', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Sending…' : 'Send Reset Link'}
          </button>
          <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.85rem', color: 'var(--muted)' }}>
            <Link href="/login" style={{ color: 'var(--teal-mid)', textDecoration: 'none' }}>← Back to sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

const pageWrap: React.CSSProperties = { minHeight: '75vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 5%' };
const headingStyle: React.CSSProperties = { fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '2rem', fontWeight: 500, color: 'var(--teal-dark)', letterSpacing: '-0.02em', marginBottom: '0.5rem' };
const labelStyle: React.CSSProperties = { display: 'block', fontSize: '0.82rem', fontWeight: 500, color: 'var(--charcoal)', marginBottom: '0.5rem' };
const inputStyle: React.CSSProperties = { width: '100%', padding: '0.75rem 1rem', fontSize: '0.9rem', border: '1px solid var(--border)', borderRadius: '2px', background: 'var(--cream)', color: 'var(--body-text)', outline: 'none', fontFamily: 'inherit' };
const btnPrimary: React.CSSProperties = { background: 'var(--teal-mid)', color: 'var(--white)', padding: '0.875rem 2rem', fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: '0.85rem', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', border: 'none', cursor: 'pointer', borderRadius: '2px', textDecoration: 'none', textAlign: 'center' };
const errorBox: React.CSSProperties = { background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '2px', padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: '0.85rem', color: '#DC2626' };
