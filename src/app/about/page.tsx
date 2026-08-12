import type { Metadata } from "next";
import { AboutHero } from "@/components/sections/about/AboutHero";
import { StorySection } from "@/components/sections/about/StorySection";
import { LogoConceptSection } from "@/components/sections/about/LogoConceptSection";
import { ProcessSection } from "@/components/sections/about/ProcessSection";
import { AboutCTA } from "@/components/sections/about/AboutCTA";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about Omar Hussein — a photographer driven by the desire to inspire, educate, and capture the art in everything. Bold, artistic, cinematic.",
  openGraph: {
    title: "About | Omar Hussein Photography",
    description:
      "The story behind Omar Hussein Photography — bold, artistic, cinematic visual storytelling.",
  },
};

export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <StorySection />
      <LogoConceptSection />
      <ProcessSection />
      <AboutCTA />
    </>
  );
}
