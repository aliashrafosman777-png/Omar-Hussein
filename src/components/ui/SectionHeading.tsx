import React from "react";

interface SectionHeadingProps {
  label?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

/**
 * Reusable section heading with uppercase micro-label, title, and optional description.
 */
export function SectionHeading({
  label,
  title,
  description,
  align = "left",
  className = "",
}: SectionHeadingProps) {
  return (
    <div
      className={`max-w-xl ${align === "center" ? "mx-auto text-center" : ""} ${className}`}
    >
      {label && (
        <span className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-crimson mb-2.5">
          {label}
        </span>
      )}
      <h2 className="text-2xl sm:text-3xl md:text-[34px] font-bold tracking-tight leading-tight text-warm-white">
        {title}
      </h2>
      {description && (
        <p className="mt-3 text-sm sm:text-[15px] text-warm-white-muted leading-relaxed max-w-lg">
          {description}
        </p>
      )}
    </div>
  );
}
