"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { Lightbox } from "@/components/ui/Lightbox";
import { CATEGORIES, mapWorkCategoryToDisplay } from "@/lib/projects";
import type { Project, ProjectCategory } from "@/lib/projects";
import type { WorkItem } from "@/lib/db-schema";

/**
 * Convert a WorkItem from the API to a Project for the gallery/lightbox.
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
 * Premium editorial photography gallery with filter chips, masonry layout,
 * optimized images, and lightbox.
 */
export function WorkGallery() {
  const [activeCategory, setActiveCategory] = useState<ProjectCategory>("All");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch portfolio data from API
  useEffect(() => {
    let cancelled = false;
    async function fetchWork() {
      try {
        const res = await fetch("/api/work");
        const data = await res.json();
        if (!res.ok || !data.success || !Array.isArray(data.items)) {
          throw new Error("Unable to load portfolio.");
        }
        if (!cancelled) {
          setProjects(data.items.map(workItemToProject));
          setError("");
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Unable to load portfolio."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void fetchWork();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(
    () =>
      activeCategory === "All"
        ? projects
        : projects.filter((p) => p.category === activeCategory),
    [activeCategory, projects]
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

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-crimson" />
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-20 text-charcoal">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-charcoal">
          <p className="text-sm">No work available in this category yet.</p>
        </div>
      )}

      {/* Masonry-style grid with natural aspect ratios */}
      {!loading && !error && filtered.length > 0 && (
        <div className="mt-10">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4"
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
                    delay: i * 0.04,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="break-inside-avoid"
                >
                  <button
                    onClick={() => openLightbox(project)}
                    className="group block w-full text-left rounded-xl overflow-hidden focus-visible:outline-2 focus-visible:outline-crimson focus-visible:outline-offset-2"
                    aria-label={`View ${project.title}`}
                  >
                    <div className="relative">
                      {/* Optimized image with blur placeholder */}
                      {project.coverImage ? (
                        <Image
                          src={project.coverImage}
                          alt={project.title}
                          width={project.cardWidth || 533}
                          height={project.cardHeight || 800}
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          loading={i < 3 ? "eager" : "lazy"}
                          placeholder={project.blurDataURL ? "blur" : "empty"}
                          blurDataURL={project.blurDataURL}
                          className="w-full h-auto object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div
                          className="w-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.02]"
                          style={{
                            background: project.gradient,
                            aspectRatio: "2/3",
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
      )}

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
