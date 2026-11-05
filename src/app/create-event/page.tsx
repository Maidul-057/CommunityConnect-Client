"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, ImagePlus, MapPin, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/components/AuthProvider";
import { useCommunity } from "@/components/CommunityProvider";
import { eventTypes } from "@/lib/data";
import { validateEventFields } from "@/lib/event-validation";
import type { EventType } from "@/lib/types";

type FormFields = {
  title: string;
  description: string;
  type: EventType;
  thumbnail: string;
  location: string;
  date: string;
};

const initialForm: FormFields = {
  title: "",
  description: "",
  type: "Plantation",
  thumbnail: "",
  location: "",
  date: "",
};

function CreateEventForm() {
  const router = useRouter();
  const { user } = useAuth();
  const { addEvent } = useCommunity();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormFields, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  const minDate = useMemo(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  }, []);

  const setField = <K extends keyof FormFields>(field: K, value: FormFields[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const validate = () => {
    const next = validateEventFields(form);
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) {
      toast.error("A couple of details need your attention.");
      return;
    }
    setSubmitting(true);
    try {
      await addEvent({
        ...form,
        date: new Date(form.date).toISOString(),
      });
      toast.success("Your event is ready to make a difference.");
      router.push("/upcoming-events");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "We couldn’t create the event. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <form className="cc-form-layout" onSubmit={handleSubmit} noValidate>
      <section className="cc-form-card">
        <div className="cc-form-card-head">
          <h2>Tell us about your initiative</h2>
          <p>Make it easy for neighbors to picture themselves there.</p>
        </div>
        <div className="cc-form-fields">
          <div className="cc-field cc-field-full">
            <label htmlFor="event-title">Event title</label>
            <input id="event-title" className="cc-control" value={form.title} maxLength={100} onChange={(event) => setField("title", event.target.value)} placeholder="e.g. Green the City, One Tree at a Time" aria-invalid={Boolean(errors.title)} />
            {errors.title && <span className="cc-form-error">{errors.title}</span>}
          </div>
          <div className="cc-field">
            <label htmlFor="event-category">Category</label>
            <select id="event-category" className="cc-control" value={form.type} onChange={(event) => setField("type", event.target.value as EventType)}>
              {eventTypes.map((type) => <option key={type}>{type}</option>)}
            </select>
          </div>
          <div className="cc-field">
            <label htmlFor="event-date">Date and time</label>
            <div className="cc-field-input">
              <CalendarDays size={16} />
              <input id="event-date" type="datetime-local" min={minDate} value={form.date} onChange={(event) => setField("date", event.target.value)} />
            </div>
            {errors.date && <span className="cc-form-error">{errors.date}</span>}
          </div>
          <div className="cc-field cc-field-full">
            <label htmlFor="event-location">Meeting point</label>
            <div className="cc-field-input">
              <MapPin size={16} />
              <input id="event-location" value={form.location} onChange={(event) => setField("location", event.target.value)} placeholder="Park, neighborhood, or community space" />
            </div>
            {errors.location && <span className="cc-form-error">{errors.location}</span>}
          </div>
          <div className="cc-field cc-field-full">
            <label htmlFor="event-image">Cover image URL</label>
            <div className="cc-field-input">
              <ImagePlus size={16} />
              <input id="event-image" type="url" value={form.thumbnail} onChange={(event) => setField("thumbnail", event.target.value)} placeholder="https://..." />
            </div>
            {errors.thumbnail && <span className="cc-form-error">{errors.thumbnail}</span>}
          </div>
          <div className="cc-field cc-field-full">
            <label htmlFor="event-description">What will you do together?</label>
            <textarea id="event-description" value={form.description} maxLength={1200} onChange={(event) => setField("description", event.target.value)} placeholder="Share the purpose, what volunteers can expect, and anything they should bring." />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
              {errors.description ? <span className="cc-form-error" style={{ margin: 0 }}>{errors.description}</span> : <span />}
              <span style={{ color: "var(--subtle)", fontSize: 10 }}>{form.description.length}/1200</span>
            </div>
          </div>
        </div>
        <button type="submit" className="cc-button" style={{ marginTop: 22 }} disabled={submitting}>
          {submitting ? "Creating your event…" : "Create event"} <Send size={15} />
        </button>
      </section>

      <aside className="cc-preview-card">
        <div className="cc-preview-image">
          {form.thumbnail ? (
            <img src={form.thumbnail} alt="Preview of event cover" onError={(event) => { event.currentTarget.style.visibility = "hidden"; }} />
          ) : (
            <div style={{ display: "grid", height: "100%", placeItems: "center", color: "var(--subtle)" }}>
              <ImagePlus size={28} />
            </div>
          )}
        </div>
        <div className="cc-preview-copy">
          <span className="cc-category-pill" style={{ position: "static", display: "inline-flex" }}>{form.type}</span>
          <h3>{form.title || "Your event title"}</h3>
          <p>{form.location || "Your meeting point"}{form.date ? ` · ${new Date(form.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}` : ""}</p>
          <p style={{ marginTop: 10 }}>{form.description || "A little preview of the good you’re bringing to your community."}</p>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, color: "var(--forest)", fontSize: 10, fontWeight: 700 }}>
            <Sparkles size={14} /> Hosted by {user?.name || "you"}
          </div>
        </div>
      </aside>
    </form>
  );
}

export default function CreateEventPage() {
  return (
    <ProtectedRoute>
      <main className="cc-page">
        <div className="cc-container">
          <header style={{ marginBottom: 27 }}>
            <span className="cc-eyebrow">Start something good</span>
            <h1 className="cc-heading">Bring your idea<br />to the neighborhood.</h1>
            <p className="cc-lede">A simple invitation can bring people together. Tell your community what you have in mind.</p>
          </header>
          <CreateEventForm />
        </div>
      </main>
    </ProtectedRoute>
  );
}
