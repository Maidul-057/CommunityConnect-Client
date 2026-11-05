"use client";

import Link from "next/link";
import { CalendarDays, MapPin, ArrowUpRight, HeartHandshake } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/components/AuthProvider";
import { useCommunity } from "@/components/CommunityProvider";
import { formatEventDate } from "@/lib/data";

function JoinedEventsContent() {
  const { user } = useAuth();
  const { getJoinedEvents, isAccountDataLoading, accountDataErrors, refreshAccountData } = useCommunity();
  const events = user ? getJoinedEvents(user.id) : [];

  if (isAccountDataLoading) {
    return <div className="cc-empty-state" aria-label="Loading joined events"><h2>Loading your community calendar…</h2><p>We’re gathering the events you’ve joined.</p></div>;
  }

  if (accountDataErrors.joinedEvents) {
    return <div className="cc-empty-state" role="alert"><h2>Your joined events couldn’t load</h2><p>{accountDataErrors.joinedEvents}</p><button type="button" className="cc-button cc-button-small" onClick={() => void refreshAccountData()}>Try again</button></div>;
  }

  if (!events.length) {
    return (
      <div className="cc-empty-state">
        <span className="cc-empty-icon"><HeartHandshake size={23} /></span>
        <h2>Your next story starts with a yes</h2>
        <p>You haven’t joined an event yet. Find a local activity that speaks to you and meet the people making it happen.</p>
        <Link href="/upcoming-events" className="cc-button cc-button-small">Find an event <ArrowUpRight size={15} /></Link>
      </div>
    );
  }

  return (
    <div className="cc-events-grid">
      {events.map((event) => (
        <article className="cc-event-card" key={event.id}>
          <Link href={`/events/${event.id}`} className="cc-event-image-link">
            <img src={event.thumbnail} alt={event.title} className="cc-event-image" />
            <span className="cc-category-pill">{event.type}</span>
            <span className="cc-date-stamp"><b>{new Date(event.date).getDate()}</b><small>{new Date(event.date).toLocaleDateString("en-US", { month: "short" })}</small></span>
          </Link>
          <div className="cc-event-content">
            <h2 className="cc-event-title"><Link href={`/events/${event.id}`}>{event.title}</Link></h2>
            <div className="cc-event-meta" style={{ marginTop: 12 }}>
              <span><MapPin size={14} />{event.location}</span>
              <span><CalendarDays size={14} />{formatEventDate(event.date)}</span>
            </div>
            <div className="cc-event-footer" style={{ marginTop: 18 }}>
              <span className="cc-organizer"><span className="cc-organizer-avatar">{event.organizerName.charAt(0)}</span>See you there!</span>
              <Link href={`/events/${event.id}`} className="cc-icon-link" aria-label={`View ${event.title}`}><ArrowUpRight size={17} /></Link>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

export default function JoinedEventsPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <main className="cc-page">
        <div className="cc-container">
          <header style={{ marginBottom: 30 }}>
            <span className="cc-eyebrow">Good to have you with us</span>
            <h1 className="cc-heading">Your community<br />calendar.</h1>
            <p className="cc-lede">You’re showing up, and that matters. Here’s what you have coming up, {user?.name?.split(" ")[0] || "friend"}.</p>
          </header>
          <JoinedEventsContent />
        </div>
      </main>
    </ProtectedRoute>
  );
}
