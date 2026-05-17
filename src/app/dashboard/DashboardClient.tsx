'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

const TABS = ['Overview', 'My Treatment', 'Messages', 'Account'];

type ClinicalStatus = 'no_intake' | 'submitted' | 'under_review' | 'approved' | 'denied' | 'needs_info';

interface StatusData {
  status: ClinicalStatus;
  intake: Record<string, unknown> | null;
  details?: {
    prescription?: {
      medicationName: string;
      strength: string;
      physicianName: string;
      writtenAt: string;
      trackingNumber?: string;
    };
    denialReason?: string;
    estimatedReviewTime?: string;
  };
}

const STATUS_CONFIG: Record<ClinicalStatus, { label: string; color: string; bg: string; border: string; dot: string }> = {
  no_intake:     { label: 'No intake submitted',       color: '#6B7280', bg: '#F9FAFB', border: '#E5E7EB', dot: '#9CA3AF' },
  submitted:     { label: 'Intake submitted',          color: 'var(--teal-mid)', bg: 'var(--teal-faint)', border: 'var(--border)', dot: 'var(--teal-mid)' },
  under_review:  { label: 'Under physician review',    color: '#92400E', bg: '#FFFBEB', border: '#FDE68A', dot: '#F59E0B' },
  approved:      { label: 'Approved — Rx written',     color: '#065F46', bg: '#ECFDF5', border: '#6EE7B7', dot: '#10B981' },
  denied:        { label: 'Not approved',              color: '#991B1B', bg: '#FEF2F2', border: '#FCA5A5', dot: '#EF4444' },
  needs_info:    { label: 'Additional info needed',    color: '#92400E', bg: '#FFFBEB', border: '#FDE68A', dot: '#F59E0B' },
};

export default function DashboardClient({
  user,
}: {
  user: { email: string; name: string };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const justCheckedOut = searchParams.get('checkout') === 'success';
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState('Overview');
  const [statusData, setStatusData] = useState<StatusData | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [messages, setMessages] = useState<{ id: string; sender: string; body: string; created_at: string }[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/clinical/status');
      if (res.ok) setStatusData(await res.json());
    } catch {
      // silent
    } finally {
      setStatusLoading(false);
    }
  }, []);

  const fetchMessages = useCallback(async () => {
    const { data } = await supabase
      .from('messages')
      .select('id, sender, body, created_at')
      .order('created_at', { ascending: true });
    if (data) setMessages(data);
  }, [supabase]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStatus();
    fetchMessages();
    // Poll status every 30s while under review
    const interval = setInterval(() => {
      if (statusData?.status === 'under_review' || statusData?.status === 'submitted') {
        fetchStatus();
      }
    }, 30_000);
    return () => clearInterval(interval);
  }, [fetchStatus, fetchMessages, statusData?.status]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setSending(true);
    await supabase.from('messages').insert({ body: newMessage.trim(), sender: 'patient' });
    setNewMessage('');
    await fetchMessages();
    setSending(false);
  }

  const status = statusData?.status ?? 'no_intake';
  const statusCfg = STATUS_CONFIG[status];

  return (
    <div style={{ minHeight: '80vh', background: 'var(--cream)' }}>
      {/* Header */}
      <div style={{ background: 'var(--teal-dark)', padding: '2.5rem 5% 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', paddingBottom: '1.5rem' }}>
          <div>
            <p style={{ fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.4rem' }}>Patient Portal</p>
            <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.8rem', fontWeight: 500, color: 'var(--white)', letterSpacing: '-0.02em' }}>
              Welcome back{user.name ? `, ${user.name}` : ''}
            </h1>
            <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)', marginTop: '0.2rem' }}>{user.email}</p>
          </div>
          <button onClick={handleSignOut} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.65)', padding: '0.5rem 1rem', borderRadius: '2px', fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'inherit' }}>
            Sign out
          </button>
        </div>
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)', overflowX: 'auto' }}>
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.75rem 1.25rem', fontFamily: 'inherit', fontSize: '0.83rem', fontWeight: activeTab === tab ? 500 : 400, color: activeTab === tab ? 'var(--white)' : 'rgba(255,255,255,0.45)', borderBottom: `2px solid ${activeTab === tab ? 'var(--gold)' : 'transparent'}`, whiteSpace: 'nowrap', transition: 'all 0.15s' }}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '2.5rem 5%' }}>
        {/* Post-checkout success banner */}
        {justCheckedOut && (
          <div style={{ background: '#ECFDF5', border: '1px solid #6EE7B7', borderRadius: '2px', padding: '1rem 1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 12 }}>
            <svg viewBox="0 0 20 20" fill="none" style={{ width: 20, height: 20, flexShrink: 0 }}>
              <circle cx="10" cy="10" r="9" stroke="#10B981" strokeWidth="1.5"/>
              <path d="M6.5 10l2.5 2.5 4.5-4.5" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div>
              <p style={{ fontSize: '0.88rem', fontWeight: 500, color: '#065F46' }}>Payment received — you&apos;re enrolled!</p>
              <p style={{ fontSize: '0.8rem', color: '#047857', fontWeight: 300, marginTop: '0.1rem' }}>A licensed physician will review your intake within 24 hours. You&apos;ll receive an email when approved.</p>
            </div>
          </div>
        )}

        {activeTab === 'Overview' && (
          <OverviewTab statusData={statusData} statusLoading={statusLoading} statusCfg={statusCfg} status={status} />
        )}
        {activeTab === 'My Treatment' && (
          <TreatmentTab statusData={statusData} status={status} statusCfg={statusCfg} />
        )}
        {activeTab === 'Messages' && (
          <MessagesTab messages={messages} newMessage={newMessage} setNewMessage={setNewMessage} onSend={sendMessage} sending={sending} />
        )}
        {activeTab === 'Account' && (
          <AccountTab email={user.email} onSignOut={handleSignOut} />
        )}
      </div>
    </div>
  );
}

