"use client";

import React, { useRef, useEffect } from "react";
import type { SampleWorkVideo } from "@/lib/content";

interface VideoGalleryProps {
  videos: SampleWorkVideo[];
}

/**
 * Vertical (9:16) video gallery grid.
 *
 * - Autoplay, looped, muted, inline — no controls or play overlay.
 * - Uses IntersectionObserver to pause off-screen videos for performance.
 * - 3 cols desktop, 2 cols tablet, 1 col mobile.
 */
export function VideoGallery({ videos }: VideoGalleryProps) {
  if (videos.length === 0) return null;

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6"
      role="list"
      aria-label="Sample work videos"
    >
      {videos.map((video, index) => (
        <VideoCard key={index} video={video} index={index} />
      ))}
    </div>
  );
}

function VideoCard({ video, index }: { video: SampleWorkVideo; index: number }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.play().catch(() => {});
        } else {
          el.pause();
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      role="listitem"
      className="group glass-card rounded-2xl overflow-hidden transition-all duration-350 hover:border-white/[0.1] hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
    >
      <div className="relative w-full" style={{ aspectRatio: "9 / 16" }}>
        <video
          ref={videoRef}
          src={video.videoUrl}
          className="absolute inset-0 w-full h-full object-cover rounded-2xl"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          aria-label={`Sample work video ${index + 1}`}
        />
      </div>
    </div>
  );
}
