import { createAdminClient } from "@/lib/supabase/admin";
import { sendReceiptEmail } from "@/lib/email";
import { getCourseById } from "@/lib/courses";
import crypto from "crypto";
import { NextResponse } from "next/server";

// Razorpay webhook endpoint. Verifies the x-razorpay-signature HMAC
// before trusting the payload, then marks the matching enrollment as
// completed and emails a receipt. This is the only place enrollment
// status flips to "completed" — the client can never do that directly
// (see the RLS policies in supabase/schema.sql).
export async function POST(request: Request) {
  const signature = request.headers.get("x-razorpay-signature");
  const rawBody = await request.text();

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(rawBody)
    .digest("hex");

  const signatureValid =
    expectedSignature.length === signature.length &&
    crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(signature));

  if (!signatureValid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(rawBody);

  if (event.event !== "payment.captured") {
    // Acknowledge anything else so Razorpay doesn't retry; we only act
    // on captures.
    return NextResponse.json({ received: true });
  }

  const payment = event.payload?.payment?.entity;
  const orderId: string | undefined = payment?.order_id;
  const paymentId: string | undefined = payment?.id;

  if (!orderId || !paymentId) {
    return NextResponse.json({ error: "Malformed payload" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Contact-form registrations (no user account) are checked first.
  const { data: registration } = await admin
    .from("registrations")
    .select("id, full_name, email, status, amount_paise")
    .eq("razorpay_order_id", orderId)
    .maybeSingle();

  if (registration) {
    if (registration.status !== "completed") {
      const { error: regUpdateError } = await admin
        .from("registrations")
        .update({
          status: "completed",
          razorpay_payment_id: paymentId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", registration.id);

      if (regUpdateError) {
        console.error("Webhook: failed to update registration", regUpdateError);
        return NextResponse.json({ error: "Update failed" }, { status: 500 });
      }

      try {
        await sendReceiptEmail({
          to: registration.email,
          name: registration.full_name,
          courseTitle: "Registration",
          amountPaise: registration.amount_paise,
          paymentId,
          orderId,
        });
      } catch (emailError) {
        console.error("Webhook: failed to send registration receipt", emailError);
      }
    }
    return NextResponse.json({ received: true });
  }

  const { data: enrollment, error: fetchError } = await admin
    .from("enrollments")
    .select("id, user_id, course_id, status, amount_paise")
    .eq("razorpay_order_id", orderId)
    .single();

  if (fetchError || !enrollment) {
    console.error("Webhook: no matching enrollment for order", orderId, fetchError);
    // Still 200 — nothing Razorpay retrying will fix if the row is missing.
    return NextResponse.json({ received: true });
  }

  // Idempotency: Razorpay may deliver the same event more than once.
  if (enrollment.status === "completed") {
    return NextResponse.json({ received: true });
  }

  const { error: updateError } = await admin
    .from("enrollments")
    .update({
      status: "completed",
      razorpay_payment_id: paymentId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", enrollment.id);

  if (updateError) {
    console.error("Webhook: failed to update enrollment", updateError);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  const { data: userData } = await admin.auth.admin.getUserById(enrollment.user_id);
  const course = getCourseById(enrollment.course_id);
  const email = userData?.user?.email;

  if (email && course) {
    try {
      await sendReceiptEmail({
        to: email,
        name: userData?.user?.user_metadata?.full_name ?? null,
        courseTitle: course.title,
        amountPaise: enrollment.amount_paise ?? course.amountPaise,
        paymentId,
        orderId,
      });
    } catch (emailError) {
      // Payment already succeeded and enrollment is recorded — don't
      // fail the webhook over a delivery hiccup.
      console.error("Webhook: failed to send receipt email", emailError);
    }
  }

  return NextResponse.json({ received: true });
}
