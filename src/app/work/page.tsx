import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { WorkGallery } from "@/components/sections/work/WorkGallery";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Explore the photography portfolio of Omar Hussein — portraits, editorial, commercial, and event photography. Bold, cinematic visual storytelling.",
  openGraph: {
    title: "Work | Omar Hussein Photography",
    description:
      "Explore the photography portfolio of Omar Hussein — bold, cinematic visual storytelling.",
  },
};

export default function WorkPage() {
  return (
    <section className="relative pt-32 md:pt-40 pb-section overflow-hidden">
      {/* Atmospheric glows */}
      <div className="glow-crimson absolute top-20 -right-32 opacity-15" aria-hidden="true" />
      <div className="glow-blue absolute top-1/2 -left-48 opacity-10" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-[1280px] px-6 md:px-8">
        <AnimatedSection>
          <SectionHeading
            label="Portfolio"
            title="My Work"
            level="h1"
            description="Each project is a visual story — bold, intentional, and crafted with cinematic precision. Click any image to explore."
          />
        </AnimatedSection>

        <WorkGallery />
      </div>
    </section>
  );
}
