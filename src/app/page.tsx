"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  HeartHandshake,
  Leaf,
  Search,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { toast } from "sonner";
import { EventCard } from "@/components/EventCard";
import { apiFetch } from "@/lib/api";
import { communityGallery } from "@/lib/data";
import type { EventItem } from "@/lib/types";

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Discover an event",
    description: "Explore nearby opportunities and find the causes that matter to you.",
  },
  {
    number: "02",
    icon: UsersRound,
    title: "Join the community",
    description: "Meet your neighbors, share your skills, and make new connections.",
  },
  {
    number: "03",
    icon: HeartHandshake,
    title: "Make an impact",
    description: "Turn a few hours of your time into something that lasts.",
  },
];

export default function HomePage() {
  const [featured, setFeatured] = useState<EventItem[]>([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [featuredError, setFeaturedError] = useState("");
  const [reloadEvents, setReloadEvents] = useState(0);
  const [email, setEmail] = useState("");

  useEffect(() => {
    let active = true;
    apiFetch<EventItem[]>("/api/events/recent")
      .then((events) => {
        if (active) setFeatured(events);
      })
      .catch((error: unknown) => {
        console.error("Unable to load featured events:", error);
        if (active) {
          const message = error instanceof Error ? error.message : "Please try again later.";
          setFeaturedError(message);
          toast.error("We couldn’t load upcoming events. Please try again later.");
        }
      })
      .finally(() => {
        if (active) setFeaturedLoading(false);
      });
    return () => {
      active = false;
    };
  }, [reloadEvents]);

  const handleSubscribe = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) return;
    toast.success("You’re on the list. Look out for good things coming your way!");
    setEmail("");
  };

  return (
    <main>
      <section className="cc-hero">
        <div className="cc-container">
          <div className="cc-hero-grid">
            <div className="cc-hero-copy">
              <span className="cc-hero-kicker"><span /> Your neighborhood, a little brighter</span>
              <h1>Small Actions.<br />Big Changes.<br /><em>Stronger Communities.</em></h1>
              <p>
                Find your people, lend a hand, and bring local ideas to life. Community Connect makes it easy to turn caring into doing.
              </p>
              <div className="cc-hero-actions">
                <Link href="/upcoming-events" className="cc-button">
                  Explore events <ArrowRight size={17} />
                </Link>
                <Link href="/create-event" className="cc-button-secondary">
                  Start an initiative <ArrowUpRight size={16} />
                </Link>
              </div>
              <div className="cc-hero-note">
                <div className="cc-hero-faces" aria-hidden="true">
                  <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=75" alt="" />
                  <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=75" alt="" />
                  <img src="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=80&q=75" alt="" />
                </div>
                <span><b>Good people, doing good things.</b><br />There’s a place for you here.</span>
              </div>
            </div>
            <div className="cc-hero-visual">
              <div className="cc-hero-photo-frame">
                <img
                  src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=1500&q=90"
                  alt="A group of volunteers working together in their community"
                  className="cc-hero-photo"
                  fetchPriority="high"
                />
                <div className="cc-hero-caption">
                  <small>Dhaka · Together we can</small>
                  <strong>Hands in the soil. Hope in every seed.</strong>
                </div>
              </div>
            </div>
          </div>
          <div className="cc-proof-strip">
            <span><Check size={14} /> Local-first</span>
            <span><Check size={14} /> Open to everyone</span>
            <span><Check size={14} /> Impact you can see</span>
          </div>
        </div>
      </section>

      <section className="cc-section">
        <div className="cc-container">
          <div className="cc-section-head">
            <div>
              <span className="cc-eyebrow">Good things are happening</span>
              <h2 className="cc-heading">Make a difference<br />near you.</h2>
            </div>
            <Link href="/upcoming-events" className="cc-text-link">Explore all events <ArrowRight size={16} /></Link>
          </div>
          <div className="cc-events-grid">
            {featuredLoading
              ? Array.from({ length: 6 }, (_, index) => (
                <div className="cc-skeleton" key={index} aria-label="Loading featured event">
                  <div className="cc-skeleton-image" />
                  <div className="cc-skeleton-content">
                    <div className="cc-skeleton-line short" />
                    <div className="cc-skeleton-line" />
                    <div className="cc-skeleton-line short" />
                  </div>
                </div>
              ))
              : featuredError
                ? (
                  <div className="cc-empty-state">
                    <span className="cc-empty-icon"><CalendarDays size={23} /></span>
                    <h2>Upcoming events are taking a moment</h2>
                    <p>{featuredError}</p>
                    <button type="button" className="cc-button cc-button-small" onClick={() => { setFeaturedLoading(true); setFeaturedError(""); setReloadEvents((value) => value + 1); }}>Try again <ArrowRight size={15} /></button>
                  </div>
                )
                : featured.map((event) => <EventCard key={event.id} event={event} />)}
          </div>
          {!featuredLoading && !featuredError && featured.length === 0 && (
            <div className="cc-empty-state">
              <span className="cc-empty-icon"><CalendarDays size={23} /></span>
              <h2>New events are on the way</h2>
              <p>There are no upcoming activities just yet. Check back soon or start an initiative of your own.</p>
              <Link href="/create-event" className="cc-button cc-button-small">Start an initiative <ArrowRight size={15} /></Link>
            </div>
          )}
        </div>
      </section>

      <section className="cc-section cc-how">
        <div className="cc-container">
          <div className="cc-section-head">
            <div>
              <span className="cc-eyebrow">It starts with you</span>
              <h2 className="cc-heading">A little goes<br />a long way.</h2>
            </div>
            <p className="cc-lede">No experience needed. Just a little time, an open heart, and a willingness to be part of something good.</p>
          </div>
          <div className="cc-steps">
            {steps.map(({ number, icon: Icon, title, description }) => (
              <article className="cc-step" key={number}>
                <div className="cc-step-number">
                  <span>STEP {number}</span>
                  <span className="cc-step-icon"><Icon size={20} /></span>
                </div>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="cc-section">
        <div className="cc-container">
          <div className="cc-section-head">
            <div>
              <span className="cc-eyebrow">People make the difference</span>
              <h2 className="cc-heading">Real moments.<br />Real community.</h2>
            </div>
            <p className="cc-lede">Every meal shared, tree planted, and street cleaned is a reminder of what we can do when we do it together.</p>
          </div>
          <div className="cc-gallery">
            {communityGallery.map((image) => (
              <figure className={image.className} key={image.label}>
                <img src={image.src} alt={image.label} loading="lazy" />
                <figcaption>{image.label}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="cc-section-tight">
        <div className="cc-container">
          <div className="cc-impact-cta">
            <div className="cc-impact-cta-content">
              <span className="cc-eyebrow"><Leaf size={14} /> Better, together</span>
              <h2>Your community needs you.</h2>
              <p>Your time and care can be the beginning of something wonderful. Come find out what we can do together.</p>
              <Link href="/upcoming-events" className="cc-button">Join the movement <ArrowRight size={17} /></Link>
            </div>
          </div>
        </div>
      </section>

      <section className="cc-section-tight">
        <div className="cc-container">
          <div className="cc-newsletter">
            <div>
              <span className="cc-eyebrow"><Sparkles size={14} /> A little good in your inbox</span>
              <h2>Good things grow when shared.</h2>
              <p>Get thoughtful updates about nearby events, inspiring community stories, and ways to get involved.</p>
            </div>
            <form className="cc-newsletter-form" onSubmit={handleSubscribe}>
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Your email address"
                aria-label="Your email address"
              />
              <button type="submit" className="cc-button">Subscribe <ArrowDownRight size={15} /></button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
