"use client";

import React from "react";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ABOUT_CONTENT } from "@/lib/content";
import { Camera, Sparkles, Building2, Music } from "lucide-react";

const PROCESS_ICONS = [Camera, Sparkles, Building2, Music];

/**
 * Creative process and services / areas of focus.
 */
export function ProcessSection() {
  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      <div className="relative z-10 mx-auto max-w-[1280px] px-6 md:px-8">
        <AnimatedSection>
          <SectionHeading
            label="Focus Areas"
            title="What I Specialize In"
            description="From intimate portraits to large-scale events, each area receives the same cinematic attention to detail."
          />
        </AnimatedSection>

        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {ABOUT_CONTENT.services.map((service, i) => {
            const Icon = PROCESS_ICONS[i];
            return (
              <AnimatedSection key={service.title} delay={i * 0.1}>
                <div className="glass-card rounded-2xl p-7 h-full">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-crimson/10 border border-crimson/15 mb-5">
                    <Icon className="h-4.5 w-4.5 text-crimson" aria-hidden="true" />
                  </div>
                  <h3 className="text-base font-bold text-warm-white tracking-tight mb-2">
                    {service.title}
                  </h3>
                  <p className="text-sm text-warm-white-muted leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </AnimatedSection>
            );
          })}
        </div>
      </div>
    </section>
  );
}
