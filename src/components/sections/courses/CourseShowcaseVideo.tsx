"use client";

import React, { useRef, useEffect } from "react";

/**
 * Cinematic course showcase video — auto-plays, loops, pauses when out of viewport.
 * Designed for the portrait-orientation course promo video.
 */
export function CourseShowcaseVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {
            /* autoplay blocked — that's fine, user will see first frame */
          });
        } else {
          video.pause();
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative group">
      {/* Ambient glow behind the card */}
      <div
        className="absolute -inset-3 rounded-3xl opacity-40 blur-2xl pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 30% 20%, rgba(148,35,34,0.18) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(5,52,95,0.14) 0%, transparent 60%)",
        }}
        aria-hidden="true"
      />

      {/* Video card */}
      <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] shadow-[0_8px_40px_rgba(0,0,0,0.5),0_0_60px_rgba(148,35,34,0.06)] bg-surface">
        <video
          ref={videoRef}
          src="/media/courses/IMG_6617.mp4"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          className="w-full h-auto block"
          style={{ aspectRatio: "9/16" }}
        />
      </div>
    </div>
  );
}
