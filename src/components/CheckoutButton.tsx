"use client";

import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";
import Script from "next/script";
import { useState } from "react";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void;
    };
  }
}

interface CheckoutButtonProps {
  courseId: string;
  label: string;
  className?: string;
}

export function CheckoutButton({ courseId, label, className }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = `/login?next=/`;
      return;
    }

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        setLoading(false);
        return;
      }

      const razorpay = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "Indian Nifty Trader",
        description: data.courseName,
        order_id: data.orderId,
        prefill: data.prefill,
        theme: { color: "#2660D3" },
        modal: {
          ondismiss: () => setLoading(false),
        },
        handler: () => {
          // The webhook confirms payment server-side and updates the
          // enrollment; this just gives the user quick feedback.
          window.location.href = "/enrollment-success";
        },
      });

      razorpay.open();
    } catch (err) {
      console.error(err);
      setError("Could not start checkout. Please try again.");
      setLoading(false);
    }
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <button
        onClick={handleClick}
        disabled={loading}
        className={
          className ??
          "flex w-full items-center justify-center gap-2 rounded-md bg-brand py-3 text-sm font-semibold text-white transition hover:bg-brand-light disabled:opacity-60"
        }
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {label}
      </button>
      {error && <p className="mt-2 text-center text-xs text-red-400">{error}</p>}
    </>
  );
}
