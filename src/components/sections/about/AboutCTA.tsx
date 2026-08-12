"use client";

import React from "react";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { GlassButton } from "@/components/ui/GlassButton";

/**
 * CTA at the bottom of the About page linking to Contact.
 */
export function AboutCTA() {
  return (
    <section className="relative py-section overflow-hidden">
      <div className="glow-burgundy absolute left-1/2 -translate-x-1/2 top-0 opacity-20" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-[800px] px-6 md:px-8 text-center">
        <AnimatedSection>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-warm-white leading-tight">
            Let&apos;s Bring Your Vision to Life
          </h2>
          <p className="mt-5 text-base text-warm-white-muted leading-relaxed max-w-md mx-auto">
            I am always excited to collaborate on projects that push creative boundaries. Get in touch and let&apos;s create something extraordinary.
          </p>
          <div className="mt-8">
            <GlassButton href="/contact" variant="primary" showArrow>
              Get in Touch
            </GlassButton>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