function OverviewTab({ statusData, statusLoading, statusCfg, status }: {
  statusData: StatusData | null; statusLoading: boolean;
  statusCfg: typeof STATUS_CONFIG[ClinicalStatus]; status: ClinicalStatus;
}) {
  const planName = (statusData?.intake as { plan_id?: string } | null)?.plan_id === 'semaglutide'
    ? 'Semaglutide Program'
    : (statusData?.intake as { plan_id?: string } | null)?.plan_id === 'metabolic'
    ? 'Metabolic Booster Rx'
    : 'Total Weight Loss Program';

  return (
    <div>
      {/* Clinical status card */}
      <div style={{ background: statusCfg.bg, border: `1px solid ${statusCfg.border}`, borderLeft: `4px solid ${statusCfg.dot}`, borderRadius: '2px', padding: '1.25rem 1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: statusCfg.dot, flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: '0.88rem', fontWeight: 500, color: statusCfg.color }}>{statusLoading ? 'Loading status…' : statusCfg.label}</p>
            <p style={{ fontSize: '0.78rem', color: statusCfg.color, opacity: 0.8, fontWeight: 300 }}>
              {status === 'no_intake' && <><Link href="/quiz" style={{ color: 'var(--teal-mid)', fontWeight: 500 }}>Take the health quiz</Link> to get started.</>}
              {status === 'submitted' && 'Your intake has been received and is queued for physician review.'}
              {status === 'under_review' && 'A physician is reviewing your profile — usually complete within 24 hours.'}
              {status === 'approved' && 'Your prescription has been written and your first shipment is being prepared.'}
              {status === 'denied' && (statusData?.details?.denialReason || 'Unfortunately you were not approved at this time. Contact support for details.')}
              {status === 'needs_info' && 'Your care team needs more information. Check your email or send a message below.'}
            </p>
          </div>
        </div>
        <span style={{ fontSize: '0.72rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: statusCfg.color, background: 'rgba(255,255,255,0.6)', padding: '4px 10px', borderRadius: '2px', whiteSpace: 'nowrap' }}>
          {statusLoading ? '…' : statusCfg.label}
        </span>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '2rem' }} className="dash-stats">
        {[
          { label: 'Program', value: status === 'no_intake' ? '—' : planName, sub: status === 'no_intake' ? 'Not started' : 'Monthly subscription' },
          { label: 'Physician', value: status === 'approved' ? statusData?.details?.prescription?.physicianName || 'Assigned' : status === 'no_intake' ? '—' : 'Pending assignment', sub: status === 'approved' ? 'Licensed MD' : '' },
          { label: 'Next shipment', value: status === 'approved' ? 'Dispatching' : '—', sub: status === 'approved' ? '2 business days' : 'After approval' },
          { label: 'Tracking', value: statusData?.details?.prescription?.trackingNumber || '—', sub: status === 'approved' ? 'Check your email' : 'Not yet shipped' },
        ].map(card => (
          <div key={card.label} style={{ background: 'var(--white)', border: '1px solid var(--border)', padding: '1.5rem', borderRadius: '2px' }}>
            <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)', fontWeight: 500, marginBottom: '0.5rem' }}>{card.label}</p>
            <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.1rem', fontWeight: 600, color: 'var(--teal-mid)', marginBottom: '0.2rem', lineHeight: 1.2 }}>{card.value}</p>
            <p style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 300 }}>{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Journey checklist */}
      <div style={{ background: 'var(--white)', border: '1px solid var(--border)', padding: '2rem', borderRadius: '2px' }}>
        <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.3rem', fontWeight: 600, color: 'var(--teal-mid)', marginBottom: '1.5rem' }}>Your journey</h3>
        {[
          { done: status !== 'no_intake', active: status === 'no_intake', title: 'Complete health quiz', sub: 'Takes 5 minutes' },
          { done: ['under_review','approved','denied'].includes(status), active: status === 'submitted', title: 'Intake under review', sub: 'Queued for physician' },
          { done: ['approved'].includes(status), active: status === 'under_review', title: 'Physician review', sub: 'Licensed MD reviews your profile' },
          { done: status === 'approved', active: false, title: 'Prescription written', sub: 'Rx sent to compounding pharmacy' },
          { done: false, active: status === 'approved', title: 'First shipment dispatched', sub: 'Arrives in 3–5 business days' },
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '0.6rem 0', borderBottom: i < 4 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0, marginTop: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: item.done ? 'var(--teal-mid)' : item.active ? 'var(--gold)' : 'var(--border)' }}>
              {item.done
                ? <svg viewBox="0 0 12 12" fill="none" style={{ width: 10, height: 10 }}><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                : item.active
                ? <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--teal-dark)' }} />
                : <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--muted)' }} />
              }
            </div>
            <div>
              <p style={{ fontSize: '0.88rem', fontWeight: item.done || item.active ? 500 : 300, color: item.done ? 'var(--charcoal)' : item.active ? 'var(--teal-mid)' : 'var(--muted)' }}>{item.title}</p>
              <p style={{ fontSize: '0.76rem', color: 'var(--muted)', fontWeight: 300 }}>{item.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TreatmentTab({ statusData, status, statusCfg }: {
  statusData: StatusData | null; status: ClinicalStatus;
  statusCfg: typeof STATUS_CONFIG[ClinicalStatus];
}) {
  const intake = statusData?.intake as Record<string, unknown> | null;
  const planId = (intake?.plan_id as string) || 'total';
  const planNames: Record<string, string> = { semaglutide: 'Semaglutide Program', total: 'Total Weight Loss Program', metabolic: 'Metabolic Booster Rx' };
  const planPrices: Record<string, string> = { semaglutide: '$199', total: '$349', metabolic: '$149' };

  if (status === 'no_intake') {
    return (
      <div style={{ background: 'var(--white)', border: '1px solid var(--border)', padding: '3rem', textAlign: 'center', borderRadius: '2px' }}>
        <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.3rem', color: 'var(--teal-mid)', marginBottom: '1rem' }}>No active treatment</p>
        <p style={{ fontSize: '0.88rem', color: 'var(--muted)', marginBottom: '1.5rem' }}>Start with the health quiz to get matched with a treatment plan.</p>
        <Link href="/quiz" style={{ background: 'var(--teal-mid)', color: 'var(--white)', padding: '0.75rem 1.75rem', borderRadius: '2px', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Take the Health Quiz
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 700 }}>
      <div style={{ background: 'var(--white)', border: '1px solid var(--border)', padding: '2rem', marginBottom: '1.5rem', borderRadius: '2px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--gold)', fontWeight: 500, marginBottom: '0.3rem' }}>Active Plan</p>
            <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.4rem', fontWeight: 600, color: 'var(--teal-mid)' }}>{planNames[planId]}</p>
          </div>
          <span style={{ fontSize: '0.72rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: statusCfg.color, background: statusCfg.bg, padding: '4px 10px', borderRadius: '2px', border: `1px solid ${statusCfg.border}` }}>
            {statusCfg.label}
          </span>
        </div>

        {status === 'approved' && statusData?.details?.prescription && (
          <div style={{ background: 'var(--teal-faint)', border: '1px solid var(--border)', padding: '1.25rem', borderRadius: '2px', marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '0.78rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--teal-mid)', marginBottom: '0.75rem' }}>Prescription Details</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {[
                { label: 'Medication', value: statusData.details.prescription.medicationName },
                { label: 'Strength', value: statusData.details.prescription.strength },
                { label: 'Physician', value: statusData.details.prescription.physicianName },
                { label: 'Written', value: new Date(statusData.details.prescription.writtenAt).toLocaleDateString() },
              ].map(item => (
                <div key={item.label}>
                  <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)', fontWeight: 500 }}>{item.label}</p>
                  <p style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--charcoal)' }}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          {[
            { label: 'Monthly cost', value: planPrices[planId] + '/mo' },
            { label: 'Next billing', value: status === 'approved' ? 'Monthly auto-renew' : 'After physician approval' },
          ].map(item => (
            <div key={item.label} style={{ padding: '1rem', background: 'var(--cream)', borderRadius: '2px' }}>
              <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)', fontWeight: 500, marginBottom: '0.3rem' }}>{item.label}</p>
              <p style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--charcoal)' }}>{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MessagesTab({ messages, newMessage, setNewMessage, onSend, sending }: {
  messages: { id: string; sender: string; body: string; created_at: string }[];
  newMessage: string; setNewMessage: (v: string) => void;
  onSend: (e: React.FormEvent) => void; sending: boolean;
}) {
  return (
    <div style={{ maxWidth: 700 }}>
      <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '2px', minHeight: 320, marginBottom: '1px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {messages.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 0', textAlign: 'center' }}>
            <svg viewBox="0 0 48 48" fill="none" style={{ width: 40, height: 40, marginBottom: '1rem', color: 'var(--teal-faint)' }}>
              <rect x="4" y="8" width="40" height="28" rx="3" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M4 16l20 12 20-12" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.1rem', color: 'var(--teal-mid)', marginBottom: '0.4rem' }}>No messages yet</p>
            <p style={{ fontSize: '0.82rem', color: 'var(--muted)', fontWeight: 300 }}>Send a message to your care team below.</p>
          </div>
        ) : (
          messages.map(msg => (
            <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.sender === 'patient' ? 'flex-end' : 'flex-start' }}>
              <div style={{ maxWidth: '75%', padding: '0.75rem 1rem', borderRadius: '2px', background: msg.sender === 'patient' ? 'var(--teal-mid)' : 'var(--cream)', border: msg.sender === 'patient' ? 'none' : '1px solid var(--border)' }}>
                <p style={{ fontSize: '0.88rem', color: msg.sender === 'patient' ? 'white' : 'var(--body-text)', fontWeight: 300 }}>{msg.body}</p>
              </div>
              <p style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: '0.25rem' }}>
                {msg.sender === 'care_team' ? 'Care team · ' : ''}{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          ))
        )}
      </div>
      <form onSubmit={onSend} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderTop: 'none', padding: '1rem', display: 'flex', gap: '0.75rem', borderRadius: '0 0 2px 2px' }}>
        <input
          type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)}
          placeholder="Message your care team…"
          style={{ flex: 1, padding: '0.7rem 1rem', border: '1px solid var(--border)', borderRadius: '2px', fontSize: '0.88rem', background: 'var(--cream)', fontFamily: 'inherit', outline: 'none' }}
        />
        <button type="submit" disabled={sending || !newMessage.trim()} style={{ background: 'var(--teal-mid)', color: 'var(--white)', border: 'none', borderRadius: '2px', padding: '0.7rem 1.25rem', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 500, fontFamily: 'inherit', opacity: sending || !newMessage.trim() ? 0.6 : 1 }}>
          {sending ? '…' : 'Send'}
        </button>
      </form>
    </div>
  );
}

