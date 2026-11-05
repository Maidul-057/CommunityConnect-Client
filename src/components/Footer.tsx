import Link from "next/link";
import { ArrowUpRight, Globe, Leaf, Mail, MapPin, MessageCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="cc-footer">
      <div className="cc-footer-main">
        <div className="cc-footer-brand">
          <Link href="/" className="cc-brand">
            <span className="cc-brand-mark"><Leaf size={21} strokeWidth={2.2} /></span>
            <span className="cc-brand-name">community<span>connect</span></span>
          </Link>
          <p>Good things happen when we show up for each other. Find your people, find your cause, and make a difference close to home.</p>
          <a className="cc-footer-email" href="mailto:hello@communityconnect.org"><Mail size={15} /> hello@communityconnect.org</a>
        </div>
        <div className="cc-footer-column">
          <h3>Explore</h3>
          <Link href="/">Home</Link>
          <Link href="/upcoming-events">Upcoming events</Link>
          <Link href="/create-event">Start an initiative</Link>
        </div>
        <div className="cc-footer-column">
          <h3>Your community</h3>
          <Link href="/joined-events">Joined events</Link>
          <Link href="/manage-events">Manage events</Link>
          <Link href="/profile">Your profile</Link>
        </div>
        <div className="cc-footer-column cc-footer-connect">
          <h3>Come say hello</h3>
          <p><MapPin size={15} /> Dhaka, Bangladesh</p>
          <div className="cc-socials">
            <a href="#" target="_blank" rel="noreferrer" aria-label="Community Connect"><Globe size={17} /></a>
            <a href="#" target="_blank" rel="noreferrer" aria-label="Community stories"><MessageCircle size={17} /></a>
            <a href="#" target="_blank" rel="noreferrer" aria-label="X">
              <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.9 1.15h3.68l-8.04 9.2L24 22.85h-7.4l-5.8-7.58-6.64 7.58H.47l8.59-9.82L0 1.15h7.59l5.25 6.93 6.06-6.93Zm-1.29 19.5h2.04L6.49 3.24H4.3l13.31 17.41Z" />
              </svg>
            </a>
            <a href="#" aria-label="Email us"><ArrowUpRight size={17} /></a>
          </div>
        </div>
      </div>
      <div className="cc-footer-bottom">
        <span>© {new Date().getFullYear()} Community Connect. Made for the people who show up.</span>
        <span className="cc-footer-note">Small actions, shared generously.</span>
      </div>
    </footer>
  );
}
