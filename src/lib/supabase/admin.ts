import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client. Bypasses Row Level Security.
 *
 * SERVER-ONLY. Never import this from a Client Component or expose
 * SUPABASE_SERVICE_ROLE_KEY to the browser. Used by the Razorpay
 * webhook to mark enrollments as completed after a verified payment.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
