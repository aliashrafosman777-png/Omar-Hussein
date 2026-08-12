"use client";

import React, { useEffect, useRef } from "react";

/**
 * Animated gradient blobs for the Courses hero background.
 *
 * Renders 3 concentrated, blurred radial-gradient circles that drift
 * between random positions using the Web Animations API (WAAPI).
 * - Crimson blob (upper-left bias)
 * - Deep-blue blob (upper-right bias)
 * - Burgundy blob (center-bottom bias)
 *
 * Respects `prefers-reduced-motion` — stops all movement.
 * Blobs stay within the parent via `overflow-hidden` on the parent.
 */

interface BlobConfig {
  /** CSS radial-gradient background */
  bg: string;
  /** Pixel size of the blob (width = height) */
  size: number;
  /** Range for translateX (percentage of container width) */
  xRange: [number, number];
  /** Range for translateY (percentage of container height) */
  yRange: [number, number];
  /** Animation duration in ms */
  duration: number;
  /** Initial opacity */
  opacity: number;
}

const BLOBS: BlobConfig[] = [
  {
    // Crimson — strong saturated red core
    bg: "radial-gradient(circle, rgba(180,30,30,0.85) 0%, rgba(148,35,34,0.35) 40%, transparent 68%)",
    size: 420,
    xRange: [-20, 60],
    yRange: [-25, 60],
    duration: 6000,
    opacity: 0.9,
  },
  {
    // Deep blue — strong saturated blue core
    bg: "radial-gradient(circle, rgba(10,60,140,0.8) 0%, rgba(5,52,95,0.3) 40%, transparent 68%)",
    size: 450,
    xRange: [10, 95],
    yRange: [-30, 55],
    duration: 7000,
    opacity: 0.85,
  },
  {
    // Burgundy — warm accent
    bg: "radial-gradient(circle, rgba(130,50,55,0.6) 0%, rgba(100,63,69,0.2) 40%, transparent 68%)",
    size: 380,
    xRange: [0, 75],
    yRange: [10, 85],
    duration: 5500,
    opacity: 0.75,
  },
];

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function generateKeyframes(
  xRange: [number, number],
  yRange: [number, number],
  steps: number
): Keyframe[] {
  const keyframes: Keyframe[] = [];
  for (let i = 0; i < steps; i++) {
    keyframes.push({
      transform: `translate(${randomBetween(xRange[0], xRange[1])}%, ${randomBetween(yRange[0], yRange[1])}%)`,
    });
  }
  // Close the loop — return to the first keyframe position
  keyframes.push({ ...keyframes[0] });
  return keyframes;
}

export function CoursesHeroBlobs() {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationsRef = useRef<Animation[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Respect reduced motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const blobEls = container.querySelectorAll<HTMLDivElement>("[data-blob]");

    blobEls.forEach((el, i) => {
      const config = BLOBS[i];
      if (!config) return;

      if (prefersReducedMotion) {
        // Static position — no movement
        el.style.transform = `translate(${(config.xRange[0] + config.xRange[1]) / 2}%, ${(config.yRange[0] + config.yRange[1]) / 2}%)`;
        return;
      }

      const keyframes = generateKeyframes(config.xRange, config.yRange, 5);
      const animation = el.animate(keyframes, {
        duration: config.duration,
        iterations: Infinity,
        easing: "cubic-bezier(0.45, 0, 0.55, 1)",
        fill: "forwards",
      });

      animationsRef.current.push(animation);
    });

    return () => {
      animationsRef.current.forEach((a) => a.cancel());
      animationsRef.current = [];
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none"
      aria-hidden="true"
      style={{ filter: "blur(60px)", WebkitFilter: "blur(60px)" }}
    >
      {BLOBS.map((blob, i) => (
        <div
          key={i}
          data-blob
          style={{
            position: "absolute",
            width: blob.size,
            height: blob.size,
            background: blob.bg,
            borderRadius: "50%",
            opacity: blob.opacity,
            willChange: "transform",
            // Initial position: center of range
            transform: `translate(${(blob.xRange[0] + blob.xRange[1]) / 2}%, ${(blob.yRange[0] + blob.yRange[1]) / 2}%)`,
          }}
        />
      ))}
    </div>
  );
}

