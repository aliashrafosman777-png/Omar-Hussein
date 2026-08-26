import type { Metadata } from "next";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { CourseAccordion } from "@/components/sections/courses/CourseAccordion";
import { CourseBookingForm } from "@/components/sections/courses/CourseBookingForm";
import { CourseShowcaseVideo } from "@/components/sections/courses/CourseShowcaseVideo";
import { CoursesHeroBlobs } from "@/components/sections/courses/CoursesHeroBlobs";
import { VideoGallery } from "@/components/sections/courses/VideoGallery";
import { COURSES_CONTENT, SAMPLE_WORK_CONTENT } from "@/lib/content";

export const metadata: Metadata = {
  title: "Courses",
  description:
    "Explore photography courses by Omar Hussein — from portrait masterclasses to cinematic storytelling, lighting labs, and business branding for photographers.",
  openGraph: {
    title: "Courses | Omar Hussein Photography",
    description:
      "Hands-on photography courses designed to elevate your skills. Master portraits, lighting, editing, and more.",
  },
};

export default function CoursesPage() {
  return (
    <>
      {/* ── Hero Section ── */}
      <section className="relative pt-32 md:pt-44 pb-16 md:pb-24 overflow-hidden">
        {/* Animated gradient blobs */}
        <CoursesHeroBlobs />

        <div className="relative z-10 mx-auto max-w-[1280px] px-6 md:px-8 text-center">
          <AnimatedSection direction="none">
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter text-warm-white uppercase leading-none">
              {COURSES_CONTENT.headline}
            </h1>
          </AnimatedSection>
        </div>
      </section>

      {/* ── Courses + Form + Video Section ── */}
      <section className="relative pb-section overflow-hidden">
        <div className="relative z-10 mx-auto max-w-[1280px] px-6 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            {/* Course Accordion — order 1 on mobile, left column on desktop */}
            <AnimatedSection className="lg:col-span-7 lg:row-start-1 order-1" delay={0.1}>
              <CourseAccordion />
            </AnimatedSection>

            {/* Showcase Video — order 2 on mobile, right column on desktop (sticky) */}
            <AnimatedSection className="lg:col-span-5 lg:row-span-2 lg:row-start-1 lg:col-start-8 order-2" delay={0.2}>
              <div className="lg:sticky lg:top-28">
                <CourseShowcaseVideo />
              </div>
            </AnimatedSection>

            {/* Booking Form — order 3 on mobile, left column below accordion on desktop */}
            <AnimatedSection className="lg:col-span-7 lg:row-start-2 order-3" delay={0.25}>
              <CourseBookingForm />
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ── Sample of Work Section ── */}
      <section className="relative pb-section overflow-hidden">
        {/* Subtle top border */}
        <div className="mx-auto max-w-[1280px] px-6 md:px-8">
          <div className="border-t border-white/[0.04]" />
        </div>

        <div className="relative z-10 mx-auto max-w-[1280px] px-6 md:px-8 pt-16 md:pt-24">
          {/* Section heading */}
          <AnimatedSection>
            <div className="flex items-baseline justify-between mb-12 md:mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tighter text-warm-white uppercase leading-none">
                {SAMPLE_WORK_CONTENT.headline}
              </h2>
              <span className="hidden sm:block text-sm font-medium text-charcoal tracking-wider">
                -01
              </span>
            </div>
          </AnimatedSection>

          {/* Video grid */}
          <AnimatedSection delay={0.15}>
            <VideoGallery videos={SAMPLE_WORK_CONTENT.videos} />
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
