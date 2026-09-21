import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function EnrollmentSuccessPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-ink px-6 text-center text-white">
      <CheckCircle2 className="h-14 w-14 text-brand-soft" />
      <h1 className="text-2xl font-bold">Payment received</h1>
      <p className="max-w-sm text-sm text-mute">
        We&apos;re confirming your payment now — a receipt is on its way to your
        inbox and your enrollment will show as active within a minute.
      </p>
      <Link
        href="/"
        className="mt-4 rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-light"
      >
        Back to courses
      </Link>
    </main>
  );
}
