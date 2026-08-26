"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { OHMonogram } from "@/components/icons/OHMonogram";
import { NAV_LINKS } from "@/lib/content";

/**
 * Navbar — Spazio-style floating centered glass pill, with individual
 * glass-pill backgrounds on each nav link inside it.
 *
 * Desktop: Centered floating pill (left-1/2), logo left, links right with own pills.
 * Mobile: Slide-in drawer from the right with backdrop overlay.
 */
export function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll lock when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMobileOpen]);

  // Close mobile menu on Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileOpen) setIsMobileOpen(false);
    },
    [isMobileOpen]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Close mobile menu on route change
  const prevPathname = useRef(pathname);
  useEffect(() => {
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname;
      const id = requestAnimationFrame(() => setIsMobileOpen(false));
      return () => cancelAnimationFrame(id);
    }
  }, [pathname]);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  // Only Work / About / Contact in the pill row (logo handles Home)
  const navLinksWithoutHome = NAV_LINKS.filter((l) => l.href !== "/");

  return (
    <>
      {/* ── Main floating pill ── */}
      <header
        className={`
          fixed left-1/2 -translate-x-1/2 z-[1000]
          transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]

          ${isScrolled
            ? "top-2 w-[94%] max-w-[1160px] py-2 px-5 md:px-6 rounded-[40px] shadow-[0_15px_40px_rgba(0,0,0,0.25)]"
            : "top-4 w-[92%] max-w-[1160px] py-2.5 px-5 md:px-6 rounded-[40px] shadow-[0_10px_30px_rgba(0,0,0,0.15)]"
          }

          bg-white/[0.04] backdrop-blur-[25px]
          border border-white/[0.06]

          max-lg:top-0 max-lg:w-full max-lg:rounded-none max-lg:border-none
          max-lg:py-3 max-lg:px-4 max-lg:shadow-[0_4px_20px_rgba(0,0,0,0.15)]
          max-lg:bg-surface/90 max-lg:backdrop-blur-xl
        `}
        role="banner"
      >
        <div className="flex justify-between items-center w-full">
          {/* Logo — its own glass pill */}
          <Link
            href="/"
            className="nav-glass-pill flex items-center gap-2.5 px-4 py-2 hover:opacity-90"
            aria-label="Omar Hussein Photography — Home"
          >
            <OHMonogram variant="colored" size={26} />
            <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-warm-white hidden sm:block">
              Omar Hussein
            </span>
          </Link>

          {/* Desktop Nav — each link in its own glass pill */}
          <nav className="hidden lg:flex gap-2 items-center" aria-label="Main navigation">
            {navLinksWithoutHome.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  nav-glass-pill px-5 py-2
                  text-[11px] font-semibold uppercase tracking-[0.12em]
                  transition-all duration-300
                  ${isActive(link.href)
                    ? "nav-glass-pill-active text-warm-white"
                    : "text-warm-white-muted hover:text-warm-white"
                  }
                `}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobile Toggle — animated hamburger lines (Spazio-style) */}
          <button
            className="lg:hidden flex items-center justify-center w-11 h-11 -mr-2 bg-transparent border-none cursor-pointer p-0 z-[1100]"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            aria-label={isMobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileOpen}
          >
            <span className="flex flex-col justify-between w-7 h-[18px]">
              <motion.span
                className="w-full h-[2px] bg-warm-white rounded-sm origin-center"
                animate={isMobileOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              />
              <motion.span
                className="w-full h-[2px] bg-warm-white rounded-sm"
                animate={isMobileOpen ? { opacity: 0 } : { opacity: 1 }}
                transition={{ duration: 0.2 }}
              />
              <motion.span
                className="w-full h-[2px] bg-warm-white rounded-sm origin-center"
                animate={isMobileOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              />
            </span>
          </button>
        </div>
      </header>

      {/* ── Mobile Drawer (Spazio-style) ── */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-[1040] bg-black/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setIsMobileOpen(false)}
            />

            {/* Drawer */}
            <motion.nav
              className="
                fixed top-0 right-0 z-[1050]
                w-[85%] max-w-[400px] h-full
                bg-surface/[0.98] backdrop-blur-[20px]
                shadow-[-10px_0_40px_rgba(0,0,0,0.25)]
                flex flex-col justify-center items-center gap-6 px-8
              "
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Close button */}
              <motion.button
                className="absolute top-6 right-6 w-11 h-11 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-warm-white text-lg cursor-pointer"
                onClick={() => setIsMobileOpen(false)}
                whileHover={{ rotate: 90, scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Close menu"
              >
                ✕
              </motion.button>

              {/* Nav links */}
              {NAV_LINKS.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    transition: { delay: 0.15 + i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] },
                  }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`
                      text-xl font-semibold uppercase tracking-[0.1em] transition-colors duration-300 min-h-[44px] flex items-center
                      ${isActive(link.href)
                        ? "text-crimson"
                        : "text-warm-white hover:text-crimson"
                      }
                    `}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{
                  opacity: 1,
                  x: 0,
                  transition: { delay: 0.15 + NAV_LINKS.length * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] },
                }}
              >
                <Link
                  href="/contact"
                  onClick={() => setIsMobileOpen(false)}
                  className="liquid-glass-btn-primary px-8 py-3.5 text-sm mt-4"
                >
                  Book a Shoot
                </Link>
              </motion.div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
