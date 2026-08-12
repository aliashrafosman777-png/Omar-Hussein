import { HeroSection } from "@/components/sections/home/HeroSection";
import { SelectedWorkSection } from "@/components/sections/home/SelectedWorkSection";
import { IntroSection } from "@/components/sections/home/IntroSection";
import { ServicesSection } from "@/components/sections/home/ServicesSection";
import { StatementSection } from "@/components/sections/home/StatementSection";
import { ContactCTASection } from "@/components/sections/home/ContactCTASection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <SelectedWorkSection />
      <IntroSection />
      <ServicesSection />
      <StatementSection />
      <ContactCTASection />
    </>
  );
}
