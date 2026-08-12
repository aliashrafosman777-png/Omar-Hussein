"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "blue";
  href?: string;
  children: React.ReactNode;
  showArrow?: boolean;
  loading?: boolean;
  external?: boolean;
}

/**
 * Shared liquid-glass button component.
 * Adapted from the hossamyehia reference, with Omar's brand colors.
 *
 * Renders as:
 * - Next.js <Link> if href starts with /
 * - <a> if href is external
 * - <button> otherwise
 */
export function GlassButton({
  variant = "primary",
  href,
  children,
  showArrow = false,
  loading = false,
  external = false,
  className = "",
  disabled,
  ...props
}: GlassButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 font-sans text-xs font-semibold uppercase tracking-[0.1em] px-7 py-3.5";

  const variantClass =
    variant === "primary"
      ? "liquid-glass-btn-primary"
      : variant === "blue"
        ? "liquid-glass-btn-blue"
        : "liquid-glass-btn-secondary";

  const classes = `${baseStyles} ${variantClass} ${className}`;

  const content = (
    <>
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : null}
      <span className={loading ? "opacity-70" : ""}>{children}</span>
      {showArrow && !loading && (
        <ArrowRight className="h-4 w-4 transition-transform" aria-hidden="true" />
      )}
    </>
  );

  if (href && !disabled) {
    if (external) {
      return (
        <a
          href={href}
          className={classes}
          target="_blank"
          rel="noopener noreferrer"
        >
          {content}
        </a>
      );
    }
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button className={classes} disabled={disabled || loading} {...props}>
      {content}
    </button>
  );
}
