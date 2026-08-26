"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

/**
 * About page hero with portrait placeholder area.
 */
export function AboutHero() {
  return (
    <section className="relative pt-32 md:pt-40 pb-16 overflow-hidden">
      {/* Atmospheric lighting */}
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <div
          className="absolute w-[600px] h-[600px] rounded-full opacity-25"
          style={{
            background: "radial-gradient(circle, rgba(5,52,95,0.3) 0%, transparent 70%)",
            top: "0%",
            left: "10%",
          }}
        />
        <div
          className="absolute w-[500px] h-[500px] rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, rgba(148,35,34,0.25) 0%, transparent 70%)",
            top: "20%",
            right: "5%",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-[1280px] px-6 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          {/* Portrait placeholder */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="md:col-span-5 flex justify-center"
          >
            <div
              className="relative w-full max-w-sm rounded-2xl overflow-hidden group border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
              style={{ aspectRatio: "3/4" }}
            >
              {/* Base background gradient (red & blue background) */}
              <div
                className="absolute inset-0 z-0"
                style={{
                  background: "linear-gradient(145deg, #073866 0%, #1a162b 50%, #851e1e 100%)",
                }}
              />

              {/* Soft white spotlight directly behind head & upper body */}
              <div
                className="absolute z-[1] pointer-events-none"
                style={{
                  inset: 0,
                  background: "radial-gradient(ellipse 80% 70% at 50% 36%, #ffffff 0%, rgba(255,255,255,0.85) 45%, rgba(255,255,255,0.2) 75%, transparent 90%)",
                }}
              />

              {/* Red glow rim light — right side */}
              <div
                className="absolute z-[1] rounded-full pointer-events-none"
                style={{
                  width: "280px",
                  height: "350px",
                  background: "radial-gradient(circle, rgba(220,50,50,0.4) 0%, transparent 70%)",
                  right: "-60px",
                  top: "15%",
                  filter: "blur(35px)",
                }}
              />

              {/* Blue glow rim light — left side */}
              <div
                className="absolute z-[1] rounded-full pointer-events-none"
                style={{
                  width: "280px",
                  height: "350px",
                  background: "radial-gradient(circle, rgba(30,120,210,0.45) 0%, transparent 70%)",
                  left: "-60px",
                  top: "10%",
                  filter: "blur(35px)",
                }}
              />

              {/* Rim light highlight halo */}
              <div
                className="absolute z-[1] pointer-events-none rounded-full"
                style={{
                  top: "15%",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "240px",
                  height: "280px",
                  boxShadow: "0 0 50px 10px rgba(255,255,255,0.35)",
                  opacity: 0.6,
                }}
              />

              {/* Omar's portrait image — brightened with filter & multiply blend */}
              <Image
                src="/media/omar-portrait.jpeg"
                alt="Omar Hussein — Photographer"
                fill
                sizes="(max-width: 767px) 100vw, 32rem"
                priority
                className="absolute inset-0 w-full h-full object-cover object-top z-[2] transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                style={{
                  mixBlendMode: "multiply",
                  filter: "brightness(1.32) contrast(1.06)",
                }}
              />

              {/* Minimal subtle bottom edge fade */}
              <div
                className="absolute bottom-0 left-0 right-0 h-8 z-[4] pointer-events-none"
                style={{
                  background: "linear-gradient(to top, rgba(10,10,11,0.4) 0%, transparent 100%)",
                }}
              />
            </div>
          </motion.div>

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="md:col-span-7"
          >
            <span className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-crimson mb-4">
              The Photographer
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[0.95] text-warm-white">
              Omar<br />Hussein
            </h1>
            <div className="mt-6 w-16 h-[2px] bg-gradient-to-r from-crimson to-deep-blue rounded-full" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
