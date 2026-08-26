import Image from "next/image";

interface OHMonogramProps {
  /** Retained for compatibility; the approved asset supplies its own colors. */
  variant?: "colored" | "white" | "currentColor";
  className?: string;
  size?: number;
}

/** Approved Omar Hussein monogram used consistently throughout the website. */
export function OHMonogram({
  className = "",
  size = 40,
}: OHMonogramProps) {
  return (
    <Image
      src="/media/brand/logo.png"
      width={size}
      height={size}
      alt="OH monogram — Omar Hussein Photography"
      className={`object-contain ${className}`}
      sizes={`${size}px`}
      loading="eager"
      unoptimized
    />
  );
}
