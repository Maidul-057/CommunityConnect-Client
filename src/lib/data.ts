import type { EventItem, EventType } from "./types";

export const eventTypes: EventType[] = [
  "Cleanup",
  "Plantation",
  "Donation",
  "Blood Donation",
  "Food Distribution",
  "Education",
  "Health Camp",
  "Workshop",
];

export const communityGallery = [
  {
    src: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=1200&q=85",
    label: "Neighbors showing up for neighbors",
    className: "gallery-tall",
  },
  {
    src: "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=900&q=85",
    label: "Planting a greener future",
    className: "",
  },
  {
    src: "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=900&q=85",
    label: "Sharing nourishing meals",
    className: "",
  },
  {
    src: "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=900&q=85",
    label: "Caring for shared spaces",
    className: "gallery-wide",
  },
];

export const platformFeatures = [
  {
    title: "Discover an Event",
    description: "Find a local cause that feels right for you and see exactly how you can help.",
  },
  {
    title: "Join the Community",
    description: "Meet good people, share your skills, and make every hour of volunteering count.",
  },
  {
    title: "Make an Impact",
    description: "Turn small acts into lasting change for the places and people around you.",
  },
];

export function getUpcomingEvents(events: EventItem[] = []) {
  return [...events]
    .filter((event) => new Date(event.date).getTime() > Date.now())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function formatEventDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}
