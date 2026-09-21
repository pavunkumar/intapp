"use client";

import type { Course } from "@/lib/courses";
import { CheckCircle2, ChevronDown } from "lucide-react";
import { useState } from "react";

export function SyllabusAccordion({ course }: { course: Course }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-md border border-ink-line bg-ink-raised">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <span className="text-sm font-semibold text-white">
          View full syllabus ({course.modules.length} modules)
        </span>
        <ChevronDown
          className={`h-4 w-4 text-mute-dim transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <ul className="space-y-2.5 border-t border-ink-line px-5 py-4">
          {course.modules.map((module) => (
            <li key={module} className="flex items-start gap-2.5 text-sm text-mute">
              <CheckCircle2 className={`mt-0.5 h-4 w-4 flex-shrink-0 text-brand-soft`} />
              <span>{module}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
