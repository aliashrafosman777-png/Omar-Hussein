"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Clock, BarChart3 } from "lucide-react";
import { COURSES_CONTENT } from "@/lib/content";

/**
 * Course accordion — expandable list of photography courses.
 * Matches the walidooo.com reference layout: each course is a row with
 * title on left, chevron on right, and expandable content below.
 */
export function CourseAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  function toggle(index: number) {
    setOpenIndex((prev) => (prev === index ? null : index));
  }

  return (
    <div className="w-full" role="list" aria-label="Photography courses">
      {COURSES_CONTENT.courses.map((course, index) => {
        const isOpen = openIndex === index;

        return (
          <div
            key={course.title}
            role="listitem"
            className="border-b border-white/[0.06] last:border-b-0"
          >
            {/* Accordion header */}
            <button
              id={`course-header-${index}`}
              onClick={() => toggle(index)}
              aria-expanded={isOpen}
              aria-controls={`course-panel-${index}`}
              className="w-full flex items-center justify-between py-5 md:py-6 text-left group transition-colors duration-300 hover:bg-white/[0.02] px-2 rounded-lg cursor-pointer"
            >
              <h3 className="text-base md:text-lg font-bold text-warm-white tracking-tight group-hover:text-crimson transition-colors duration-300">
                {course.title}
              </h3>
              <motion.span
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="flex-shrink-0 ml-4 text-warm-white-muted group-hover:text-crimson transition-colors duration-300"
              >
                <ChevronDown className="h-5 w-5" aria-hidden="true" />
              </motion.span>
            </button>

            {/* Accordion content */}
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`course-panel-${index}`}
                  role="region"
                  aria-labelledby={`course-header-${index}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{
                    height: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
                    opacity: { duration: 0.3, delay: 0.05 },
                  }}
                  className="overflow-hidden"
                >
                  <div className="pb-6 px-2">
                    {/* Description */}
                    <p className="text-sm text-warm-white-muted leading-relaxed mb-5">
                      {course.description}
                    </p>

                    {/* Metadata pills */}
                    <div className="flex flex-wrap gap-3 mb-5">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-warm-white bg-white/[0.04] border border-white/[0.06] rounded-full px-3.5 py-1.5">
                        <Clock className="h-3.5 w-3.5 text-crimson" aria-hidden="true" />
                        {course.duration}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-warm-white bg-white/[0.04] border border-white/[0.06] rounded-full px-3.5 py-1.5">
                        <BarChart3 className="h-3.5 w-3.5 text-deep-blue" aria-hidden="true" />
                        {course.level}
                      </span>
                    </div>

                    {/* Highlights */}
                    <div className="space-y-2.5">
                      <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-charcoal">
                        What you&apos;ll learn
                      </span>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {course.highlights.map((highlight) => (
                          <li
                            key={highlight}
                            className="flex items-start gap-2 text-sm text-warm-white-muted"
                          >
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-crimson flex-shrink-0" />
                            {highlight}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
