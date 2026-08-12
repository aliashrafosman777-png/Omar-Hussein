// ============================================
// OMAR HUSSEIN PHOTOGRAPHY — Project Data
// Replace sample projects with real portfolio work
// ============================================

export type ProjectCategory = "All" | "Portraits";

export interface Project {
  id: string;
  title: string;
  category: Exclude<ProjectCategory, "All">;
  description: string;
  /** Gradient placeholder for fallback */
  gradient?: string;
  /** Cover image path for gallery thumbnail */
  coverImage?: string;
  /** Array of gallery image URLs */
  images?: string[];
  aspectRatio: "portrait" | "landscape" | "square";
}

export const CATEGORIES: ProjectCategory[] = [
  "All",
  "Portraits",
];

export const PROJECTS: Project[] = [
  {
    id: "project-01",
    title: "Portrait Soliloquy",
    category: "Portraits",
    description:
      "A portrait series exploring character, light, and emotion.",
    coverImage: "/media/work/1Portraits.jpeg",
    images: [
      "/media/work/1Portraits.jpeg",
      "/media/work/1.1Portraits.jpeg",
    ],
    aspectRatio: "portrait",
  },
  {
    id: "project-02",
    title: "Midnight Portrait",
    category: "Portraits",
    description:
      "Portrait series captured in cinematic tones — bold silhouettes against atmospheric backdrops.",
    gradient: "linear-gradient(160deg, #05345F 0%, #643F45 50%, #1A1A1E 100%)",
    aspectRatio: "landscape",
  },
  {
    id: "project-03",
    title: "Urban Expression",
    category: "Portraits",
    description:
      "Character portraiture capturing urban lifestyle — energy, movement, and visual impact.",
    gradient: "linear-gradient(180deg, #1A1A1E 0%, #942322 40%, #05345F 100%)",
    aspectRatio: "portrait",
  },
  {
    id: "project-04",
    title: "The Atmosphere",
    category: "Portraits",
    description:
      "Intimate studio portrait session capturing raw energy and authentic emotion.",
    gradient: "linear-gradient(145deg, #643F45 0%, #0A0A0B 50%, #05345F 100%)",
    aspectRatio: "landscape",
  },
  {
    id: "project-05",
    title: "Quiet Strength",
    category: "Portraits",
    description:
      "Minimalist portraiture with a focus on expression, texture, and the interplay of warm light on skin.",
    gradient: "linear-gradient(170deg, #942322 0%, #643F45 60%, #0A0A0B 100%)",
    aspectRatio: "square",
  },
  {
    id: "project-06",
    title: "Shadow & Structure",
    category: "Portraits",
    description:
      "Architectural portraiture for creative professionals — clean, precise, and elevated.",
    gradient: "linear-gradient(130deg, #05345F 0%, #1A1A1E 50%, #942322 100%)",
    aspectRatio: "portrait",
  },
  {
    id: "project-07",
    title: "Velvet Hour",
    category: "Portraits",
    description:
      "A portrait exploration of twilight beauty — rich tones, flowing fabric, and controlled movement.",
    coverImage: "/media/work/2Portraits.jpeg",
    images: [
      "/media/work/2Portraits.jpeg",
      "/media/work/2.1Portraits.jpeg",
      "/media/work/2.2Portraits.jpeg",
    ],
    aspectRatio: "landscape",
  },
  {
    id: "project-08",
    title: "Resonance",
    category: "Portraits",
    description:
      "Character portraiture — capturing emotion and depth in intimate moments.",
    coverImage: "/media/work/3Portraits.jpeg",
    images: [
      "/media/work/3Portraits.jpeg",
      "/media/work/3.1Portraits.jpeg",
    ],
    aspectRatio: "portrait",
  },
  {
    id: "project-09",
    title: "First Light",
    category: "Portraits",
    description:
      "Dawn-lit portrait series capturing the quiet vulnerability of early morning — soft, honest, and warm.",
    gradient: "linear-gradient(180deg, #942322 0%, #643F45 70%, #05345F 100%)",
    aspectRatio: "square",
  },
];
