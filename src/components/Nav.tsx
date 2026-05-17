'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'var(--white)', borderBottom: '1px solid var(--border)',
      padding: '0 5%', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', height: '72px',
    }}>
      <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
        <Image
          src="/logo.png"
          alt="CalyHealth"
          width={56}
          height={56}
          style={{ objectFit: 'contain' }}
          priority
        />
      </Link>

      {/* Desktop links — hidden on tablet/mobile via globals.css */}
      <ul className="nav-links-desktop" style={{
        display: 'flex', alignItems: 'center', gap: '2rem', listStyle: 'none',
        margin: 0, padding: 0,
      }}>
        <li><Link href="/#how" style={navLinkStyle}>How It Works</Link></li>
        <li><Link href="/treatments" style={navLinkStyle}>Treatments</Link></li>
        <li><Link href="/#results" style={navLinkStyle}>Results</Link></li>
        <li><Link href="/#faq" style={navLinkStyle}>FAQ</Link></li>
        <li><Link href="/login" style={navLinkStyle}>Login</Link></li>
        <li>
          <Link href="/quiz" style={{
            background: 'var(--teal-mid)', color: 'var(--white)',
            padding: '0.5rem 1.25rem', borderRadius: '2px',
            fontSize: '0.8rem', fontWeight: 500, letterSpacing: '0.06em',
            textTransform: 'uppercase', textDecoration: 'none',
          }}>
            Start Free Quiz
          </Link>
        </li>
      </ul>

      {/* Mobile hamburger — hidden on desktop via globals.css */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="nav-mobile-btn"
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}
        aria-label="Toggle menu"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 24, height: 24 }}>
          {menuOpen
            ? <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round"/>
            : <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round"/>}
        </svg>
      </button>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div style={{
          position: 'absolute', top: 72, left: 0, right: 0,
          background: 'var(--white)', borderBottom: '1px solid var(--border)',
          padding: '1rem 5%', display: 'flex', flexDirection: 'column', gap: '1rem',
          zIndex: 99,
        }}>
          <Link href="/#how" style={navLinkStyle} onClick={() => setMenuOpen(false)}>How It Works</Link>
          <Link href="/treatments" style={navLinkStyle} onClick={() => setMenuOpen(false)}>Treatments</Link>
          <Link href="/#results" style={navLinkStyle} onClick={() => setMenuOpen(false)}>Results</Link>
          <Link href="/#faq" style={navLinkStyle} onClick={() => setMenuOpen(false)}>FAQ</Link>
          <Link href="/login" style={navLinkStyle} onClick={() => setMenuOpen(false)}>Login</Link>
          <Link href="/quiz" style={{
            background: 'var(--teal-mid)', color: 'var(--white)',
            padding: '0.75rem 1.25rem', borderRadius: '2px',
            fontSize: '0.8rem', fontWeight: 500, letterSpacing: '0.06em',
            textTransform: 'uppercase', textDecoration: 'none', textAlign: 'center',
          }} onClick={() => setMenuOpen(false)}>
            Start Free Quiz
          </Link>
        </div>
      )}
    </nav>
  );
}

const navLinkStyle: React.CSSProperties = {
  fontSize: '0.875rem', fontWeight: 400,
  color: 'var(--body-text)', textDecoration: 'none', letterSpacing: '0.01em',
};
