"use client";

import React from "react";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { ABOUT_CONTENT } from "@/lib/content";

/**
 * Omar's story and photography philosophy.
 */
export function StorySection() {
  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      <div className="relative z-10 mx-auto max-w-[1280px] px-6 md:px-8">
        <div className="max-w-3xl mx-auto">
          <AnimatedSection>
            <span className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-crimson mb-4">
              My Story
            </span>
          </AnimatedSection>

          <div className="space-y-6">
            {ABOUT_CONTENT.story.map((paragraph, i) => (
              <AnimatedSection key={i} delay={i * 0.1}>
                <p className="text-base md:text-lg text-warm-white-muted leading-relaxed">
                  {paragraph}
                </p>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
