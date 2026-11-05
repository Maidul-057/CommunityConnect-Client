"use client";

import { API_BASE_URL } from "@/lib/auth-client";

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export async function refreshAccessToken() {
  accessToken = null;
  try {
    const response = await fetch("/api/auth/token", {
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error("Your session expired. Please sign in again.");
    }
    const result: unknown = await response.json();
    const token = result && typeof result === "object" && "token" in result
      ? result.token
      : undefined;
    if (typeof token !== "string" || !token.trim()) {
      throw new Error("The authentication server did not return an access token.");
    }
    accessToken = token.trim();
  } catch (error) {
    accessToken = null;
    throw error;
  }
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  let response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  if (response.status === 401 && accessToken) {
    await refreshAccessToken();
    headers.set("Authorization", `Bearer ${accessToken}`);
    response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  }
  if (response.status === 204) return undefined as T;

  const result = (await response.json().catch(() => null)) as { message?: string } | T | null;
  if (!response.ok) {
    const message = result && typeof result === "object" && "message" in result
      ? result.message
      : "The request could not be completed.";
    throw new Error(typeof message === "string" ? message : "The request could not be completed.");
  }
  if (result === null) throw new Error("The server returned an invalid response.");
  return result as T;
}
