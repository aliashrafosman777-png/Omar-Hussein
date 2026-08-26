import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import { ConditionalLayout } from "@/components/layout/ConditionalLayout";
import { SITE_CONFIG } from "@/lib/content";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const viewport: Viewport = {
  themeColor: "#0A0A0B",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    default: SITE_CONFIG.title,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  keywords: [
    "Omar Hussein",
    "Photography",
    "Portrait Photography",
    "Editorial Photography",
    "Commercial Photography",
    "Cinematic Photography",
    "Bold Photography",
    "Art Photography",
  ],
  authors: [{ name: SITE_CONFIG.name }],
  creator: SITE_CONFIG.name,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_CONFIG.url,
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    siteName: SITE_CONFIG.name,
    images: [
      {
        url: SITE_CONFIG.ogImage,
        width: 854,
        height: 1280,
        alt: `${SITE_CONFIG.name} — Bold. Artistic. Cinematic.`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    images: [SITE_CONFIG.ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Omar Hussein",
    jobTitle: "Photographer",
    description: SITE_CONFIG.description,
    url: SITE_CONFIG.url,
  };

  return (
    <html
      lang="en"
      className={`${montserrat.variable} h-full`}
      data-scroll-behavior="smooth"
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col antialiased">
        <a href="#main-content" className="skip-to-content">
          Skip to main content
        </a>

        {/* Grain overlay */}
        <div className="grain-overlay" aria-hidden="true" />

        <ConditionalLayout>{children}</ConditionalLayout>
      </body>
    </html>
  );
}
