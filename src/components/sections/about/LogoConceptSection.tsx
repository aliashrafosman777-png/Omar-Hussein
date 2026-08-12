"use client";

import React from "react";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { OHMonogram } from "@/components/icons/OHMonogram";
import { ABOUT_CONTENT } from "@/lib/content";

/**
 * Logo concept explanation section.
 */
export function LogoConceptSection() {
  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      <div className="glow-blue absolute -left-32 top-0 opacity-15" aria-hidden="true" />
      <div className="glow-crimson absolute -right-32 bottom-0 opacity-15" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-[1280px] px-6 md:px-8">
        <div className="glass-card rounded-3xl p-10 md:p-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Logo display */}
            <AnimatedSection direction="left" className="flex justify-center">
              <div className="relative">
                <OHMonogram variant="colored" size={180} />
                <div
                  className="absolute inset-0 -z-10 blur-3xl opacity-25"
                  style={{
                    background: "radial-gradient(circle, rgba(148,35,34,0.3), rgba(5,52,95,0.2), transparent)",
                  }}
                  aria-hidden="true"
                />
              </div>
            </AnimatedSection>

            {/* Explanation */}
            <AnimatedSection direction="right">
              <span className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-crimson mb-4">
                {ABOUT_CONTENT.logoExplanation.headline}
              </span>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-warm-white leading-tight mb-6">
                The OH Monogram
              </h2>
              <p className="text-base text-warm-white-muted leading-relaxed">
                {ABOUT_CONTENT.logoExplanation.description}
              </p>
            </AnimatedSection>
          </div>
        </div>
      </div>
    </section>
  );
}
