import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer style={{ background: 'var(--teal-dark)', padding: '4rem 5% 2.5rem' }}>
      <div style={{
        display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr',
        gap: '3rem', paddingBottom: '3rem',
        borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '2rem',
      }} className="footer-grid">
        <div>
          <Link href="/" style={{ display: 'inline-block', marginBottom: '1rem' }}>
            <Image
              src="/logo.png"
              alt="CalyHealth"
              width={80}
              height={80}
              style={{ objectFit: 'contain', borderRadius: '12px' }}
            />
          </Link>
          <p style={{ fontSize: '0.83rem', fontWeight: 300, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, maxWidth: 260 }}>
            Physician-prescribed wellness programs designed to help adults achieve lasting, medically-supervised weight loss.
          </p>
          <p style={{ marginTop: '1.25rem', fontSize: '0.75rem', color: 'rgba(201,168,76,0.7)', fontWeight: 300, letterSpacing: '0.04em' }}>
            PERSONALIZED CARE. REAL RESULTS.
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
          © 2026 CalyHealth, Inc. All rights reserved.
        </p>
        <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)', fontWeight: 300, maxWidth: 560, lineHeight: 1.65 }}>
          CalyHealth connects patients with licensed healthcare providers. Medications are prescribed at the sole discretion of a licensed physician after a full clinical review. These products are not intended to diagnose, treat, cure, or prevent any disease. Results may vary. Not available in all states.
        </p>
      </div>
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
