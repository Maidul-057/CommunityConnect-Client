"use client";

import { createAuthClient } from "better-auth/react";

const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL;
if (!configuredApiUrl && process.env.NODE_ENV === "production") {
  throw new Error("NEXT_PUBLIC_API_URL must be set to the Express API origin in production.");
}

export const API_BASE_URL = configuredApiUrl || "http://localhost:5000";

export const authClient = createAuthClient({
  fetchOptions: {
    credentials: "include",
  },
});
