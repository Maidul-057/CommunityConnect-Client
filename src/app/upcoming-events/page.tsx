"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, Compass, Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { EventCard } from "@/components/EventCard";
import { useCommunity } from "@/components/CommunityProvider";
import { eventTypes, getUpcomingEvents } from "@/lib/data";

export default function UpcomingEventsPage() {
  const { events, isLoading: loading, error } = useCommunity();
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [sortOrder, setSortOrder] = useState("soonest");
  const filteredEvents = useMemo(() => {
    const upcoming = getUpcomingEvents(events).filter((event) => {
      const query = search.trim().toLowerCase();
      const matchesSearch =
        !query ||
        event.title.toLowerCase().includes(query) ||
        event.location.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query);
      const matchesType = selectedType === "All" || event.type === selectedType;
      return matchesSearch && matchesType;
    });

    return sortOrder === "latest"
      ? upcoming.reverse()
      : upcoming;
  }, [events, search, selectedType, sortOrder]);

  return (
    <main className="cc-page">
      <div className="cc-container">
        <section className="cc-page-hero">
          <div className="cc-page-hero-copy">
            <span className="cc-eyebrow">Good things are happening</span>
            <h1>Find your next way<br />to make a difference.</h1>
            <p>From a morning planting trees to an afternoon sharing a meal, the right opportunity is closer than you think.</p>
          </div>
          <span className="cc-page-hero-deco" aria-hidden="true"><Compass size={48} /></span>
        </section>

        <div className="cc-filter-bar">
          <label className="cc-search-wrap">
            <Search size={17} />
            <input
              className="cc-search-input"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search events, places, or causes"
              aria-label="Search events"
            />
          </label>
          <label className="cc-search-wrap">
            <SlidersHorizontal size={16} />
            <select
              className="cc-control"
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value)}
              aria-label="Sort events"
            >
              <option value="soonest">Soonest first</option>
              <option value="latest">Latest first</option>
            </select>
          </label>
          <span className="cc-result-count">{filteredEvents.length} {filteredEvents.length === 1 ? "opportunity" : "opportunities"}</span>
        </div>

        <div className="cc-filter-chips" aria-label="Filter by event category">
          {["All", ...eventTypes].map((type) => (
            <button
              type="button"
              key={type}
              onClick={() => setSelectedType(type)}
              className={selectedType === type ? "cc-filter-chip is-selected" : "cc-filter-chip"}
              aria-pressed={selectedType === type}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="cc-events-grid">
          {loading
            ? Array.from({ length: 6 }, (_, index) => (
              <div className="cc-skeleton" key={index} aria-label="Loading event">
                <div className="cc-skeleton-image" />
                <div className="cc-skeleton-content">
                  <div className="cc-skeleton-line short" />
                  <div className="cc-skeleton-line" />
                  <div className="cc-skeleton-line short" />
                </div>
              </div>
            ))
            : error
              ? <div className="cc-empty-state"><h2>Events are temporarily unavailable</h2><p>{error}</p></div>
              : filteredEvents.length
              ? filteredEvents.map((event) => <EventCard key={event.id} event={event} />)
              : (
                <div className="cc-empty-state">
                  <span className="cc-empty-icon"><CalendarDays size={23} /></span>
                  <h2>No events found</h2>
                  <p>Try a different search or category. You can also be the person who starts the next great community idea.</p>
                  {search || selectedType !== "All" ? (
                    <button
                      type="button"
                      className="cc-button-secondary cc-button-small"
                      onClick={() => { setSearch(""); setSelectedType("All"); }}
                    >
                      Clear filters
                    </button>
                  ) : (
                    <Link href="/create-event" className="cc-button cc-button-small">Create an event <Sparkles size={15} /></Link>
                  )}
                </div>
              )}
        </div>
      </div>
    </main>
  );
}
