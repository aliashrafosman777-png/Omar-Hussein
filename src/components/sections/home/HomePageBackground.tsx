"use client";

import React from "react";
import { AnimatedGradientBlobs } from "@/components/ui/AnimatedGradientBlobs";

/**
 * Full-page animated gradient background for the Home page.
 *
 * Uses the shared AnimatedGradientBlobs component at reduced opacity
 * so the effect remains subtle and doesn't overpower text or images.
 * Positioned fixed to cover the full viewport and scroll naturally
 * behind all content.
 */
export function HomePageBackground() {
  return (
    <div
      className="absolute inset-0 w-full h-full overflow-hidden"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      <AnimatedGradientBlobs
        className="absolute inset-0 w-full h-full"
        opacity={0.35}
        sizeScale={1.5}
        style={{ position: "fixed", inset: 0 }}
      />
    </div>
  );
}
