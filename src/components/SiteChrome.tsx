"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";

export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/register";

  return (
    <div className="site-shell">
      {!isAuthPage && <Navbar />}
      <div className="site-content">{children}</div>
      {!isAuthPage && <Footer />}
    </div>
  );
}
