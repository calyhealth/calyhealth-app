-- Run this in your Supabase SQL editor to set up the schema

-- ── Waitlist (ineligible quiz visitors who want to be notified) ─────────
create table if not exists public.waitlist (
  id         uuid primary key default gen_random_uuid(),
  email      text unique not null,
  created_at timestamptz default now()
);

alter table public.waitlist enable row level security;

-- Only service role can read/write (no user-facing RLS needed)
create policy "Service role full access on waitlist"
  on public.waitlist for all using (auth.role() = 'service_role');

-- ── Profiles (extends auth.users) ──────────────────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  first_name  text,
  last_name   text,
  phone       text,
  dob         text,   -- MM/DD/YYYY, collected post-signup
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, first_name, last_name)
  values (
    new.id,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ── Clinical intakes (Beluga submissions) ──────────────────────────────
create table if not exists public.clinical_intakes (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  plan_id             text not null,
  beluga_patient_id   text unique,
  beluga_intake_id    text,
  status              text not null default 'submitted'
                        check (status in ('submitted','under_review','approved','denied','needs_info')),
  quiz_answers        jsonb,
  eligibility_outcome text,
  soft_flags          jsonb default '[]',
  hipaa_consent_at    timestamptz,
  shipping_address    jsonb,
  prescription_id     text,
  prescription_data   jsonb,
  denial_reason       text,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

alter table public.clinical_intakes enable row level security;

create policy "Users can view own intake"
  on public.clinical_intakes for select using (auth.uid() = user_id);

-- Service role (used by API routes) can do everything
create policy "Service role full access on clinical_intakes"
  on public.clinical_intakes for all using (auth.role() = 'service_role');


-- ── Orders (linked to Stripe + clinical intake) ─────────────────────────
create table if not exists public.orders (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid not null references auth.users(id) on delete cascade,
  plan_id                 text not null,
  stripe_session_id       text unique,
  stripe_subscription_id  text unique,
  status                  text not null default 'pending_physician_approval'
                            check (status in (
                              'pending_physician_approval','approved','active',
                              'denied','cancelled','paused'
                            )),
  shipping_address        jsonb,
  created_at              timestamptz default now(),
  updated_at              timestamptz default now()
);

alter table public.orders enable row level security;

create policy "Users can view own orders"
  on public.orders for select using (auth.uid() = user_id);

create policy "Service role full access on orders"
  on public.orders for all using (auth.role() = 'service_role');


-- ── Messages (patient <-> care team) ───────────────────────────────────
create table if not exists public.messages (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  sender      text not null check (sender in ('patient', 'care_team')),
  body        text not null,
  read        boolean default false,
  created_at  timestamptz default now()
);

alter table public.messages enable row level security;

create policy "Users can view own messages"
  on public.messages for select using (auth.uid() = user_id);

create policy "Users can insert own messages"
  on public.messages for insert with check (auth.uid() = user_id and sender = 'patient');

create policy "Service role full access on messages"
  on public.messages for all using (auth.role() = 'service_role');


-- ── Helper: updated_at trigger ─────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

create trigger set_intakes_updated_at
  before update on public.clinical_intakes
  for each row execute procedure public.set_updated_at();

create trigger set_orders_updated_at
  before update on public.orders
  for each row execute procedure public.set_updated_at();
