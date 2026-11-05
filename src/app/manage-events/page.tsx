"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, CalendarDays, Edit3, MapPin, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useCommunity } from "@/components/CommunityProvider";
import { eventTypes, formatEventDate } from "@/lib/data";
import { validateEventFields } from "@/lib/event-validation";
import type { EventItem, EventType } from "@/lib/types";

function toLocalDateTime(value: string) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

function ManageEventsContent() {
  const { myEvents, updateEvent, deleteEvent, isAccountDataLoading, accountDataErrors, refreshAccountData } = useCommunity();
  const [editing, setEditing] = useState<EventItem | null>(null);
  const [deleting, setDeleting] = useState<EventItem | null>(null);
  const [saving, setSaving] = useState(false);

  const sortedEvents = useMemo(
    () => [...myEvents].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [myEvents],
  );

  const saveEdit = async (event: EventItem) => {
    const validationErrors = validateEventFields(event);
    if (Object.keys(validationErrors).length > 0) {
      toast.error(Object.values(validationErrors)[0]);
      return;
    }
    setSaving(true);
    try {
      await updateEvent(event);
      setEditing(null);
      toast.success("Your event details have been updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update this event.");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await deleteEvent(deleting.id);
      toast.success("The event has been removed.");
      setDeleting(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to remove this event.");
    }
  };

  return (
    <>
      <header className="cc-page-hero">
        <div className="cc-page-hero-copy">
          <span className="cc-eyebrow">Your initiatives</span>
          <h1>Good ideas grow<br />when you bring people in.</h1>
          <p>Keep your event details up to date and see how many neighbors are joining you.</p>
        </div>
        <Link href="/create-event" className="cc-button" style={{ position: "absolute", right: 36, bottom: 34 }}>
          <Plus size={17} /> Create an event
        </Link>
      </header>

      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 16, marginBottom: 12 }}>
        <h2 style={{ margin: 0, fontSize: 20, letterSpacing: "-.04em" }}>Events you’re hosting</h2>
        <span className="cc-result-count">
          {isAccountDataLoading ? "Loading…" : accountDataErrors.myEvents ? "Unavailable" : `${sortedEvents.length} ${sortedEvents.length === 1 ? "event" : "events"}`}
        </span>
      </div>

      {isAccountDataLoading ? (
        <div className="cc-empty-state" aria-label="Loading hosted events"><h2>Loading your initiatives…</h2><p>We’re gathering the events you’re hosting.</p></div>
      ) : accountDataErrors.myEvents ? (
        <div className="cc-empty-state" role="alert"><h2>Your events couldn’t load</h2><p>{accountDataErrors.myEvents}</p><button type="button" className="cc-button cc-button-small" onClick={() => void refreshAccountData()}>Try again</button></div>
      ) : sortedEvents.length ? (
        <div className="cc-management-list">
          {sortedEvents.map((event) => (
            <article key={event.id} className="cc-manage-card">
              <img src={event.thumbnail} alt={event.title} />
              <div className="cc-manage-info">
                <span className="cc-category-pill" style={{ position: "static", display: "inline-flex" }}>{event.type}</span>
                <h3>{event.title}</h3>
                <div className="cc-manage-meta">
                  <span><CalendarDays size={13} />{formatEventDate(event.date)}</span>
                  <span><MapPin size={13} />{event.location}</span>
                  <span>{event.participantCount || 0} joined</span>
                </div>
              </div>
              <div className="cc-manage-actions">
                <Link className="cc-action-button" href={`/events/${event.id}`} aria-label={`View ${event.title}`} title="View event"><ArrowUpRight size={16} /></Link>
                <button type="button" className="cc-action-button" onClick={() => setEditing({ ...event })} aria-label={`Edit ${event.title}`} title="Edit event"><Edit3 size={15} /></button>
                <button type="button" className="cc-action-button danger" onClick={() => setDeleting(event)} aria-label={`Delete ${event.title}`} title="Delete event"><Trash2 size={15} /></button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="cc-empty-state">
          <span className="cc-empty-icon"><CalendarDays size={23} /></span>
          <h2>Your next great idea starts here</h2>
          <p>You haven’t created an event yet. Invite your neighbors to make something better together.</p>
          <Link href="/create-event" className="cc-button cc-button-small"><Plus size={15} /> Create your first event</Link>
        </div>
      )}

      {editing && (
        <div className="cc-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditing(null); }}>
          <form
            className="cc-modal"
            onSubmit={(event) => { event.preventDefault(); saveEdit(editing); }}
            aria-labelledby="edit-event-title"
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 id="edit-event-title">Edit your event</h2>
              <button type="button" className="cc-action-button" onClick={() => setEditing(null)} aria-label="Close dialog"><X size={16} /></button>
            </div>
            <p>Update the details so your neighbors know what to expect.</p>
            <div className="cc-form-fields" style={{ gridTemplateColumns: "1fr" }}>
              <div className="cc-field"><label htmlFor="edit-title">Event title</label><input id="edit-title" className="cc-control" value={editing.title} onChange={(event) => setEditing({ ...editing, title: event.target.value })} /></div>
              <div className="cc-field"><label htmlFor="edit-category">Category</label><select id="edit-category" className="cc-control" value={editing.type} onChange={(event) => setEditing({ ...editing, type: event.target.value as EventType })}>{eventTypes.map((type) => <option key={type}>{type}</option>)}</select></div>
              <div className="cc-field"><label htmlFor="edit-location">Location</label><input id="edit-location" className="cc-control" value={editing.location} onChange={(event) => setEditing({ ...editing, location: event.target.value })} /></div>
              <div className="cc-field"><label htmlFor="edit-date">Date and time</label><input id="edit-date" type="datetime-local" required className="cc-control" value={toLocalDateTime(editing.date)} onChange={(event) => setEditing({ ...editing, date: event.target.value ? new Date(event.target.value).toISOString() : "" })} /></div>
              <div className="cc-field"><label htmlFor="edit-image">Cover image URL</label><input id="edit-image" className="cc-control" value={editing.thumbnail} onChange={(event) => setEditing({ ...editing, thumbnail: event.target.value })} /></div>
              <div className="cc-field"><label htmlFor="edit-description">Description</label><textarea id="edit-description" value={editing.description} onChange={(event) => setEditing({ ...editing, description: event.target.value })} /></div>
            </div>
            <div className="cc-modal-actions" style={{ marginTop: 21 }}>
              <button type="button" className="cc-button-secondary cc-button-small" onClick={() => setEditing(null)}>Cancel</button>
              <button type="submit" className="cc-button cc-button-small" disabled={saving}>{saving ? "Saving…" : "Save changes"}</button>
            </div>
          </form>
        </div>
      )}

      {deleting && (
        <div className="cc-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setDeleting(null); }}>
          <div className="cc-modal" role="dialog" aria-modal="true" aria-labelledby="delete-event-title">
            <h2 id="delete-event-title">Remove this event?</h2>
            <p><strong>{deleting.title}</strong> will be removed, along with its local participant list. This can’t be undone.</p>
            <div className="cc-modal-actions">
              <button type="button" className="cc-button-secondary cc-button-small" onClick={() => setDeleting(null)}>Keep event</button>
              <button type="button" className="cc-button cc-button-small" style={{ background: "#b94135", borderColor: "#b94135" }} onClick={confirmDelete}>Yes, remove it</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function ManageEventsPage() {
  return (
    <ProtectedRoute>
      <main className="cc-page">
        <div className="cc-container"><ManageEventsContent /></div>
      </main>
    </ProtectedRoute>
  );
}
