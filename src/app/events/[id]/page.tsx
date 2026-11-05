"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  HeartHandshake,
  Mail,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";
import { useCommunity } from "@/components/CommunityProvider";
import { EventCard } from "@/components/EventCard";
import { formatEventDate, getUpcomingEvents } from "@/lib/data";
import { apiFetch } from "@/lib/api";
import type { EventItem } from "@/lib/types";

export default function EventDetailsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { isAuthenticated, user } = useAuth();
  const { events, joinEvent, hasJoined } = useCommunity();
  const [loadedEvent, setLoadedEvent] = useState<{ id: string; event: EventItem | null; loadedAt: number } | null>(null);
  const [joining, setJoining] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadEvent, setReloadEvent] = useState(0);
  const loading = loadedEvent?.id !== params.id;
  const event = loadedEvent?.id === params.id ? loadedEvent.event : null;

  useEffect(() => {
    let active = true;
    apiFetch<EventItem>(`/api/events/${encodeURIComponent(params.id)}`)
      .then((result) => {
        if (active) {
          setLoadedEvent({ id: params.id, event: result, loadedAt: Date.now() });
          setLoadError(null);
        }
      })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : "Unable to load this event.";
        if (active) {
          setLoadedEvent({ id: params.id, event: null, loadedAt: Date.now() });
          setLoadError(message);
        }
        if (active && message !== "Event not found.") {
          toast.error(message);
        }
      });
    return () => {
      active = false;
    };
  }, [params.id, reloadEvent]);

  if (loading) {
    return (
      <main className="cc-page">
        <div className="cc-container"><div className="cc-empty-state" aria-label="Loading event"><h2>Loading event details…</h2></div></div>
      </main>
    );
  }

  if (!event) {
    return (
      <main className="cc-page">
        <div className="cc-container">
          <div className="cc-empty-state">
            <span className="cc-empty-icon"><HeartHandshake size={23} /></span>
            {loadError && loadError !== "Event not found." ? (
              <>
                <h2>We couldn’t load this event</h2>
                <p>{loadError}</p>
                <button type="button" className="cc-button cc-button-small" onClick={() => { setLoadedEvent(null); setLoadError(null); setReloadEvent((value) => value + 1); }}>Try again <ArrowRight size={15} /></button>
              </>
            ) : (
              <>
                <h2>This event has moved on</h2>
                <p>We couldn’t find this activity. Browse the latest opportunities and find another way to get involved.</p>
                <Link href="/upcoming-events" className="cc-button cc-button-small">Explore events <ArrowRight size={15} /></Link>
              </>
            )}
          </div>
        </div>
      </main>
    );
  }

  const participantCount = event.participantCount || 0;
  const eventHasPassed = new Date(event.date).getTime() <= (loadedEvent?.loadedAt || 0);
  const alreadyJoined = Boolean(user && hasJoined(event.id, user.id));
  const relatedEvents = getUpcomingEvents(events.filter((item) => item.id !== event.id)).slice(0, 3);

  const handleJoin = async () => {
    if (eventHasPassed) {
      toast.info("This event has already taken place.");
      return;
    }
    if (!isAuthenticated || !user) {
      router.push(`/login?returnTo=${encodeURIComponent(`/events/${event.id}`)}`);
      return;
    }
    if (event.creatorId === user.id) {
      toast.error("You’re organizing this event — invite others to join you!");
      return;
    }
    if (alreadyJoined) {
      toast.info("You’re already on the list. We can’t wait to see you there!");
      return;
    }
    setJoining(true);
    try {
      await joinEvent(event.id);
      setLoadedEvent((current) => current?.id === params.id && current.event
        ? { ...current, event: { ...current.event, participantCount: (current.event.participantCount || 0) + 1 } }
        : current);
      toast.success(`You're in! We’ll see you at ${event.title}.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to join this event.");
    } finally {
      setJoining(false);
    }
  };

  return (
    <main className="cc-page">
      <div className="cc-container">
        <Link href="/upcoming-events" className="cc-text-link" style={{ marginBottom: 19 }}>
          <ArrowLeft size={15} /> Back to events
        </Link>
        <section className="cc-detail-cover">
          <img src={event.thumbnail} alt={event.title} />
          <div className="cc-detail-cover-label">
            <span className="cc-category-pill">{event.type}</span>
            <h1>{event.title}</h1>
          </div>
        </section>

        <div className="cc-detail-layout">
          <div className="cc-detail-main">
            <div className="cc-detail-facts">
              <div className="cc-detail-fact">
                <span className="cc-fact-icon"><CalendarDays size={17} /></span>
                <span><small>When</small><b>{formatEventDate(event.date)}</b></span>
              </div>
              <div className="cc-detail-fact">
                <span className="cc-fact-icon"><Clock3 size={17} /></span>
                <span><small>Starts at</small><b>{new Date(event.date).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</b></span>
              </div>
              <div className="cc-detail-fact">
                <span className="cc-fact-icon"><MapPin size={17} /></span>
                <span><small>Where</small><b>{event.location}</b></span>
              </div>
            </div>

            <section className="cc-detail-section">
              <h2>A little about this event</h2>
              <p>{event.description}</p>
            </section>
          </div>

          <aside>
            <div className="cc-join-card">
              <h2>There’s room for you.</h2>
              <p>Join neighbors who are giving their time to make this community a little stronger.</p>
              <div className="cc-participants">
                <span><strong>{participantCount} neighbors</strong><small>are already coming</small></span>
              </div>
              <button type="button" className="cc-button" onClick={handleJoin} disabled={joining || eventHasPassed}>
                {eventHasPassed
                  ? "This event has passed"
                  : alreadyJoined
                    ? <><Check size={16} /> You’re going</>
                    : <>Join this event <HeartHandshake size={16} /></>}
              </button>
              <Link href="/joined-events" className="cc-button-secondary">See your joined events</Link>
            </div>
            <div className="cc-organizer-card">
              <span className="cc-organizer-photo">{event.organizerName.charAt(0)}</span>
              <span><small>Hosted by</small><strong>{event.organizerName}</strong></span>
              <a href={`mailto:${event.organizerEmail}`} className="cc-icon-link" aria-label="Email the organizer" style={{ marginLeft: "auto", width: 35, height: 35 }}><Mail size={15} /></a>
            </div>
          </aside>
        </div>

        {relatedEvents.length > 0 && (
          <section className="cc-related">
            <div className="cc-section-head">
              <div>
                <span className="cc-eyebrow">Keep doing good</span>
                <h2 className="cc-heading">A few more ways to help.</h2>
              </div>
              <Link href="/upcoming-events" className="cc-text-link">See all events <ArrowRight size={15} /></Link>
            </div>
            <div className="cc-events-grid">
              {relatedEvents.map((related) => <EventCard key={related.id} event={related} />)}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
