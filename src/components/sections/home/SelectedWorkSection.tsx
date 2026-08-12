"use client";

import React, { useState, useCallback } from "react";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GlassButton } from "@/components/ui/GlassButton";
import { Lightbox } from "@/components/ui/Lightbox";
import { PROJECTS } from "@/lib/projects";
import type { Project } from "@/lib/projects";

// Featured projects in requested order: 1Portraits, 2Portraits, 3Portraits, + 4th project
const FEATURED_IDS = ["project-01", "project-07", "project-08", "project-04"];
const FEATURED = FEATURED_IDS.map((id) => PROJECTS.find((p) => p.id === id)).filter(
  (p): p is Project => p !== undefined
);

/**
 * Selected work preview with asymmetric grid layout and lightbox gallery.
 */
export function SelectedWorkSection() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

  const openLightbox = useCallback((project: Project) => {
    setSelectedProject(project);
    setCurrentImageIndex(0);
  }, []);

  const closeLightbox = useCallback(() => {
    setSelectedProject(null);
    setCurrentImageIndex(0);
  }, []);

  const prevLightbox = useCallback(() => {
    if (!selectedProject) return;
    const images =
      selectedProject.images && selectedProject.images.length > 0
        ? selectedProject.images
        : selectedProject.coverImage
          ? [selectedProject.coverImage]
          : [];
    if (images.length <= 1) return;
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [selectedProject]);

  const nextLightbox = useCallback(() => {
    if (!selectedProject) return;
    const images =
      selectedProject.images && selectedProject.images.length > 0
        ? selectedProject.images
        : selectedProject.coverImage
          ? [selectedProject.coverImage]
          : [];
    if (images.length <= 1) return;
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  }, [selectedProject]);

  return (
    <section className="relative pt-24 md:pt-28 pb-16 md:pb-20 overflow-hidden scroll-mt-24">
      {/* Atmospheric glow */}
      <div className="glow-blue absolute top-0 right-0 opacity-15" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-[1160px] px-6 md:px-8">
        <AnimatedSection>
          <SectionHeading
            label="Selected Work"
            title="Recent Projects"
            description="A curated selection of recent photography — each frame a visual narrative."
          />
        </AnimatedSection>

        {/* Asymmetric grid */}
        <div className="mt-10 md:mt-12 grid grid-cols-1 md:grid-cols-12 gap-5">
          {FEATURED.map((project, i) => {
            // Asymmetric column spans
            const spanClass =
              i === 0
                ? "md:col-span-7"
                : i === 1
                  ? "md:col-span-5"
                  : i === 2
                    ? "md:col-span-5"
                    : "md:col-span-7";

            return (
              <AnimatedSection
                key={project.id}
                delay={i * 0.1}
                className={spanClass}
              >
                <button
                  onClick={() => openLightbox(project)}
                  className="group block w-full text-left relative rounded-2xl overflow-hidden cursor-pointer focus-visible:outline-2 focus-visible:outline-crimson focus-visible:outline-offset-2"
                  aria-label={`View ${project.title}`}
                >
                  {/* Image placeholder or cover image */}
                  {project.coverImage ? (
                    <img
                      src={project.coverImage}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                      style={{
                        aspectRatio: i === 0 || i === 3 ? "16/9.5" : "4/4.8",
                      }}
                    />
                  ) : (
                    <div
                      className="w-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                      style={{
                        background: project.gradient,
                        aspectRatio: i === 0 || i === 3 ? "16/9.5" : "4/4.8",
                      }}
                    />
                  )}

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                    <div>
                      <h3 className="text-lg font-bold text-warm-white tracking-tight">
                        {project.title}
                      </h3>
                      <span className="text-[11px] uppercase tracking-[0.15em] text-crimson">
                        {project.category}
                      </span>
                    </div>
                  </div>
                </button>
              </AnimatedSection>
            );
          })}
        </div>

        {/* View all CTA */}
        <AnimatedSection delay={0.4} className="mt-12 flex justify-center">
          <GlassButton href="/work" variant="secondary" showArrow>
            View All Work
          </GlassButton>
        </AnimatedSection>
      </div>

      {/* Lightbox */}
      <Lightbox
        project={selectedProject}
        currentIndex={currentImageIndex}
        onClose={closeLightbox}
        onPrev={prevLightbox}
        onNext={nextLightbox}
      />
    </section>
  );
}
