-- Run this in the Supabase SQL editor.

-- Profiles ------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text,
  role text not null default 'student' check (role in ('student', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id and role = 'student');

-- Auto-create a profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Enrollments ---------------------------------------------------------
create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  course_id text not null,
  status text not null default 'pending' check (status in ('pending', 'completed')),
  amount_paise integer,
  razorpay_order_id text unique,
  razorpay_payment_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists enrollments_user_idx on public.enrollments (user_id);

alter table public.enrollments enable row level security;

-- Students can only read their own enrollments.
-- All writes go through the server (service role bypasses RLS), so no
-- insert/update policies are granted to clients: a user cannot mark
-- themselves as "completed".
create policy "Users can read own enrollments"
  on public.enrollments for select
  using (auth.uid() = user_id);


-- Registrations (contact form + ₹299 fee) ------------------------------
-- No sign-in required, so rows are not tied to auth.users. RLS is on with
-- no policies: only the server (service role) can read or write.
create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text not null,
  state text,
  district text,
  message text,
  status text not null default 'pending' check (status in ('pending', 'completed')),
  amount_paise integer not null,
  razorpay_order_id text unique,
  razorpay_payment_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.registrations enable row level security;

-- If you already created `registrations` before state/district were added:
alter table public.registrations add column if not exists state text;
alter table public.registrations add column if not exists district text;
