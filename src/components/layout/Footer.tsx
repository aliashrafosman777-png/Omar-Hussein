import React from "react";
import Link from "next/link";
import { OHWordmark } from "@/components/icons/OHWordmark";
import { NAV_LINKS, CONTACT_CONTENT, FOOTER_CONTENT } from "@/lib/content";
import { Camera, ExternalLink } from "lucide-react";

/**
 * Shared footer with full wordmark, navigation, social links, and copyright.
 */
export function Footer() {
  return (
    <footer className="relative border-t border-white/[0.04] bg-surface-dim overflow-hidden">
      {/* Atmospheric glows */}
      <div className="glow-crimson absolute -bottom-64 -left-32 opacity-30" aria-hidden="true" />
      <div className="glow-blue absolute -bottom-48 -right-48 opacity-20" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-[1280px] px-6 md:px-8 py-16 md:py-20">
        {/* Top section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 mb-16">
          {/* Brand */}
          <div className="md:col-span-5">
            <OHWordmark variant="white" showMonogram />
            <p className="mt-6 text-sm text-warm-white-muted leading-relaxed max-w-sm">
              Photography that captures art in everything — turning every
              glimpse into a masterpiece that tells your story.
            </p>
          </div>

          {/* Navigation */}
          <div className="md:col-span-3">
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-crimson mb-5">
              Navigation
            </h4>
            <ul className="space-y-3">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-warm-white-muted hover:text-warm-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div className="md:col-span-4">
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-crimson mb-5">
              Connect
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href={`mailto:${CONTACT_CONTENT.email}`}
                  className="text-sm text-warm-white-muted hover:text-warm-white transition-colors"
                >
                  {CONTACT_CONTENT.email}
                </a>
              </li>
              {CONTACT_CONTENT.socials.map((social) => (
                <li key={social.platform}>
                  <a
                    href={social.url}
                    className="text-sm text-warm-white-muted hover:text-warm-white transition-colors inline-flex items-center gap-2"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {social.platform === "Instagram" ? (
                      <Camera className="h-3.5 w-3.5" aria-hidden="true" />
                    ) : (
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                    {social.handle}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/[0.04] pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-charcoal">
            {FOOTER_CONTENT.copyright}
          </p>
          <p className="text-xs text-charcoal tracking-wider uppercase">
            {FOOTER_CONTENT.tagline}
          </p>
        </div>
      </div>
    </footer>
  );
}
