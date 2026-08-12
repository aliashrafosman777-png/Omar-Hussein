"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

/**
 * Conditionally renders the public Navbar and Footer.
 * Hidden on /admin/* routes so the admin dashboard gets its own clean layout.
 */
export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  return (
    <>
      {!isAdmin && <Navbar />}
      <main id="main-content" className="flex-1">
        {children}
      </main>
      {!isAdmin && <Footer />}
    </>
  );
}
