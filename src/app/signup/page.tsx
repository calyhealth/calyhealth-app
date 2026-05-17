'use client';
export const dynamic = 'force-dynamic';
import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function SignupPage() {
  const supabase = createClient();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { first_name: firstName, last_name: lastName },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
    }
  }

  if (success) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 5%' }}>
        <div style={{ maxWidth: 480, textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, background: 'var(--teal-faint)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <svg viewBox="0 0 24 24" fill="none" style={{ width: 28, height: 28 }}>
              <path d="M5 13l4 4L19 7" stroke="var(--teal-mid)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '2rem', fontWeight: 500, color: 'var(--teal-dark)', marginBottom: '1rem' }}>
            Check your email
          </h2>
          <p style={{ color: 'var(--muted)', lineHeight: 1.75, marginBottom: '2rem' }}>
            We&apos;ve sent a confirmation link to <strong style={{ color: 'var(--charcoal)' }}>{email}</strong>. Click the link to activate your account, then you can sign in.
          </p>
          <Link href="/login" style={{ ...btnPrimary, display: 'inline-block' }}>Go to Sign In</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 5%' }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.75rem' }}>
            Get started free
          </p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '2.2rem', fontWeight: 500, color: 'var(--teal-dark)', letterSpacing: '-0.02em' }}>
            Create your account
          </h1>
        </div>

        <form onSubmit={handleSubmit} style={{ background: 'var(--white)', border: '1px solid var(--border)', padding: '2.5rem', borderRadius: '2px' }}>
          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '2px', padding: '0.75rem 1rem', marginBottom: '1.5rem', fontSize: '0.85rem', color: '#DC2626' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={labelStyle}>First name</label>
              <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} required style={inputStyle} placeholder="Jane" />
            </div>
            <div>
              <label style={labelStyle}>Last name</label>
              <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} required style={inputStyle} placeholder="Smith" />
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={labelStyle}>Email address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" style={inputStyle} placeholder="you@example.com" />
          </div>

          <div style={{ marginBottom: '1.75rem' }}>
            <label style={labelStyle}>Password <span style={{ fontWeight: 300, color: 'var(--muted)' }}>(min. 8 characters)</span></label>
            <div style={{ position: 'relative' }}>
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required autoComplete="new-password" style={{ ...inputStyle, paddingRight: '2.75rem' }} placeholder="••••••••" />
              <button type="button" onClick={() => setShowPassword(v => !v)}
                style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--muted)', display: 'flex', alignItems: 'center' }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} style={{ ...btnPrimary, width: '100%', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--muted)' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: 'var(--teal-mid)', fontWeight: 500, textDecoration: 'none' }}>Sign in</Link>
          </p>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.75rem', color: 'var(--muted)', lineHeight: 1.6 }}>
          By creating an account you agree to our{' '}
          <Link href="#" style={{ color: 'var(--teal-mid)', textDecoration: 'none' }}>Terms of Service</Link>
          {' '}and{' '}
          <Link href="#" style={{ color: 'var(--teal-mid)', textDecoration: 'none' }}>Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.82rem', fontWeight: 500,
  color: 'var(--charcoal)', marginBottom: '0.5rem', letterSpacing: '0.01em',
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.75rem 1rem', fontSize: '0.9rem',
  border: '1px solid var(--border)', borderRadius: '2px',
  background: 'var(--cream)', color: 'var(--body-text)',
  outline: 'none', fontFamily: 'inherit',
};

const btnPrimary: React.CSSProperties = {
  background: 'var(--teal-mid)', color: 'var(--white)',
  padding: '0.875rem 2rem', fontFamily: "'DM Sans', system-ui, sans-serif",
  fontSize: '0.85rem', fontWeight: 500, letterSpacing: '0.06em',
  textTransform: 'uppercase', border: 'none',
  cursor: 'pointer', borderRadius: '2px',
};
