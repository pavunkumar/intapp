import Razorpay from "razorpay";

// Server-only Razorpay SDK instance. RAZORPAY_KEY_SECRET must never
// reach the browser — only NEXT_PUBLIC_RAZORPAY_KEY_ID is public.
export function getRazorpayInstance() {
  return new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });
}
