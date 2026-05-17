'use client';
import { useState, useRef, useEffect } from 'react';

type Message = { role: 'user' | 'assistant'; content: string };
type View = 'chat' | 'escalate' | 'escalated';

const SESSION_ID = typeof crypto !== 'undefined'
  ? crypto.randomUUID()
  : Math.random().toString(36).slice(2);

const GREETING: Message = {
  role: 'assistant',
  content: "Hi! I'm Caly 👋 I can answer questions about our treatments, pricing, eligibility, and how everything works. How can I help?",
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>('chat');
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const [escalateEmail, setEscalateEmail] = useState('');
  const [escalateSaving, setEscalateSaving] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');

    const userMsg: Message = { role: 'user', content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next, sessionId: SESSION_ID }),
      });
      const data = await res.json();
      const reply: Message = { role: 'assistant', content: data.message || "Sorry, something went wrong. Please try again." };
      setMessages(prev => [...prev, reply]);
      if (!open) setUnread(u => u + 1);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting. Please try again in a moment." }]);
    } finally {
      setLoading(false);
    }
  }

  async function handleEscalate() {
    if (!escalateEmail.includes('@')) return;
    setEscalateSaving(true);
    try {
      await fetch('/api/chat/escalate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: SESSION_ID, email: escalateEmail, messages }),
      });
    } catch { /* silent */ }
    setEscalateSaving(false);
    setView('escalated');
  }

  return (
    <>
      {/* Chat panel */}
      {open && (
        <div style={{
          position: 'fixed', bottom: '5rem', right: '1.5rem', zIndex: 9999,
          width: 360, maxWidth: 'calc(100vw - 2rem)',
          background: 'var(--white)', borderRadius: 8,
          boxShadow: '0 8px 48px rgba(0,0,0,0.18)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden', border: '1px solid var(--border)',
          maxHeight: '75vh',
        }}>
          {/* Header */}
          <div style={{ background: 'var(--teal-dark)', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>
                🌿
              </div>
              <div>
                <div style={{ color: 'var(--white)', fontWeight: 500, fontSize: '0.9rem' }}>Caly</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem' }}>CalyHealth Support</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {view === 'chat' && (
                <button onClick={() => setView('escalate')}
                  style={{ background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: 4, padding: '4px 10px', color: 'rgba(255,255,255,0.8)', fontSize: '0.72rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                  Talk to human
                </button>
              )}
              {view !== 'chat' && (
                <button onClick={() => setView('chat')}
                  style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '0.75rem', fontFamily: 'inherit' }}>
                  ← Back
                </button>
              )}
              <button onClick={() => setOpen(false)}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '1.2rem', lineHeight: 1, padding: '2px 4px' }}>
                ×
              </button>
            </div>
          </div>

          {/* Chat view */}
          {view === 'chat' && (
            <>
              <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {messages.map((m, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      maxWidth: '82%', padding: '0.65rem 0.9rem',
                      borderRadius: m.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                      background: m.role === 'user' ? 'var(--teal-mid)' : 'var(--teal-faint)',
                      color: m.role === 'user' ? 'var(--white)' : 'var(--body-text)',
                      fontSize: '0.85rem', lineHeight: 1.55, fontWeight: 300,
                    }}>
                      {m.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                    <div style={{ padding: '0.65rem 0.9rem', borderRadius: '12px 12px 12px 2px', background: 'var(--teal-faint)', fontSize: '0.85rem', color: 'var(--muted)' }}>
                      <span style={{ display: 'inline-flex', gap: 3 }}>
                        <span style={{ animation: 'bounce 1s infinite 0s' }}>·</span>
                        <span style={{ animation: 'bounce 1s infinite 0.2s' }}>·</span>
                        <span style={{ animation: 'bounce 1s infinite 0.4s' }}>·</span>
                      </span>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
              <div style={{ padding: '0.75rem', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, flexShrink: 0 }}>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder="Ask me anything…"
                  style={{
                    flex: 1, padding: '0.65rem 0.9rem', fontSize: '0.88rem',
                    border: '1px solid var(--border)', borderRadius: 6,
                    background: 'var(--cream)', color: 'var(--body-text)',
                    outline: 'none', fontFamily: 'inherit',
                  }}
                />
                <button onClick={sendMessage} disabled={loading || !input.trim()}
                  style={{
                    background: 'var(--teal-mid)', border: 'none', borderRadius: 6,
                    padding: '0 1rem', cursor: 'pointer',
                    opacity: loading || !input.trim() ? 0.5 : 1,
                    display: 'flex', alignItems: 'center',
                  }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9L22 2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </>
          )}

          {/* Escalate view */}
          {view === 'escalate' && (
            <div style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <p style={{ fontWeight: 500, color: 'var(--teal-dark)', marginBottom: '0.5rem', fontSize: '0.95rem' }}>Talk to our team</p>
                <p style={{ fontSize: '0.83rem', color: 'var(--muted)', fontWeight: 300, lineHeight: 1.6 }}>
                  Leave your email and we&apos;ll reply within a few hours. We&apos;ll include your chat history so you don&apos;t have to repeat yourself.
                </p>
              </div>
              <input
                type="email" value={escalateEmail} onChange={e => setEscalateEmail(e.target.value)}
                placeholder="your@email.com"
                style={{ padding: '0.75rem', fontSize: '0.9rem', border: '1px solid var(--border)', borderRadius: 6, background: 'var(--cream)', color: 'var(--body-text)', outline: 'none', fontFamily: 'inherit' }}
              />
              <button onClick={handleEscalate} disabled={escalateSaving || !escalateEmail.includes('@')}
                style={{
                  background: 'var(--teal-mid)', color: 'var(--white)', border: 'none', borderRadius: 6,
                  padding: '0.75rem', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer',
                  opacity: escalateSaving || !escalateEmail.includes('@') ? 0.6 : 1,
                  fontFamily: 'inherit', letterSpacing: '0.04em',
                }}>
                {escalateSaving ? 'Sending…' : 'Request Human Support'}
              </button>
              <p style={{ fontSize: '0.75rem', color: 'var(--muted)', textAlign: 'center', fontWeight: 300 }}>
                Or email us directly at{' '}
                <a href="mailto:support@calyhealth.com" style={{ color: 'var(--teal-mid)', textDecoration: 'none' }}>
                  support@calyhealth.com
                </a>
              </p>
            </div>
          )}

          {/* Escalated confirmation */}
          {view === 'escalated' && (
            <div style={{ flex: 1, padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', textAlign: 'center' }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--teal-faint)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                ✓
              </div>
              <div>
                <p style={{ fontWeight: 500, color: 'var(--teal-dark)', marginBottom: '0.5rem' }}>We&apos;ve got your request</p>
                <p style={{ fontSize: '0.83rem', color: 'var(--muted)', fontWeight: 300, lineHeight: 1.6 }}>
                  Our team will review your conversation and reply to <strong>{escalateEmail}</strong> within a few hours.
                </p>
              </div>
              <button onClick={() => { setView('chat'); }}
                style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, padding: '0.6rem 1.25rem', fontSize: '0.83rem', cursor: 'pointer', color: 'var(--muted)', fontFamily: 'inherit' }}>
                Back to chat
              </button>
            </div>
          )}
        </div>
      )}

      {/* Bubble button */}
      <button onClick={() => setOpen(o => !o)}
        style={{
          position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9999,
          width: 52, height: 52, borderRadius: '50%',
          background: 'var(--teal-dark)', border: 'none',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform 0.15s ease',
        }}>
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
        {unread > 0 && !open && (
          <span style={{
            position: 'absolute', top: -4, right: -4,
            background: '#EF4444', color: 'white',
            borderRadius: '50%', width: 18, height: 18,
            fontSize: '0.65rem', fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {unread}
          </span>
        )}
      </button>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </>
  );
}
