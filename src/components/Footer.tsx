import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{ background: 'var(--teal-dark)', padding: '4rem 5% 2.5rem' }}>
      <div style={{
        display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr',
        gap: '3rem', paddingBottom: '3rem',
        borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '2rem',
      }} className="footer-grid">
        <div>
          <Link href="/" style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: '1.55rem', fontWeight: 600, color: 'var(--white)',
            letterSpacing: '-0.01em', textDecoration: 'none',
            display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '1rem',
          }}>
            <div style={{
              width: 28, height: 28, background: 'var(--teal-mid)',
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg viewBox="0 0 14 14" fill="none" style={{ width: 14, height: 14 }}>
                <path d="M7 1C7 1 3 4 3 8C3 10.2 4.8 12 7 12C9.2 12 11 10.2 11 8C11 4 7 1 7 1Z" fill="#C9A84C"/>
                <path d="M7 5V11M5 8H9" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            </div>
            CalyHealth
          </Link>
          <p style={{ fontSize: '0.83rem', fontWeight: 300, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, maxWidth: 260 }}>
            Physician-prescribed wellness programs designed to help adults 30–55 achieve lasting, medically-supervised weight loss.
          </p>
        </div>

        <FooterCol title="Treatments" links={[
          { label: 'Semaglutide Program', href: '/treatments' },
          { label: 'Metabolic Booster Rx', href: '/treatments' },
          { label: 'Total Weight Loss', href: '/treatments' },
          { label: 'Compare Programs', href: '/treatments' },
        ]} />
        <FooterCol title="Company" links={[
          { label: 'About CalyHealth', href: '#' },
          { label: 'Our Physicians', href: '#' },
          { label: 'Clinical Research', href: '#' },
          { label: 'Press', href: '#' },
        ]} />
        <FooterCol title="Support" links={[
          { label: 'Help Center', href: '#' },
          { label: 'Contact Us', href: '#' },
          { label: 'Privacy Policy', href: '#' },
          { label: 'Terms of Service', href: '#' },
        ]} />
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '2rem', flexWrap: 'wrap' }}>
        <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.25)', fontWeight: 300 }}>
          © 2025 CalyHealth, Inc. All rights reserved.
        </p>
        <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)', fontWeight: 300, maxWidth: 560, lineHeight: 1.65 }}>
          CalyHealth connects patients with licensed healthcare providers. Medications are prescribed at the sole discretion of a licensed physician after a full clinical review. These products are not intended to diagnose, treat, cure, or prevent any disease. Results may vary. Not available in all states.
        </p>
      </div>

      <style>{`
        @media (max-width: 900px) { .footer-grid { grid-template-columns: 1fr 1fr !important; gap: 2rem !important; } }
        @media (max-width: 600px) { .footer-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h4 style={{ fontSize: '0.72rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.5)', marginBottom: '1rem' }}>
        {title}
      </h4>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {links.map(link => (
          <li key={link.label} style={{ marginBottom: '0.6rem' }}>
            <Link href={link.href} style={{ fontSize: '0.85rem', fontWeight: 300, color: 'rgba(255,255,255,0.45)', textDecoration: 'none' }}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
