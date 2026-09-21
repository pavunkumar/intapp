import { BarChart3, ShieldCheck, TrendingUp } from "lucide-react";
import Link from "next/link";

export function Hero() {
  return (
    <>
      <header className="bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-lg font-bold tracking-tight text-ink">
            Indian <span className="text-brand">Nifty</span> Trader
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium text-mute-faint">
            <a href="#philosophy" className="hover:text-ink">
              Philosophy
            </a>
            <a href="#courses" className="hover:text-ink">
              Courses
            </a>
            <a href="#register" className="hover:text-ink">
              Register
            </a>
            <Link
              href="/login"
              className="rounded-md bg-brand px-4 py-2 font-semibold text-white transition hover:bg-brand-light"
            >
              Sign in
            </Link>
          </nav>
        </div>
      </header>

      <section className="bg-white pb-20 pt-12">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-sm font-medium text-mute-faint">
            India&apos;s practical trading curriculum
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight tracking-tight text-ink sm:text-[52px]">
            <span className="text-brand">Trade the Nifty.</span>
            <br />
            Read the charts like a pro.
          </h1>
          <p className="mt-5 max-w-xl text-base text-mute-faint">
            From candlestick basics to option-selling mastery and long-term wealth
            building — five structured tracks, taught by traders, priced for retail
            India.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-mute-faint">
            <span className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-brand" /> Live back-chart analysis
            </span>
            <span className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-brand" /> SEBI-aware fundamentals
            </span>
            <span className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-brand" /> 2 live post-course sessions
            </span>
          </div>
        </div>
      </section>
    </>
  );
}
