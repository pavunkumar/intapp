"use client";

import { createClient } from "@/lib/supabase/client";
import { Mail, Lock, Loader2 } from "lucide-react";
import { useState } from "react";

type Mode = "magic-link" | "password";

export default function LoginPage() {
  const supabase = createClient();
  const [mode, setMode] = useState<Mode>("magic-link");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);
    setMessage(
      error
        ? { type: "error", text: error.message }
        : { type: "ok", text: "Check your inbox for a sign-in link." }
    );
  }

  async function handlePasswordAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      setLoading(false);
      setMessage(
        error
          ? { type: "error", text: error.message }
          : { type: "ok", text: "Account created. Check your inbox to confirm your email." }
      );
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      window.location.href = "/";
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink px-4 text-white">
      <div className="w-full max-w-sm rounded-md border border-ink-line bg-ink-soft p-8 shadow-xl">
        <h1 className="text-2xl font-bold tracking-tight">
          Indian <span className="text-brand-soft">Nifty</span> Trader
        </h1>
        <p className="mt-1 text-sm text-mute">Sign in to access your courses.</p>

        <div className="mt-6 flex gap-2 rounded-md bg-ink p-1 text-sm font-medium">
          <button
            onClick={() => setMode("magic-link")}
            className={`flex-1 rounded-md py-1.5 transition ${
              mode === "magic-link" ? "bg-brand/20 text-brand-soft" : "text-mute-dim hover:text-white"
            }`}
          >
            Magic link
          </button>
          <button
            onClick={() => setMode("password")}
            className={`flex-1 rounded-md py-1.5 transition ${
              mode === "password" ? "bg-brand/20 text-brand-soft" : "text-mute-dim hover:text-white"
            }`}
          >
            Password
          </button>
        </div>

        <form
          onSubmit={mode === "magic-link" ? handleMagicLink : handlePasswordAuth}
          className="mt-6 space-y-4"
        >
          {mode === "password" && isSignUp && (
            <input
              type="text"
              required
              placeholder="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-md border border-ink-line bg-ink px-3 py-2.5 text-sm outline-none focus:border-brand"
            />
          )}

          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mute-dim" />
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-ink-line bg-ink py-2.5 pl-9 pr-3 text-sm outline-none focus:border-brand"
            />
          </div>

          {mode === "password" && (
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mute-dim" />
              <input
                type="password"
                required
                minLength={6}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-ink-line bg-ink py-2.5 pl-9 pr-3 text-sm outline-none focus:border-brand"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-brand py-2.5 text-sm font-semibold text-white transition hover:bg-brand-light disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "magic-link"
              ? "Send magic link"
              : isSignUp
              ? "Create account"
              : "Sign in"}
          </button>
        </form>

        {mode === "password" && (
          <button
            onClick={() => setIsSignUp((v) => !v)}
            className="mt-4 w-full text-center text-xs text-mute-dim hover:text-white"
          >
            {isSignUp ? "Already have an account? Sign in" : "New here? Create an account"}
          </button>
        )}

        {message && (
          <p
            className={`mt-4 text-center text-sm ${
              message.type === "ok" ? "text-brand-soft" : "text-red-400"
            }`}
          >
            {message.text}
          </p>
        )}
      </div>
    </main>
  );
}
