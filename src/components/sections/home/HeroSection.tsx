"use client";

import React from "react";
import { motion } from "framer-motion";
import { GlassButton } from "@/components/ui/GlassButton";
import { OHMonogram } from "@/components/icons/OHMonogram";
import { HERO_CONTENT } from "@/lib/content";

/**
 * Full-viewport cinematic hero section with atmospheric lighting.
 */
export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Atmospheric background lighting */}
      <div className="absolute inset-0 z-0" aria-hidden="true">
        {/* Deep blue glow — left */}
        <div
          className="absolute w-[700px] h-[700px] rounded-full opacity-40"
          style={{
            background: "radial-gradient(circle, rgba(5,52,95,0.35) 0%, transparent 70%)",
            top: "10%",
            left: "-10%",
          }}
        />
        {/* Crimson glow — right */}
        <div
          className="absolute w-[600px] h-[600px] rounded-full opacity-35"
          style={{
            background: "radial-gradient(circle, rgba(148,35,34,0.3) 0%, transparent 70%)",
            top: "20%",
            right: "-5%",
          }}
        />
        {/* Burgundy glow — bottom center */}
        <div
          className="absolute w-[500px] h-[500px] rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, rgba(100,63,69,0.25) 0%, transparent 70%)",
            bottom: "0%",
            left: "30%",
          }}
        />
        {/* Cinematic light trail */}
        <div
          className="absolute w-full h-[1px] opacity-[0.06]"
          style={{
            background: "linear-gradient(90deg, transparent, #942322, #05345F, transparent)",
            top: "45%",
          }}
        />
      </div>

      {/* Hero image placeholder area */}
      <div
        className="absolute inset-0 z-[1] opacity-[0.03]"
        style={{
          background: "radial-gradient(ellipse at 60% 40%, rgba(148,35,34,0.15) 0%, transparent 60%)",
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-[1160px] px-6 md:px-8 w-full pt-16 md:pt-20">
        <div className="max-w-2xl">
          {/* Logo mark */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="mb-6"
          >
            <OHMonogram variant="colored" size={46} />
          </motion.div>

          {/* Name */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-[72px] font-extrabold tracking-tight leading-[1.05]"
          >
            <span className="block text-warm-white pb-1">{HERO_CONTENT.name}</span>
            <span className="block text-gradient-brand mt-1 pb-3 leading-normal">{HERO_CONTENT.title}</span>
          </motion.h1>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 md:mt-8 text-base md:text-lg text-warm-white-muted max-w-lg leading-relaxed"
            style={{ fontStyle: "italic" }}
          >
            {HERO_CONTENT.tagline}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 flex flex-wrap gap-3.5"
          >
            <GlassButton
              href={HERO_CONTENT.primaryCTA.href}
              variant="primary"
              showArrow
            >
              {HERO_CONTENT.primaryCTA.label}
            </GlassButton>
            <GlassButton
              href={HERO_CONTENT.secondaryCTA.href}
              variant="secondary"
            >
              {HERO_CONTENT.secondaryCTA.label}
            </GlassButton>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <div className="w-[1px] h-12 bg-gradient-to-b from-warm-white/30 to-transparent" />
      </motion.div>
    </section>
  );
}
