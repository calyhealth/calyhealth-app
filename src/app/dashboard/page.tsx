import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirectTo=/dashboard');

  const name = user.user_metadata?.first_name || '';
  const email = user.email!;

  return (
    <Suspense>
      <DashboardClient user={{ email, name }} />
    </Suspense>
  );
}
