# Indian Nifty Trader

A dark-themed course platform for a trading education business, built with
Next.js (App Router), Tailwind CSS, Supabase, and Razorpay.

## Stack

- **Frontend:** Next.js 15 (App Router), Tailwind CSS, `lucide-react` icons
- **Auth & DB:** Supabase (Postgres, `@supabase/ssr`, Row Level Security)
- **Payments:** Razorpay (order creation + webhook signature verification)
- **Email:** Resend (HTML receipt on confirmed payment)

## Project layout

```
src/
  app/
    page.tsx                 Landing page (hero + pricing cards)
    login/page.tsx            Magic-link / email+password auth
    auth/callback/route.ts    Exchanges Supabase auth code for a session
    enrollment-success/       Post-payment redirect page
    api/checkout/route.ts     Creates a Razorpay order + pending enrollment
    api/webhook/route.ts      Verifies Razorpay signature, completes enrollment, emails receipt
  components/
    Hero.tsx, PricingCard.tsx, SyllabusAccordion.tsx, CheckoutButton.tsx
  lib/
    courses.ts                 Single source of truth for course content & pricing (in paise)
    razorpay.ts, email.ts
    supabase/{client,server,admin}.ts
  middleware.ts                 Refreshes the Supabase session cookie on every request
supabase/schema.sql              profiles + enrollments tables, RLS policies, signup trigger
```

## Setup

1. **Supabase**
   - Create a project, then run `supabase/schema.sql` in the SQL editor.
   - Copy the Project URL, anon key, and service role key into `.env.local`.

2. **Razorpay**
   - Grab your Key ID / Key Secret from the Razorpay dashboard.
   - Create a webhook pointing to `https://<your-domain>/api/webhook`,
     subscribed to the `payment.captured` event, and copy its secret into
     `RAZORPAY_WEBHOOK_SECRET`.

3. **Resend**
   - Verify a sending domain, create an API key, set `RESEND_FROM_EMAIL` to
     an address on that domain.

4. **Environment**
   ```bash
   cp .env.example .env.local
   # fill in the values above
   ```

5. **Install & run**
   ```bash
   npm install
   npm run dev
   ```

## How a purchase flows

1. Visitor clicks **Enroll now** on a pricing card → signs in if needed.
2. Client calls `POST /api/checkout` with only a `courseId`. The route looks
   up the authoritative price from `lib/courses.ts` (the client can never
   set the amount), creates a Razorpay order, and inserts a `pending`
   enrollment row using the Supabase service-role key.
3. The Razorpay checkout modal opens client-side.
4. On successful payment, Razorpay calls `POST /api/webhook`. The route
   verifies the `x-razorpay-signature` HMAC against the raw body before
   trusting anything in it, flips the matching enrollment to `completed`,
   and emails an HTML receipt via Resend.
5. Enrollment status is never writable by the client directly — RLS on
   `public.enrollments` grants `select` only; all inserts/updates go through
   the service-role client in the two API routes above.

## Not yet wired up

- **Sanity CMS**: course content currently lives in `src/lib/courses.ts` as
  static data, per the requirements doc's "Execution Workflow Blueprint"
  (schema → env → backend → UI). Swapping in Sanity is a follow-up: add the
  Sanity client, mirror the `Course` shape in a schema, and replace the
  import in `courses.ts` with a fetch — the pricing cards and checkout route
  don't need to change since they only depend on that shape.
- **Student dashboard** showing a user's own enrollments (the RLS policy for
  reading them is already in place — it just needs a page).
