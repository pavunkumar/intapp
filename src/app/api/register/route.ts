import { isValidLocation } from "@/lib/indian-locations";
import { REGISTRATION_FEE_PAISE } from "@/lib/registration";
import { getRazorpayInstance } from "@/lib/razorpay";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[6-9]\d{9}$/; // 10-digit Indian mobile

// Saves the contact-form details as a "pending" registration and creates
// a Razorpay order for the fixed registration fee. The webhook flips the
// row to "completed" once the payment is captured.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const fullName = String(body.fullName ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const phone = String(body.phone ?? "")
      .replace(/[\s-]/g, "")
      .replace(/^(\+91|91)(?=\d{10}$)/, "");
    const state = String(body.state ?? "").trim();
    const district = String(body.district ?? "").trim();
    const message = String(body.message ?? "").trim();

    if (fullName.length < 2 || fullName.length > 100) {
      return NextResponse.json({ error: "Please enter your full name" }, { status: 400 });
    }
    if (!EMAIL_RE.test(email) || email.length > 200) {
      return NextResponse.json({ error: "Please enter a valid email" }, { status: 400 });
    }
    if (!PHONE_RE.test(phone)) {
      return NextResponse.json(
        { error: "Please enter a valid 10-digit mobile number" },
        { status: 400 }
      );
    }
    if (!isValidLocation(state, district)) {
      return NextResponse.json({ error: "Please select your state and district" }, { status: 400 });
    }
    if (message.length > 500) {
      return NextResponse.json({ error: "Message must be under 500 characters" }, { status: 400 });
    }

    // Build the DB client first so a missing Supabase key fails before we
    // create a Razorpay order that would be left orphaned.
    const admin = createAdminClient();

    const razorpay = getRazorpayInstance();
    const order = await razorpay.orders.create({
      amount: REGISTRATION_FEE_PAISE,
      currency: "INR",
      receipt: `reg-${Date.now()}`,
      notes: { type: "registration", email },
    });

    const { error: insertError } = await admin.from("registrations").insert({
      full_name: fullName,
      email,
      phone,
      state,
      district,
      message: message || null,
      status: "pending",
      amount_paise: REGISTRATION_FEE_PAISE,
      razorpay_order_id: order.id,
    });

    if (insertError) {
      console.error("Failed to record registration:", insertError);
      return NextResponse.json({ error: "Could not start registration" }, { status: 500 });
    }

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      prefill: { name: fullName, email, contact: phone },
    });
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
