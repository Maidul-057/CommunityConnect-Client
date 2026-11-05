"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { HeartHandshake, LockKeyhole } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isReady } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const currentPath = `${pathname}${window.location.search}`;
    if (isReady && !isAuthenticated) {
      router.replace(`/login?returnTo=${encodeURIComponent(currentPath)}`);
    }
  }, [isAuthenticated, isReady, pathname, router]);

  const loginHref = `/login?returnTo=${encodeURIComponent(pathname)}`;

  if (!isReady) {
    return (
      <main className="cc-page">
        <div className="cc-container">
          <div className="cc-empty-state" aria-label="Loading your account">
            <span className="cc-empty-icon"><HeartHandshake size={23} /></span>
            <h2>Getting your space ready</h2>
            <p>One moment while we reconnect you with your community.</p>
          </div>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="cc-page">
        <div className="cc-container">
          <div className="cc-empty-state" aria-live="polite">
            <span className="cc-empty-icon"><LockKeyhole size={23} /></span>
            <h2>Taking you to sign in</h2>
            <p>Sign in to continue to your community space.</p>
            <Link
              href={loginHref}
              onClick={(event) => {
                event.preventDefault();
                const currentPath = `${pathname}${window.location.search}`;
                router.push(`/login?returnTo=${encodeURIComponent(currentPath)}`);
              }}
              className="cc-button cc-button-small"
            >Continue to login <HeartHandshake size={15} /></Link>
          </div>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
