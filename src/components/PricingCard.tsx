import type { Course } from "@/lib/courses";
import { CheckoutButton } from "@/components/CheckoutButton";
import { SyllabusAccordion } from "@/components/SyllabusAccordion";
import { TrendingUp, Zap, Gem } from "lucide-react";

const accentStyles: Record<
  Course["accent"],
  { ring: string; badge: string; icon: string; button: string }
> = {
  bull: {
    ring: "hover:border-brand",
    badge: "bg-brand/15 text-brand-soft",
    icon: "text-brand-soft",
    button: "bg-brand hover:bg-brand-light text-white",
  },
  amber: {
    ring: "hover:border-brand-light",
    badge: "bg-brand/15 text-brand-soft",
    icon: "text-brand-soft",
    button: "bg-brand hover:bg-brand-light text-white",
  },
  violet: {
    ring: "hover:border-brand-soft",
    badge: "bg-brand/15 text-brand-soft",
    icon: "text-brand-soft",
    button: "bg-brand hover:bg-brand-light text-white",
  },
};

const accentIcon: Record<Course["accent"], typeof TrendingUp> = {
  bull: TrendingUp,
  amber: Zap,
  violet: Gem,
};

export function PricingCard({ course }: { course: Course }) {
  const styles = accentStyles[course.accent];
  const Icon = accentIcon[course.accent];

  return (
    <div
      className={`flex flex-col rounded-md border border-ink-line bg-ink-soft p-6 transition ${styles.ring}`}
    >
      <div className={`inline-flex w-fit items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold ${styles.badge}`}>
        <Icon className="h-3.5 w-3.5" />
        {course.tier}
      </div>

      <h3 className="mt-4 text-xl font-bold text-white">{course.title}</h3>
      <p className="mt-1 text-sm text-mute-dim">{course.focus}</p>

      <div className="mt-5 flex items-baseline gap-1">
        <span className="text-3xl font-bold text-white">{course.priceLabel}</span>
        {course.billing === "monthly" && (
          <span className="text-sm text-mute-dim">recurring</span>
        )}
      </div>

      <ul className="mt-5 space-y-2 text-sm text-mute">
        {course.modules.slice(0, 4).map((module) => (
          <li key={module} className="flex items-start gap-2">
            <span className={`mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full ${styles.icon} bg-current`} />
            {module}
          </li>
        ))}
      </ul>

      <div className="mt-5">
        <SyllabusAccordion course={course} />
      </div>

      <div className="mt-6">
        <CheckoutButton
          courseId={course.id}
          label={`Enroll now · ${course.priceLabel}`}
          className={`flex w-full items-center justify-center gap-2 rounded-md py-3 text-sm font-semibold transition disabled:opacity-60 ${styles.button}`}
        />
      </div>
    </div>
  );
}
