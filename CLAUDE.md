# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install
npm run dev     # Next.js dev server on :3000
npm run build
npm run lint    # next lint
```

There is no test suite. `@/*` maps to `src/*` (see tsconfig). Copy `.env.example` to `.env.local` for required env vars (Supabase, Razorpay, Resend, `NEXT_PUBLIC_SITE_URL`). Database setup is manual: run `supabase/schema.sql` in the Supabase SQL editor (no migration tooling). README.md has the full setup walkthrough.

## Architecture

Next.js 15 App Router + React 19 + Tailwind (dark theme) course-sales site for a trading education business. Supabase for auth/DB, Razorpay for payments, Resend for receipt emails.

### Two parallel payment flows

Both follow the same pattern: an API route creates a Razorpay order and a `pending` DB row keyed by `razorpay_order_id`; the client opens the Razorpay modal; `POST /api/webhook` later flips the row to `completed`.

| Flow | UI | Route | Table | Auth |
|---|---|---|---|---|
| Course purchase | `PricingCard` → `CheckoutButton` | `/api/checkout` | `enrollments` (has `user_id`) | Supabase sign-in required |
| Registration (₹299 fee + contact form) | `RegistrationForm` | `/api/register` | `registrations` (standalone) | None |

`/api/webhook` looks up the order id in `registrations` first, then falls back to `enrollments`. The README's project layout predates the registration flow and doesn't mention it.

### Invariants to preserve

- **Prices are server-authoritative.** Clients send only a `courseId` (checkout) or nothing (register). Amounts come from `src/lib/courses.ts` (`amountPaise`, course price changes happen only there) and `src/lib/registration.ts` (`REGISTRATION_FEE_PAISE`). All amounts are in paise; `priceLabel`/`REGISTRATION_FEE_LABEL` are display-only strings that must be kept in sync by hand.
- **Only the webhook marks payments `completed`.** It verifies the `x-razorpay-signature` HMAC against the raw body (`request.text()`, before any JSON parsing) and is idempotent. It returns 200 for unmatched orders / non-`payment.captured` events so Razorpay doesn't retry, and swallows email failures after the DB update succeeds.
- **RLS:** `enrollments` allows client `select` of own rows only; `registrations` has RLS on with no policies. All writes use the service-role client (`lib/supabase/admin.ts`, server-only, bypasses RLS).
- In `/api/register` and `/api/checkout`, the Supabase admin client is built before the Razorpay order is created so a misconfigured key fails before leaving an orphaned order.

### Supabase clients (`src/lib/supabase/`)

Three distinct clients: `client.ts` (browser, anon key), `server.ts` (async, cookie-based, for route handlers/server components), `admin.ts` (service role). `src/middleware.ts` refreshes the session cookie on every non-static request.

### Content and data

- `src/lib/courses.ts` — static course catalog (Sanity CMS integration is planned but not wired; `NEXT_PUBLIC_SANITY_*` env vars are unused). Keep the `Course` shape stable since pricing cards and checkout depend on it.
- `src/lib/indian-locations.ts` — state → districts map; `isValidLocation` is used by `/api/register` for server-side validation of the form's state/district selects (`OTHER_DISTRICT` is an allowed fallback).
- Server-side validation for registration (name/email/phone regexes, +91 stripping) lives in `/api/register`; phone must be a 10-digit Indian mobile starting 6–9.
- `schema.sql` is written to be re-run (`if not exists`); `registrations.state/district` were added later via `alter table`.

### Not built yet

Student dashboard (RLS for it already exists) and Sanity CMS.
