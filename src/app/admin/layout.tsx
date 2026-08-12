import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  robots: { index: false, follow: false },
};

/**
 * Admin layout — separate from the public site.
 * No Navbar or Footer — clean admin-only shell.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface text-warm-white">{children}</div>
  );
}
