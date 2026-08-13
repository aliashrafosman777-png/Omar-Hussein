// ============================================
// OMAR HUSSEIN PHOTOGRAPHY — Site Content
// Central typed content file
// ============================================

export const SITE_CONFIG = {
  name: "Omar Hussein",
  title: "Omar Hussein Photography — Bold. Artistic. Cinematic.",
  description:
    "Photography that captures art in everything — turning every glimpse into a masterpiece that tells your story. Bold, artistic, and cinematic visual storytelling by Omar Hussein.",
  url: "https://omarhussein.photography",
  ogImage: "/media/omar-portrait.jpeg",
} as const;

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Work", href: "/work" },
  { label: "About", href: "/about" },
  { label: "Courses", href: "/courses" },
  { label: "Contact", href: "/contact" },
] as const;

export const HERO_CONTENT = {
  name: "Omar Hussein",
  title: "Photography",
  tagline: "Let's start the journey of art and beauty.",
  primaryCTA: { label: "View My Work", href: "/work" },
  secondaryCTA: { label: "Book a Shoot", href: "/contact" },
} as const;

export const ABOUT_CONTENT = {
  headline: "The Art Behind the Lens",
  intro:
    "My purpose is to inspire people to spread love and diversity. Through my lens, I teach and share the beauty and art that exists in everything around us — helping others see what is beyond the obvious.",
  story: [
    "Photography, for me, is not about capturing what the eye already sees. It is about revealing what lies beneath the surface — the emotion in a glance, the story in a single frame, the art hidden in the everyday.",
    "Every shoot begins with a vision: to find beauty where others might overlook it, and to transform each moment into a visual narrative that resonates. I believe in the power of light, composition, and authentic connection to create images that move people.",
    "My approach is cinematic, bold, and intentional. I work with hot-colored lighting against dark surfaces, creative compositions, and organic forms to craft images that feel alive. Each photograph is not just a picture — it is a masterpiece that tells your story.",
  ],
  philosophy:
    "Capturing art in everything, turning every glimpse into a masterpiece that tells your story.",
  logoExplanation: {
    headline: "The Mark",
    description:
      'The OH monogram merges two ideas: the letter H is represented through curved, organic shapes — not in the traditional straight form — to embody artistic vision. The O combines the first letter of Omar with a minimalist camera lens, rendered simply and intentionally. Together, they represent the creative eye behind every frame.',
  },
  services: [
    {
      title: "Portraits",
      description:
        "Intimate, character-driven portraits that reveal personality and emotion through bold lighting and thoughtful composition.",
    },
    {
      title: "Editorial",
      description:
        "Fashion, lifestyle, and editorial photography with cinematic quality — designed for publications and brands seeking visual impact.",
    },
    {
      title: "Commercial",
      description:
        "Professional imagery for brands and businesses — product photography, campaigns, and visual content that elevates your story.",
    },
    {
      title: "Events",
      description:
        "Capturing the energy and emotion of live moments — from intimate gatherings to large-scale productions, every event becomes a visual narrative.",
    },
  ],
} as const;

export const CONTACT_CONTENT = {
  headline: "Let's Create Together",
  intro:
    "Every great project begins with a conversation. Whether you have a clear vision or just a spark of an idea, I would love to hear about it. Reach out and let us bring your story to life through the lens.",
  shootTypes: [
    "Portrait Session",
    "Editorial / Fashion",
    "Commercial / Brand",
    "Event Coverage",
    "Creative Concept",
    "Other",
  ],
  budgetRanges: [
    "Under $500",
    "$500 – $1,000",
    "$1,000 – $2,500",
    "$2,500 – $5,000",
    "$5,000+",
    "Let's discuss",
  ],
  email: "hello@omarhussein.photography",
  phone: "+20 109 639 3822",
  phoneHref: "+201096393822",
  location: "Cairo, Egypt",
  socials: [
    {
      platform: "Instagram",
      url: "https://www.instagram.com/omarhussein/",
      handle: "@omarhussein",
    },
    {
      platform: "Behance",
      url: "https://www.behance.net/omarhussein",
      handle: "omarhussein",
    },
    {
      platform: "LinkedIn",
      url: "https://www.linkedin.com/in/omarhussein/",
      handle: "omarhussein",
    },
  ],
} as const;

export const COURSES_CONTENT = {
  headline: "COURSES",
  intro:
    "Step into a new era of creative learning — fast, focused, and built for real results. Our photography courses go straight to the point, giving you practical, hands-on experience that matches today's market needs. Each program is crafted to help you think like a creative, work like a professional, and stay ahead of the industry.",
  courses: [
    {
      title: "Makeup Photography with Your Phone",
      description:
        "Master the art of portrait photography — from lighting setups and posing techniques to post-processing workflows that elevate every shot.",
      highlights: [
        "Studio & natural lighting techniques",
        "Posing and directing subjects",
        "Color grading & retouching in Lightroom/Photoshop",
        "Building a portrait portfolio",
      ],
      duration: "One Day",
      level: "Beginner to Intermediate",
    },
  ],
} as const;

export interface SampleWorkVideo {
  /** Video file path (relative to public/) */
  videoUrl: string;
}

export const SAMPLE_WORK_CONTENT = {
  headline: "SAMPLE OF WORK",
  videos: [
    { videoUrl: "/media/courses/frist-video.mp4" },
    { videoUrl: "/media/courses/secound-video.mp4" },
    { videoUrl: "/media/courses/thrid-video.mp4" },
    { videoUrl: "/media/courses/fourth-video.mp4" },
    { videoUrl: "/media/courses/five-video.mp4" },
  ] as SampleWorkVideo[],
};

export const FOOTER_CONTENT = {
  copyright: `© ${new Date().getFullYear()} Omar Hussein Photography. All rights reserved.`,
  tagline: "Bold. Artistic. Cinematic.",
} as const;
