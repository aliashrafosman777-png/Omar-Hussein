import type { WorkCategory, WorkItem } from "./db-schema";
import imageMetadata from "../../public/media/work/_image-metadata.json";

interface ImageMetadata {
  slug: string;
  cardWidth: number;
  cardHeight: number;
  blurDataURL: string;
}

const CATEGORY_BY_SLUG: Record<string, WorkCategory> = {
  "1Portraits": "ARTISTIC",
  "1.1Portraits": "ARTISTIC",
  "portrait-1": "ARTISTIC",
  "031A1048": "ARTISTIC",
  "031A8445": "ARTISTIC",
  "3Portraits": "BRIDAL",
  "3.1Portraits": "BRIDAL",
  "031A8128": "BRIDAL",
  "DSC07480": "BRIDAL",
  "973279": "PRODUCTS",
  "1515402": "PRODUCTS",
  "portrait-2": "PRODUCTS",
  "DSC00154": "PRODUCTS",
};

function titleFromSlug(slug: string, category: WorkCategory): string {
  if (/^\d/.test(slug) || slug.startsWith("DSC")) {
    const labels: Record<WorkCategory, string> = {
      ARTISTIC: "Artistic Portrait",
      BRIDAL: "Bridal Portrait",
      FASHION: "Fashion Portrait",
      PRODUCTS: "Product Portrait",
    };
    return labels[category];
  }

  return slug
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

/**
 * Deployment-safe portfolio catalog. The admin-managed JSON database takes
 * precedence when populated; this catalog prevents an empty portfolio on a
 * fresh or read-only serverless deployment.
 */
export const DEFAULT_WORK_ITEMS: WorkItem[] = (
  imageMetadata as ImageMetadata[]
).map((image, index) => {
  const category = CATEGORY_BY_SLUG[image.slug] ?? "FASHION";
  const now = "2026-01-01T00:00:00.000Z";

  return {
    id: index + 1,
    title: titleFromSlug(image.slug, category),
    imageUrl: `/media/work/${image.slug}-card.webp`,
    fullImageUrl: `/media/work/${image.slug}-full.webp`,
    category,
    altText: `${titleFromSlug(image.slug, category)} photography by Omar Hussein`,
    displayOrder: index + 1,
    isPublished: true,
    blurDataURL: image.blurDataURL,
    cardWidth: image.cardWidth,
    cardHeight: image.cardHeight,
    sourceFile: image.slug,
    createdAt: now,
    updatedAt: now,
  };
});
