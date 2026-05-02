'use client';
export const dynamic = 'force-dynamic';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) { setError(error.message); setLoading(false); return; }
    setDone(true);
    setTimeout(() => router.push('/dashboard'), 2000);
  }

  if (done) {
    return (
      <div style={pageWrap}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, background: 'var(--teal-faint)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <svg viewBox="0 0 24 24" fill="none" style={{ width: 24, height: 24 }}><path d="M5 13l4 4L19 7" stroke="var(--teal-mid)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <h2 style={headingStyle}>Password updated</h2>
          <p style={{ color: 'var(--muted)', fontWeight: 300 }}>Redirecting you to your dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div style={pageWrap}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={headingStyle}>Set a new password</h1>
        </div>
        <form onSubmit={handleSubmit} style={{ background: 'var(--white)', border: '1px solid var(--border)', padding: '2rem', borderRadius: '2px' }}>
          {error && <div style={errorBox}>{error}</div>}
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>New password <span style={{ fontWeight: 300, color: 'var(--muted)' }}>(min. 8 chars)</span></label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={inputStyle} />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={labelStyle}>Confirm password</label>
            <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required style={inputStyle} />
          </div>
          <button type="submit" disabled={loading} style={{ ...btnPrimary, width: '100%', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Saving…' : 'Update Password'}
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
const btnPrimary: React.CSSProperties = { background: 'var(--teal-mid)', color: 'var(--white)', padding: '0.875rem 2rem', fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: '0.85rem', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', border: 'none', cursor: 'pointer', borderRadius: '2px' };
const errorBox: React.CSSProperties = { background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '2px', padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: '0.85rem', color: '#DC2626' };
