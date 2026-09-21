import { Hero } from "@/components/Hero";
import { Philosophy } from "@/components/Philosophy";
import { PricingCard } from "@/components/PricingCard";
import { RegistrationForm } from "@/components/RegistrationForm";
import { REGISTRATION_FEE_LABEL } from "@/lib/registration";
import { COURSES } from "@/lib/courses";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-ink">
      <Hero />
      <Philosophy />

      <section id="courses" className="mx-auto max-w-7xl px-6 py-20">
        <div className="max-w-xl">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Pick your track
          </h2>
          <p className="mt-3 text-mute">
            Each course is self-contained — start with Foundation, or jump
            straight to the level that matches where you are.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {COURSES.map((course) => (
            <PricingCard key={course.id} course={course} />
          ))}
        </div>
      </section>

      <section id="register" className="mx-auto max-w-7xl px-6 pb-20">
        <div className="max-w-2xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Register your interest
          </h2>
          <p className="mt-3 text-mute">
            Share your details and reserve your seat with a one-time{" "}
            {REGISTRATION_FEE_LABEL} registration fee. Our team will reach out
            with next steps.
          </p>
        </div>
        <RegistrationForm />
        </div>
      </section>

      <footer className="border-t border-ink-line px-6 py-10 text-center text-xs text-mute-dim">
        © {new Date().getFullYear()} Indian Nifty Trader. Educational content only — not
        investment advice.
      </footer>
    </main>
  );
}
