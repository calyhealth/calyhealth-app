import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

export async function POST(req: Request) {
  try {
    const { sessionId, email, messages } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    const svc = createServiceClient();

    // Upsert session
    await svc.from('chat_sessions').upsert({
      session_id: sessionId,
      email,
      escalated: true,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'session_id' });

    // Save all messages
    if (messages?.length) {
      const rows = messages.map((m: { role: string; content: string }) => ({
        session_id: sessionId,
        role: m.role,
        content: m.content,
      }));
      await svc.from('chat_messages').insert(rows);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Escalation error:', err);
    return NextResponse.json({ error: 'Failed to save escalation' }, { status: 500 });
  }
}
