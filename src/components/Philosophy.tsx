import { BookOpen, ShieldCheck } from "lucide-react";

const pillars = [
  {
    icon: BookOpen,
    step: "01",
    title: "Fundamentals first",
    lead: "You can't trade what you don't understand.",
    points: [
      "How markets, exchanges and indices actually work",
      "Reading price action and charts before touching an indicator",
      "Knowing why a setup works, not just when to click buy",
    ],
  },
  {
    icon: ShieldCheck,
    step: "02",
    title: "Risk before reward",
    lead: "Staying in the game beats winning one trade.",
    points: [
      "Decide your stop-loss and position size before you enter",
      "Risk a small, fixed slice of capital on every trade",
      "Treat losses as a cost of business, and cap them",
    ],
  },
];

export function Philosophy() {
  return (
    <section id="philosophy" className="border-b border-ink-line bg-ink">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <p className="text-sm font-medium text-brand-soft">Our philosophy</p>
        <h2 className="mt-3 max-w-2xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          Learn the basics deeply.
          <br />
          <span className="text-mute-dim">Protect your capital always.</span>
        </h2>
        <p className="mt-4 max-w-xl text-mute">
          Good traders aren&apos;t the ones who predict the market. They&apos;re the
          ones who understand it and manage what they can lose. Every course here is
          built on those two ideas.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {pillars.map(({ icon: Icon, step, title, lead, points }) => (
            <div
              key={title}
              className="rounded-md border border-ink-line bg-ink-soft p-7 transition hover:border-brand"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-md bg-brand/15 text-brand-soft">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-sm font-semibold text-mute-faint">{step}</span>
              </div>
              <h3 className="mt-6 text-xl font-bold">{title}</h3>
              <p className="mt-1 text-sm text-mute-dim">{lead}</p>
              <ul className="mt-5 space-y-2.5 text-sm text-mute">
                {points.map((point) => (
                  <li key={point} className="flex items-start gap-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-soft" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
