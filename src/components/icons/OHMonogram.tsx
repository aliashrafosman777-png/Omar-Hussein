import React from "react";

interface OHMonogramProps {
  variant?: "colored" | "white" | "currentColor";
  className?: string;
  size?: number;
}

/**
 * OH Monogram — faithfully recreated from Omar Hussein's branding PDF.
 *
 * The H is represented through two flowing, curved organic vertical shapes
 * (not the traditional straight H). The O is a circle representing a camera
 * lens — the first letter of Omar combined with a minimalist lens form.
 * The H's right curve connects into the O circle.
 */
export function OHMonogram({
  variant = "white",
  className = "",
  size = 40,
}: OHMonogramProps) {
  const hColor =
    variant === "colored"
      ? "#05345F"
      : variant === "white"
        ? "#ffffff"
        : "currentColor";
  const oColor =
    variant === "colored"
      ? "#942322"
      : variant === "white"
        ? "#ffffff"
        : "currentColor";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="OH monogram — Omar Hussein Photography"
      role="img"
    >
      {/* H — Left vertical curve */}
      <path
        d="M20 5 C20 5, 14 30, 18 60 C22 90, 20 115, 20 115"
        stroke={hColor}
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
      />
      {/* H — Right vertical curve (flows into the O) */}
      <path
        d="M44 5 C44 5, 50 30, 46 55 C42 75, 48 85, 55 85"
        stroke={hColor}
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
      />
      {/* H — Horizontal connection (curved, organic) */}
      <path
        d="M22 55 C28 48, 38 48, 44 55"
        stroke={hColor}
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
      />
      {/* O — Circle (camera lens) */}
      <circle
        cx="68"
        cy="85"
        r="22"
        fill={oColor}
      />
      {/* Lens detail — subtle inner ring */}
      <circle
        cx="68"
        cy="85"
        r="10"
        fill="none"
        stroke={variant === "colored" ? "rgba(255,255,255,0.15)" : "rgba(10,10,11,0.15)"}
        strokeWidth="1.5"
      />
    </svg>
  );
}
