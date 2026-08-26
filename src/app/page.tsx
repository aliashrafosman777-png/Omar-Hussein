import { HeroSection } from "@/components/sections/home/HeroSection";
import { SelectedWorkSection } from "@/components/sections/home/SelectedWorkSection";
import { IntroSection } from "@/components/sections/home/IntroSection";
import { ServicesSection } from "@/components/sections/home/ServicesSection";
import { StatementSection } from "@/components/sections/home/StatementSection";
import { ContactCTASection } from "@/components/sections/home/ContactCTASection";
import { HomePageBackground } from "@/components/sections/home/HomePageBackground";

export default function HomePage() {
  return (
    <div className="relative overflow-x-clip">
      {/* Animated gradient blobs — single shared layer behind all sections */}
      <HomePageBackground />

      {/* Page content — above the background */}
      <div className="relative z-10">
        <HeroSection />
        <SelectedWorkSection />
        <IntroSection />
        <ServicesSection />
        <StatementSection />
        <ContactCTASection />
      </div>
    </div>
  );
}
