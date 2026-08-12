"use client";

import React, { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbox } from "@/components/ui/Lightbox";
import { PROJECTS, CATEGORIES } from "@/lib/projects";
import type { Project, ProjectCategory } from "@/lib/projects";

/**
 * Premium editorial photography gallery with filter chips and lightbox.
 */
export function WorkGallery() {
  const [activeCategory, setActiveCategory] = useState<ProjectCategory>("All");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

  const filtered = useMemo(
    () =>
      activeCategory === "All"
        ? PROJECTS
        : PROJECTS.filter((p) => p.category === activeCategory),
    [activeCategory]
  );

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
    <>
      {/* Filter chips */}
      <div className="flex flex-wrap gap-2 mt-10">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setActiveCategory(cat);
              setSelectedProject(null);
            }}
            className={`
              liquid-glass-btn-secondary !text-[11px] !px-5 !py-2
              ${activeCategory === cat
                ? "!bg-crimson/15 !border-crimson/30 !border-t-crimson/50 text-warm-white !shadow-[inset_0_1px_1px_rgba(148,35,34,0.2),inset_0_-1px_2px_rgba(0,0,0,0.3),0_4px_16px_rgba(148,35,34,0.2)]"
                : ""
              }
            `}
            aria-pressed={activeCategory === cat}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Masonry grid */}
      <div className="mt-10">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="masonry-grid"
          >
            {filtered.map((project, i) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{
                  duration: 0.4,
                  delay: i * 0.05,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <button
                  onClick={() => openLightbox(project)}
                  className="group block w-full text-left rounded-xl overflow-hidden focus-visible:outline-2 focus-visible:outline-crimson focus-visible:outline-offset-2"
                  aria-label={`View ${project.title}`}
                >
                  <div className="relative">
                    {/* Image or gradient fallback */}
                    {project.coverImage ? (
                      <img
                        src={project.coverImage}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                        style={{
                          aspectRatio:
                            project.aspectRatio === "portrait"
                              ? "3/4"
                              : project.aspectRatio === "landscape"
                                ? "16/10"
                                : "1/1",
                        }}
                      />
                    ) : (
                      <div
                        className="w-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.02]"
                        style={{
                          background: project.gradient,
                          aspectRatio:
                            project.aspectRatio === "portrait"
                              ? "3/4"
                              : project.aspectRatio === "landscape"
                                ? "16/10"
                                : "1/1",
                        }}
                      />
                    )}

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-5">
                      <div>
                        <h3 className="text-base font-bold text-warm-white tracking-tight">
                          {project.title}
                        </h3>
                        <span className="text-[10px] uppercase tracking-[0.15em] text-crimson mt-0.5 block">
                          {project.category}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Lightbox */}
      <Lightbox
        project={selectedProject}
        currentIndex={currentImageIndex}
        onClose={closeLightbox}
        onPrev={prevLightbox}
        onNext={nextLightbox}
      />
    </>
  );
}
