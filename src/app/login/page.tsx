'use client';
export const dynamic = 'force-dynamic';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Suspense } from 'react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/dashboard';
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push(redirectTo);
      router.refresh();
    }
  }

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 5%' }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.75rem' }}>
            Welcome back
          </p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '2.2rem', fontWeight: 500, color: 'var(--teal-dark)', letterSpacing: '-0.02em' }}>
            Sign in to CalyHealth
          </h1>
        </div>

        <form onSubmit={handleSubmit} style={{ background: 'var(--white)', border: '1px solid var(--border)', padding: '2.5rem', borderRadius: '2px' }}>
          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '2px', padding: '0.75rem 1rem', marginBottom: '1.5rem', fontSize: '0.85rem', color: '#DC2626' }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={labelStyle}>Email address</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              required autoComplete="email"
              style={inputStyle}
              placeholder="you@example.com"
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>Password</label>
              <Link href="/forgot-password" style={{ fontSize: '0.78rem', color: 'var(--teal-mid)', textDecoration: 'none' }}>
                Forgot password?
              </Link>
            </div>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              required autoComplete="current-password"
              style={inputStyle}
              placeholder="••••••••"
            />
          </div>

          <button type="submit" disabled={loading} style={{ ...btnPrimary, width: '100%', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--muted)' }}>
            Don&apos;t have an account?{' '}
            <Link href="/signup" style={{ color: 'var(--teal-mid)', fontWeight: 500, textDecoration: 'none' }}>
              Create one free
            </Link>
          </p>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.75rem', color: 'var(--muted)', lineHeight: 1.6 }}>
          By signing in you agree to our{' '}
          <Link href="#" style={{ color: 'var(--teal-mid)', textDecoration: 'none' }}>Terms of Service</Link>
          {' '}and{' '}
          <Link href="#" style={{ color: 'var(--teal-mid)', textDecoration: 'none' }}>Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
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
