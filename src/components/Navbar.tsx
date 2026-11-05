"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Heart, Leaf, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";
import { ThemeToggle } from "@/components/ThemeToggle";

const links = [
  { href: "/", label: "Home" },
  { href: "/upcoming-events", label: "Upcoming events" },
  { href: "/create-event", label: "Create an event" },
];

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("You’re signed out.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to sign out.");
    } finally {
      setProfileOpen(false);
      setMenuOpen(false);
    }
  };

  return (
    <header className="cc-nav">
      <div className="cc-nav-inner">
        <Link href="/" className="cc-brand" aria-label="Community Connect home">
          <span className="cc-brand-mark"><Leaf size={21} strokeWidth={2.2} /></span>
          <span className="cc-brand-name">community<span>connect</span></span>
        </Link>

        <nav className="cc-nav-links" aria-label="Main navigation">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={pathname === link.href ? "cc-nav-link is-active" : "cc-nav-link"}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="cc-nav-actions">
          <ThemeToggle />
          {isAuthenticated ? (
            <div className="cc-profile-menu">
              <button
                type="button"
                className="cc-profile-trigger"
                onClick={() => setProfileOpen((open) => !open)}
                aria-expanded={profileOpen}
                aria-label="Open profile menu"
                title={user?.name || "Your account"}
              >
                {user?.photoUrl
                  ? <img src={user.photoUrl} alt="" />
                  : <span className="cc-avatar-fallback" aria-hidden="true">{user?.name?.trim().charAt(0).toUpperCase() || "C"}</span>}
                <span>{user?.name || "Your account"}</span>
                <ChevronDown size={15} />
              </button>
              {profileOpen && (
                <div className="cc-profile-dropdown">
                  <p className="cc-dropdown-label">{user?.email}</p>
                  <Link href="/profile" onClick={() => setProfileOpen(false)}>Your profile</Link>
                  <Link href="/create-event" onClick={() => setProfileOpen(false)}>Create an event</Link>
                  <Link href="/manage-events" onClick={() => setProfileOpen(false)}>Manage events</Link>
                  <Link href="/joined-events" onClick={() => setProfileOpen(false)}>Joined events</Link>
                  <button type="button" onClick={handleLogout}>
                    <LogOut size={15} /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="cc-auth-actions">
              <Link href="/login" className="cc-login-link">Log in</Link>
              <Link href="/register" className="cc-button cc-button-small">
                Join the community <Heart size={15} />
              </Link>
            </div>
          )}
          {isAuthenticated && (
            <Link href="/profile" className="cc-mobile-profile" aria-label={`Your profile, ${user?.name || ""}`}>
              {user?.photoUrl
                ? <img src={user.photoUrl} alt="" />
                : <span className="cc-avatar-fallback" aria-hidden="true">{user?.name?.trim().charAt(0).toUpperCase() || "C"}</span>}
            </Link>
          )}
          <button
            type="button"
            className="cc-mobile-toggle"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className="cc-mobile-menu">
          {links.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>
              {link.label}
            </Link>
          ))}
          {isAuthenticated ? (
            <>
              <Link href="/manage-events" onClick={() => setMenuOpen(false)}>Manage events</Link>
              <Link href="/joined-events" onClick={() => setMenuOpen(false)}>Joined events</Link>
              <Link href="/profile" onClick={() => setMenuOpen(false)}>Your profile</Link>
              <button type="button" onClick={handleLogout}>Sign out</button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setMenuOpen(false)}>Log in</Link>
              <Link href="/register" onClick={() => setMenuOpen(false)}>Create an account</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
