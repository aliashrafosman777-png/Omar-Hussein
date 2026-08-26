// ============================================
// OMAR HUSSEIN PHOTOGRAPHY — Project Types
// ============================================

export type ProjectCategory = "All" | "Artistic" | "Bridal" | "Fashion" | "Products";

export interface Project {
  id: string;
  title: string;
  category: Exclude<ProjectCategory, "All">;
  description: string;
  /** Gradient placeholder for fallback */
  gradient?: string;
  /** Cover image path for card thumbnail (optimized WebP) */
  coverImage?: string;
  /** Full-resolution image path for lightbox */
  lightboxImage?: string;
  /** Array of gallery image URLs (full-res for lightbox) */
  images?: string[];
  /** Array of card-sized gallery thumbnails (parallel to images) */
  cardImages?: string[];
  /** Natural image dimensions for proper aspect ratio */
  cardWidth?: number;
  cardHeight?: number;
  /** Blur data URL for instant placeholder */
  blurDataURL?: string;
}

export const CATEGORIES: ProjectCategory[] = [
  "All",
  "Artistic",
  "Bridal",
  "Fashion",
  "Products",
];

/**
 * Map WorkCategory enum values to display-friendly ProjectCategory values.
 */
export function mapWorkCategoryToDisplay(
  category: string
): Exclude<ProjectCategory, "All"> {
  const map: Record<string, Exclude<ProjectCategory, "All">> = {
    ARTISTIC: "Artistic",
    BRIDAL: "Bridal",
    FASHION: "Fashion",
    PRODUCTS: "Products",
  };
  return map[category] ?? "Artistic";
}