function AccountTab({ email, onSignOut }: { email: string; onSignOut: () => void }) {
  return (
    <div style={{ maxWidth: 560 }}>
      <div style={{ background: 'var(--white)', border: '1px solid var(--border)', padding: '2rem', marginBottom: '1rem', borderRadius: '2px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--charcoal)', marginBottom: '1.5rem' }}>Account details</h3>
        <div style={{ marginBottom: '1.25rem' }}>
          <p style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)', fontWeight: 500, marginBottom: '0.3rem' }}>Email</p>
          <p style={{ fontSize: '0.92rem', color: 'var(--charcoal)' }}>{email}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link href="/forgot-password" style={{ background: 'var(--teal-mid)', color: 'var(--white)', border: 'none', borderRadius: '2px', padding: '0.6rem 1.25rem', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 500, fontFamily: 'inherit', textDecoration: 'none' }}>
            Change Password
          </Link>
          <button onClick={() => window.open('https://billing.stripe.com/p/login', '_blank')} style={{ background: 'transparent', color: 'var(--teal-mid)', border: '1px solid var(--border)', borderRadius: '2px', padding: '0.6rem 1.25rem', cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'inherit' }}>
            Manage Billing
          </button>
        </div>
      </div>
      <div style={{ background: 'var(--white)', border: '1px solid var(--border)', padding: '2rem', borderRadius: '2px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--charcoal)', marginBottom: '0.5rem' }}>Sign out</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '1rem', fontWeight: 300 }}>You&apos;ll be returned to the home page.</p>
        <button onClick={onSignOut} style={{ background: 'transparent', color: '#DC2626', border: '1px solid #FCA5A5', borderRadius: '2px', padding: '0.6rem 1.25rem', cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'inherit' }}>
          Sign Out
        </button>
      </div>
    </div>
  );
}
