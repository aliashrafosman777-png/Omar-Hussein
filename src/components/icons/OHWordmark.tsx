import React from "react";
import { OHMonogram } from "./OHMonogram";

interface OHWordmarkProps {
  variant?: "colored" | "white" | "currentColor";
  className?: string;
  showMonogram?: boolean;
}

/**
 * Full "OMAR HUSSEIN Photography" wordmark with optional monogram.
 * Uses the brand font stack via CSS.
 */
export function OHWordmark({
  variant = "white",
  className = "",
  showMonogram = true,
}: OHWordmarkProps) {
  const textColor =
    variant === "colored"
      ? "#F5F0EB"
      : variant === "white"
        ? "#ffffff"
        : "currentColor";

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {showMonogram && <OHMonogram variant={variant} size={48} />}
      <div className="flex flex-col" style={{ color: textColor }}>
        <span
          className="text-sm font-bold uppercase tracking-[0.2em] leading-tight"
          style={{ fontFamily: '"Century Gothic", "Avenir Next", Montserrat, sans-serif' }}
        >
          Omar Hussein
        </span>
        <span
          className="text-xs font-light tracking-[0.15em] leading-tight opacity-70"
          style={{ fontFamily: '"Century Gothic", "Avenir Next", Montserrat, sans-serif' }}
        >
          Photography
        </span>
      </div>
    </div>
  );
}
