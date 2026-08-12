"use client";

import React, { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { Project } from "@/lib/projects";

interface LightboxProps {
  project: Project | null;
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

/**
 * Fullscreen image lightbox with touch swipe and keyboard navigation.
 */
export function Lightbox({
  project,
  currentIndex,
  onClose,
  onPrev,
  onNext,
}: LightboxProps) {
  const isOpen = project !== null;

  const images = project
    ? project.images && project.images.length > 0
      ? project.images
      : project.coverImage
        ? [project.coverImage]
        : []
    : [];

  const currentImage = images[currentIndex] || null;
  const total = images.length;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && total > 1) onPrev();
      if (e.key === "ArrowRight" && total > 1) onNext();
    },
    [isOpen, onClose, onPrev, onNext, total]
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  return (
    <AnimatePresence>
      {isOpen && project && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/95 backdrop-blur-xl"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Close button */}
          <button
            onClick={onClose}
            className="fixed top-6 right-6 z-50 w-12 h-12 rounded-full bg-white/[0.08] hover:bg-white/[0.16] border border-white/[0.12] flex items-center justify-center text-warm-white transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer shadow-lg"
            aria-label="Close lightbox"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Main content container */}
          <div className="relative z-10 flex flex-col items-center justify-center w-full h-full max-w-6xl py-12 px-2">
            {/* Image viewport with swipe support */}
            <div className="relative flex-1 flex items-center justify-center w-full overflow-hidden my-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentImage || currentIndex}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  drag={total > 1 ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={(_, info) => {
                    if (info.offset.x < -60) onNext();
                    else if (info.offset.x > 60) onPrev();
                  }}
                  className="flex items-center justify-center max-h-full max-w-full cursor-grab active:cursor-grabbing select-none"
                >
                  {currentImage ? (
                    <img
                      src={currentImage}
                      alt={`${project.title} — image ${currentIndex + 1}`}
                      className="max-h-[75vh] md:max-h-[82vh] w-auto max-w-full object-contain rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/[0.08]"
                      draggable={false}
                    />
                  ) : (
                    <div
                      className="w-80 h-96 rounded-xl flex items-center justify-center shadow-2xl"
                      style={{ background: project.gradient }}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Bottom bar: Title, counter, navigation buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between w-full max-w-3xl mt-4 gap-4 px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-md">
              {/* Title & category */}
              <div className="text-center sm:text-left">
                <h3 className="text-base font-bold text-warm-white tracking-tight">
                  {project.title}
                </h3>
                <span className="text-[11px] uppercase tracking-[0.18em] text-crimson font-medium">
                  {project.category}
                </span>
              </div>

              {/* Navigation controls */}
              <div className="flex items-center gap-4">
                {total > 1 && (
                  <button
                    onClick={onPrev}
                    className="w-10 h-10 rounded-full bg-white/[0.06] hover:bg-white/[0.14] border border-white/[0.08] flex items-center justify-center text-warm-white transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                )}

                {total > 1 && (
                  <span className="text-xs font-semibold text-warm-white-muted tracking-widest min-w-[48px] text-center">
                    {currentIndex + 1} / {total}
                  </span>
                )}

                {total > 1 && (
                  <button
                    onClick={onNext}
                    className="w-10 h-10 rounded-full bg-white/[0.06] hover:bg-white/[0.14] border border-white/[0.08] flex items-center justify-center text-warm-white transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
