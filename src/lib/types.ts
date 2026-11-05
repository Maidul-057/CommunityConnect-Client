export type EventType =
  | "Cleanup"
  | "Plantation"
  | "Donation"
  | "Blood Donation"
  | "Food Distribution"
  | "Education"
  | "Health Camp"
  | "Workshop";

export type EventItem = {
  id: string;
  title: string;
  description: string;
  type: EventType;
  thumbnail: string;
  location: string;
  date: string;
  organizerName: string;
  organizerEmail: string;
  creatorId: string;
  createdAt: string;
  participantCount?: number;
};

export type User = {
  id: string;
  name: string;
  email: string;
  photoUrl?: string;
};

export type JoinedEvent = {
  id: string;
  userId: string;
  eventId: string;
  joinedAt: string;
};
