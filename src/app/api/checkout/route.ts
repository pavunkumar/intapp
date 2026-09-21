import { getCourseById } from "@/lib/courses";
import { getRazorpayInstance } from "@/lib/razorpay";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

// Creates a Razorpay order for a course purchase and a matching
// "pending" enrollment row. The client only ever sends a courseId —
// the amount charged is always looked up server-side from lib/courses,
// so a tampered request body can't change what gets billed.
export async function POST(request: Request) {
  try {
    const { courseId } = await request.json();

    if (!courseId || typeof courseId !== "string") {
      return NextResponse.json({ error: "courseId is required" }, { status: 400 });
    }

    const course = getCourseById(courseId);
    if (!course) {
      return NextResponse.json({ error: "Unknown course" }, { status: 404 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    const razorpay = getRazorpayInstance();
    const order = await razorpay.orders.create({
      amount: course.amountPaise,
      currency: "INR",
      // Razorpay receipts are capped at 40 chars.
      receipt: `${course.id}-${user.id}`.slice(0, 40),
      notes: {
        course_id: course.id,
        user_id: user.id,
      },
    });

    // Record the pending enrollment with the service-role client so it
    // can be looked up (and flipped to "completed") from the webhook,
    // which runs with no signed-in user session.
    const admin = createAdminClient();
    const { error: insertError } = await admin.from("enrollments").insert({
      user_id: user.id,
      course_id: course.id,
      status: "pending",
      amount_paise: course.amountPaise,
      razorpay_order_id: order.id,
    });

    if (insertError) {
      console.error("Failed to record pending enrollment:", insertError);
      return NextResponse.json({ error: "Could not start checkout" }, { status: 500 });
    }

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      courseName: course.title,
      prefill: {
        name: user.user_metadata?.full_name ?? "",
        email: user.email ?? "",
      },
    });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
