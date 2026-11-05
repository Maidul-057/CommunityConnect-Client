import { eventTypes } from "@/lib/data";

export type EventFormValues = {
  title: string;
  description: string;
  type: string;
  thumbnail: string;
  location: string;
  date: string;
};

export type EventFormErrors = Partial<Record<keyof EventFormValues, string>>;

export function validateEventFields(values: EventFormValues): EventFormErrors {
  const errors: EventFormErrors = {};
  const title = values.title.trim();
  const description = values.description.trim();
  const location = values.location.trim();

  if (!title || title.length > 100) errors.title = "Title is required and must be at most 100 characters.";
  if (description.length < 25 || description.length > 1200) {
    errors.description = "Description must be between 25 and 1200 characters.";
  }
  if (!eventTypes.includes(values.type as (typeof eventTypes)[number])) {
    errors.type = "Choose a valid event type.";
  }
  if (!location || location.length > 200) errors.location = "Location is required and must be at most 200 characters.";

  const date = new Date(values.date);
  if (!Number.isFinite(date.getTime()) || date.getTime() <= Date.now()) {
    errors.date = "Event date must be in the future.";
  }

  try {
    const imageUrl = new URL(values.thumbnail.trim());
    if (!["http:", "https:"].includes(imageUrl.protocol)) throw new Error();
  } catch {
    errors.thumbnail = "A valid HTTP(S) thumbnail URL is required.";
  }

  return errors;
}
