"use client";

import React from "react";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { GlassButton } from "@/components/ui/GlassButton";

/**
 * Final contact CTA section before the footer.
 */
export function ContactCTASection() {
  return (
    <section className="relative py-section overflow-hidden">
      {/* Atmospheric glows */}
      <div className="glow-crimson absolute -right-32 top-0 opacity-20" aria-hidden="true" />
      <div className="glow-blue absolute -left-48 bottom-0 opacity-15" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-[1160px] px-6 md:px-8">
        <div className="glass-card rounded-3xl p-8 md:p-12 text-center">
          <AnimatedSection>
            <span className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-crimson mb-3">
              Let&apos;s Work Together
            </span>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-warm-white leading-tight">
              Ready to Create Something<br className="hidden sm:block" /> Extraordinary?
            </h2>
            <p className="mt-6 text-base text-warm-white-muted max-w-lg mx-auto leading-relaxed">
              Every great image starts with a conversation. Let&apos;s discuss your vision and bring it to life through bold, cinematic photography.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <GlassButton href="/contact" variant="primary" showArrow>
                Book a Shoot
              </GlassButton>
              <GlassButton href="/work" variant="secondary">
                Explore Work
              </GlassButton>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
