"use client";

import React from "react";
import { AnimatedGradientBlobs } from "@/components/ui/AnimatedGradientBlobs";

/**
 * Animated gradient blobs for the Courses hero background.
 *
 * Thin wrapper around the shared AnimatedGradientBlobs component.
 * Preserves the original visual appearance (full opacity, default size,
 * `absolute inset-0`).
 */
export function CoursesHeroBlobs() {
  return (
    <AnimatedGradientBlobs className="absolute inset-0" />
  );
}
