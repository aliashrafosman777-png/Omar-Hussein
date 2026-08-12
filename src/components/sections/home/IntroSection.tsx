"use client";

import React from "react";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { OHMonogram } from "@/components/icons/OHMonogram";
import { GlassButton } from "@/components/ui/GlassButton";
import { ABOUT_CONTENT } from "@/lib/content";

/**
 * Short introduction to Omar with brand logo.
 */
export function IntroSection() {
  return (
    <section className="relative py-section overflow-hidden">
      {/* Atmospheric glow */}
      <div className="glow-crimson absolute -left-32 top-1/2 -translate-y-1/2 opacity-20" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-[1160px] px-6 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Logo side */}
          <AnimatedSection direction="left" className="flex justify-center">
            <div className="relative">
              <OHMonogram variant="colored" size={160} className="opacity-90" />
              {/* Glow behind logo */}
              <div
                className="absolute inset-0 -z-10 blur-3xl opacity-30"
                style={{
                  background: "radial-gradient(circle, rgba(148,35,34,0.3), rgba(5,52,95,0.2), transparent)",
                }}
                aria-hidden="true"
              />
            </div>
          </AnimatedSection>

          {/* Text side */}
          <AnimatedSection direction="right">
            <span className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-crimson mb-4">
              About
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-warm-white leading-tight">
              {ABOUT_CONTENT.headline}
            </h2>
            <p className="mt-6 text-base text-warm-white-muted leading-relaxed">
              {ABOUT_CONTENT.intro}
            </p>
            <div className="mt-8">
              <GlassButton href="/about" variant="secondary" showArrow>
                Read My Story
              </GlassButton>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
