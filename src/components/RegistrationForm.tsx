"use client";

import { INDIA_LOCATIONS, INDIA_STATES, OTHER_DISTRICT } from "@/lib/indian-locations";
import { REGISTRATION_FEE_LABEL } from "@/lib/registration";
import { CheckCircle2, Loader2 } from "lucide-react";
import Script from "next/script";
import { useState } from "react";

const inputClass =
  "w-full rounded-md border border-ink-line bg-ink px-3 py-2.5 text-sm text-white outline-none placeholder:text-mute-faint focus:border-brand";

const DEFAULT_STATE = "Tamil Nadu";

export function RegistrationForm() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    state: DEFAULT_STATE,
    district: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paid, setPaid] = useState(false);

  const set =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  // Changing the state clears the district, since districts belong to a state.
  const districts = form.state ? INDIA_LOCATIONS[form.state] ?? [] : [];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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
        description: "Registration",
        order_id: data.orderId,
        prefill: data.prefill,
        theme: { color: "#2660D3" },
        modal: { ondismiss: () => setLoading(false) },
        // The webhook confirms payment server-side; this is just feedback.
        handler: () => {
          setPaid(true);
          setLoading(false);
        },
      });
      razorpay.open();
    } catch (err) {
      console.error(err);
      setError("Could not start registration. Please try again.");
      setLoading(false);
    }
  }

  if (paid) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-md border border-ink-line bg-ink-soft p-10 text-center">
        <CheckCircle2 className="h-12 w-12 text-brand-soft" />
        <h3 className="text-xl font-bold">You&apos;re registered</h3>
        <p className="max-w-sm text-sm text-mute">
          We&apos;re confirming your payment now — a receipt is on its way to{" "}
          {form.email}, and our team will contact you shortly.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-md border border-ink-line bg-ink-soft p-6 sm:p-8"
    >
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm text-mute">
          Full name
          <input
            required
            minLength={2}
            maxLength={100}
            value={form.fullName}
            onChange={set("fullName")}
            placeholder="Your name"
            className={`mt-1.5 ${inputClass}`}
          />
        </label>
        <label className="block text-sm text-mute">
          Mobile number
          <input
            required
            type="tel"
            inputMode="numeric"
            pattern="(\+91|91)?[\s-]?[6-9][0-9]{9}"
            title="10-digit Indian mobile number"
            value={form.phone}
            onChange={set("phone")}
            placeholder="98765 43210"
            className={`mt-1.5 ${inputClass}`}
          />
        </label>
      </div>

      <label className="block text-sm text-mute">
        Email
        <input
          required
          type="email"
          maxLength={200}
          value={form.email}
          onChange={set("email")}
          placeholder="you@example.com"
          className={`mt-1.5 ${inputClass}`}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm text-mute">
          State / UT
          <select
            required
            value={form.state}
            onChange={(e) => setForm((f) => ({ ...f, state: e.target.value, district: "" }))}
            className={`mt-1.5 ${inputClass}`}
          >
            <option value="" disabled>
              Select state
            </option>
            {INDIA_STATES.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm text-mute">
          District
          <select
            required
            disabled={!form.state}
            value={form.district}
            onChange={set("district") as unknown as React.ChangeEventHandler<HTMLSelectElement>}
            className={`mt-1.5 ${inputClass} disabled:opacity-50`}
          >
            <option value="" disabled>
              {form.state ? "Select district" : "Select state first"}
            </option>
            {districts.map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
            {form.state && <option value={OTHER_DISTRICT}>{OTHER_DISTRICT}</option>}
          </select>
        </label>
      </div>

      <label className="block text-sm text-mute">
        Message <span className="text-mute-faint">(optional)</span>
        <textarea
          rows={3}
          maxLength={500}
          value={form.message}
          onChange={set("message")}
          placeholder="Which course are you interested in?"
          className={`mt-1.5 resize-none ${inputClass}`}
        />
      </label>

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-brand py-3 text-sm font-semibold text-white transition hover:bg-brand-light disabled:opacity-60"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Register · {REGISTRATION_FEE_LABEL}
      </button>

      {error && <p className="text-center text-xs text-red-400">{error}</p>}
    </form>
  );
}
