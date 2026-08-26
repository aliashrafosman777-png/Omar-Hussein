"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GlassButton } from "@/components/ui/GlassButton";
import { Lightbox } from "@/components/ui/Lightbox";
import { mapWorkCategoryToDisplay } from "@/lib/projects";
import type { Project } from "@/lib/projects";
import type { WorkItem } from "@/lib/db-schema";
import Image from "next/image";

/**
 * Convert a WorkItem to a Project for the gallery/lightbox.
 */
function workItemToProject(item: WorkItem): Project {
  return {
    id: String(item.id),
    title: item.title,
    category: mapWorkCategoryToDisplay(item.category),
    description: item.altText || item.title,
    coverImage: item.imageUrl,
    lightboxImage: item.fullImageUrl,
    images: [item.fullImageUrl],
    cardWidth: item.cardWidth || 533,
    cardHeight: item.cardHeight || 800,
    blurDataURL: item.blurDataURL,
  };
}

/**
 * Selected work preview with asymmetric grid layout and lightbox gallery.
 * Fetches featured images from the public API.
 */
export function SelectedWorkSection() {
  const [featured, setFeatured] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

  // Fetch first 4 published work items for featured display
  useEffect(() => {
    let cancelled = false;
    async function fetchFeatured() {
      try {
        const res = await fetch("/api/work");
        const data = await res.json();
        if (data.success && Array.isArray(data.items)) {
          const projects = data.items.slice(0, 4).map(workItemToProject);
          if (!cancelled) setFeatured(projects);
        }
      } catch {
        // Silently fail — homepage still works without featured section
      }
    }
    void fetchFeatured();
    return () => { cancelled = true; };
  }, []);

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

  // Don't render section if no featured items loaded yet
  if (featured.length === 0) return null;

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
          {featured.map((project, i) => {
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
                    <Image
                      src={project.coverImage}
                      alt={project.title}
                      width={project.cardWidth || 533}
                      height={project.cardHeight || 800}
                      sizes="(max-width: 767px) 100vw, 58vw"
                      loading={i === 0 ? "eager" : "lazy"}
                      placeholder={project.blurDataURL ? "blur" : "empty"}
                      blurDataURL={project.blurDataURL}
                      className="w-full h-auto object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div
                      className="w-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                      style={{
                        background: project.gradient,
                        aspectRatio: "2/3",
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
