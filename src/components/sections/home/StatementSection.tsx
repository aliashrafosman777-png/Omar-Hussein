"use client";

import React from "react";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { ABOUT_CONTENT } from "@/lib/content";

/**
 * Full-width cinematic statement section with brand typography.
 */
export function StatementSection() {
  return (
    <section className="relative py-section overflow-hidden">
      {/* Atmospheric background */}
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <div
          className="absolute w-[800px] h-[800px] rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, rgba(148,35,34,0.2) 0%, transparent 60%)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
        {/* Horizontal light trail */}
        <div
          className="absolute w-full h-[1px] top-1/2 opacity-[0.05]"
          style={{
            background: "linear-gradient(90deg, transparent, #05345F, #942322, transparent)",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-[820px] px-6 md:px-8 text-center">
        <AnimatedSection>
          <blockquote>
            <p className="text-xl sm:text-2.5xl md:text-3.5xl lg:text-[42px] font-bold tracking-tight leading-[1.18] text-warm-white">
              <span className="text-gradient-brand">
                {ABOUT_CONTENT.philosophy}
              </span>
            </p>
          </blockquote>
          <div className="mt-8 flex items-center justify-center gap-4">
            <span className="block w-12 h-[1px] bg-crimson/50" aria-hidden="true" />
            <span className="text-[11px] uppercase tracking-[0.2em] text-crimson font-semibold">
              Omar Hussein
            </span>
            <span className="block w-12 h-[1px] bg-crimson/50" aria-hidden="true" />
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
