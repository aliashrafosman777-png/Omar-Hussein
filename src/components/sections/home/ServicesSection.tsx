"use client";

import React from "react";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ABOUT_CONTENT } from "@/lib/content";
import { Camera, Sparkles, Building2, Music } from "lucide-react";

const SERVICE_ICONS = [Camera, Sparkles, Building2, Music];

/**
 * Photography categories / services section with editorial layout.
 */
export function ServicesSection() {
  return (
    <section className="relative py-section overflow-hidden">
      <div className="glow-blue absolute -right-48 bottom-0 opacity-15" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-[1160px] px-6 md:px-8">
        <AnimatedSection>
          <SectionHeading
            label="Services"
            title="What I Capture"
            align="center"
          />
        </AnimatedSection>

        <div className="mt-10 md:mt-12 grid grid-cols-1 sm:grid-cols-2 gap-px bg-white/[0.03] rounded-2xl overflow-hidden">
          {ABOUT_CONTENT.services.map((service, i) => {
            const Icon = SERVICE_ICONS[i];
            return (
              <AnimatedSection
                key={service.title}
                delay={i * 0.1}
                className="group relative bg-surface p-8 md:p-10 transition-colors hover:bg-surface-container"
              >
                {/* Corner accent */}
                <div
                  className="absolute top-0 left-0 w-16 h-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: "radial-gradient(circle at top left, rgba(148,35,34,0.1), transparent 70%)",
                  }}
                  aria-hidden="true"
                />

                <div className="relative z-10">
                  <div className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-white/[0.03] border border-white/[0.05] mb-5">
                    <Icon className="h-5 w-5 text-crimson" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-bold text-warm-white tracking-tight mb-3">
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
