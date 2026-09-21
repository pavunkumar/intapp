-- Standalone script for the registrations table only (contact form + ₹299 fee).
-- Run in the Supabase SQL editor. Safe to re-run.
-- No sign-in required, so rows are not tied to auth.users. RLS is on with no
-- policies: only the server (service role) can read or write.

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

-- For tables created before state/district existed:
alter table public.registrations add column if not exists state text;
alter table public.registrations add column if not exists district text;

-- Make PostgREST pick up the new table immediately (fixes PGRST205).
notify pgrst, 'reload schema';
