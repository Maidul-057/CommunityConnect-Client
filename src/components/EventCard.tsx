import Link from "next/link";
import { ArrowUpRight, CalendarDays, MapPin } from "lucide-react";
import { formatEventDate } from "@/lib/data";
import type { EventItem } from "@/lib/types";

export function EventCard({ event }: { event: EventItem }) {
  const date = new Date(event.date);
  const month = new Intl.DateTimeFormat("en-US", { month: "short" }).format(date);
  const day = new Intl.DateTimeFormat("en-US", { day: "2-digit" }).format(date);

  return (
    <article className="cc-event-card">
      <Link href={`/events/${event.id}`} className="cc-event-image-link" aria-label={`View ${event.title}`}>
        <img src={event.thumbnail} alt={event.title} className="cc-event-image" />
        <span className="cc-category-pill">{event.type}</span>
        <span className="cc-date-stamp"><b>{day}</b><small>{month}</small></span>
      </Link>
      <div className="cc-event-content">
        <div className="cc-event-meta">
          <span><MapPin size={14} />{event.location}</span>
          <span><CalendarDays size={14} />{formatEventDate(event.date)}</span>
        </div>
        <h3 className="cc-event-title"><Link href={`/events/${event.id}`}>{event.title}</Link></h3>
        <p className="cc-event-description">{event.description}</p>
        <div className="cc-event-footer">
          <span className="cc-organizer"><span className="cc-organizer-avatar">{event.organizerName.charAt(0)}</span>{event.organizerName}</span>
          <Link href={`/events/${event.id}`} className="cc-icon-link" aria-label={`View details for ${event.title}`}>
            <ArrowUpRight size={18} />
          </Link>
        </div>
      </div>
    </article>
  );
}
