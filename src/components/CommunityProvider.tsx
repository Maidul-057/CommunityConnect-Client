"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { apiFetch } from "@/lib/api";
import type { EventItem, EventType, JoinedEvent } from "@/lib/types";
import { useAuth } from "@/components/AuthProvider";

type NewEvent = {
  title: string;
  description: string;
  type: EventType;
  thumbnail: string;
  location: string;
  date: string;
};

type CommunityContextValue = {
  events: EventItem[];
  myEvents: EventItem[];
  joins: JoinedEvent[];
  isLoading: boolean;
  error: string | null;
  isAccountDataLoading: boolean;
  accountDataError: string | null;
  accountDataErrors: { joins: string | null; joinedEvents: string | null; myEvents: string | null };
  refreshAccountData: () => Promise<void>;
  addEvent: (event: NewEvent) => Promise<EventItem>;
  updateEvent: (event: EventItem) => Promise<EventItem>;
  deleteEvent: (eventId: string) => Promise<void>;
  joinEvent: (eventId: string) => Promise<boolean>;
  getJoinedEvents: (userId: string) => EventItem[];
  hasJoined: (eventId: string, userId: string) => boolean;
  refreshEvents: () => Promise<void>;
};

const CommunityContext = createContext<CommunityContextValue | undefined>(undefined);

export function CommunityProvider({ children }: { children: ReactNode }) {
  const { user, isReady: authReady } = useAuth();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [myEvents, setMyEvents] = useState<EventItem[]>([]);
  const [joins, setJoins] = useState<JoinedEvent[]>([]);
  const [joinedEvents, setJoinedEvents] = useState<EventItem[]>([]);
  const [loadedUserId, setLoadedUserId] = useState<string | null>(null);
  const [accountDataError, setAccountDataError] = useState<string | null>(null);
  const [accountDataErrors, setAccountDataErrors] = useState({ joins: null as string | null, joinedEvents: null as string | null, myEvents: null as string | null });
  const [isAccountDataRequestLoading, setIsAccountDataLoading] = useState(false);
  const isAccountDataLoading = isAccountDataRequestLoading || Boolean(authReady && user && user.id !== loadedUserId);
  const accountDataSnapshot = useRef({ loadedUserId, joins, joinedEvents, myEvents });
  const accountRequest = useRef<{ userId: string; promise: Promise<void> } | null>(null);
  const queuedAccountRefresh = useRef<Promise<void> | null>(null);
  const joinRequests = useRef(new Map<string, Promise<boolean>>());
  const mounted = useRef(false);
  const currentUserId = useRef<string | null>(user?.id ?? null);
  const refreshAccountDataRef = useRef<() => Promise<void>>(() => Promise.resolve());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const visibleJoins = useMemo(() => user?.id === loadedUserId ? joins : [], [joins, loadedUserId, user?.id]);
  const visibleJoinedEvents = useMemo(
    () => user?.id === loadedUserId ? joinedEvents : [],
    [joinedEvents, loadedUserId, user?.id],
  );
  const visibleMyEvents = useMemo(() => user?.id === loadedUserId ? myEvents : [], [loadedUserId, myEvents, user?.id]);

  useEffect(() => {
    currentUserId.current = user?.id ?? null;
    accountDataSnapshot.current = { loadedUserId, joins, joinedEvents, myEvents };
  }, [user?.id, loadedUserId, joins, joinedEvents, myEvents]);

  const refreshEvents = useCallback(async () => {
    try {
      const currentEvents = await apiFetch<EventItem[]>("/api/events");
      setEvents(currentEvents);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load events.");
      throw loadError;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshAccountData = useCallback(() => {
    if (!authReady) return Promise.resolve();
    if (!user) {
      return Promise.resolve().then(() => {
        if (!mounted.current || currentUserId.current !== null) return;
        setJoins([]);
        setJoinedEvents([]);
        setMyEvents([]);
        setLoadedUserId(null);
        setAccountDataError(null);
        setAccountDataErrors({ joins: null, joinedEvents: null, myEvents: null });
        setIsAccountDataLoading(false);
      });
    }
    if (accountRequest.current?.userId === user.id) {
      if (!queuedAccountRefresh.current) {
        queuedAccountRefresh.current = accountRequest.current.promise.then(() => {
          queuedAccountRefresh.current = null;
          return currentUserId.current === user.id ? refreshAccountDataRef.current() : undefined;
        });
      }
      return queuedAccountRefresh.current;
    }

    const userId = user.id;
    setIsAccountDataLoading(true);
    setAccountDataError(null);
    setAccountDataErrors({ joins: null, joinedEvents: null, myEvents: null });
    const request = (async () => {
      const results = await Promise.allSettled([
        apiFetch<JoinedEvent[]>("/api/me/joins"),
        apiFetch<EventItem[]>("/api/joined-events"),
        apiFetch<EventItem[]>("/api/me/events"),
      ]);
      if (!mounted.current || currentUserId.current !== userId) return;

      const [joinResult, joinedResult, ownedResult] = results;
      const snapshot = accountDataSnapshot.current;
      const sameUserDataLoaded = snapshot.loadedUserId === userId;
      setJoins(joinResult.status === "fulfilled" ? joinResult.value : sameUserDataLoaded ? snapshot.joins : []);
      setJoinedEvents(joinedResult.status === "fulfilled" ? joinedResult.value : sameUserDataLoaded ? snapshot.joinedEvents : []);
      setMyEvents(ownedResult.status === "fulfilled" ? ownedResult.value : sameUserDataLoaded ? snapshot.myEvents : []);
      setLoadedUserId(userId);

      const failureMessage = (result: PromiseSettledResult<unknown>) => result.status === "rejected"
        ? result.reason instanceof Error ? result.reason.message : "Request failed."
        : null;
      const errors = {
        joins: failureMessage(joinResult),
        joinedEvents: failureMessage(joinedResult),
        myEvents: failureMessage(ownedResult),
      };
      setAccountDataErrors(errors);
      const failures = Object.values(errors).filter(Boolean);
      setAccountDataError(failures.length ? `Some account data could not be loaded (${failures.join("; ")}).` : null);
    })().catch((loadError: unknown) => {
      if (mounted.current && currentUserId.current === userId) {
        setJoins([]);
        setJoinedEvents([]);
        setMyEvents([]);
        setLoadedUserId(userId);
        setAccountDataError(loadError instanceof Error ? loadError.message : "Unable to load your community activity.");
        setAccountDataErrors({ joins: "Unable to load join records.", joinedEvents: "Unable to load joined events.", myEvents: "Unable to load managed events." });
      }
    }).finally(() => {
      if (mounted.current && currentUserId.current === userId) setIsAccountDataLoading(false);
      if (accountRequest.current?.promise === request) accountRequest.current = null;
    });
    accountRequest.current = { userId, promise: request };
    return request;
  }, [authReady, user]);

  useEffect(() => {
    refreshAccountDataRef.current = refreshAccountData;
  }, [refreshAccountData]);

  useEffect(() => {
    let active = true;
    apiFetch<EventItem[]>("/api/events")
      .then((currentEvents) => {
        if (!active) return;
        setEvents(currentEvents);
        setError(null);
      })
      .catch((loadError: unknown) => {
        console.error("Unable to load community events:", loadError);
        if (active) setError(loadError instanceof Error ? loadError.message : "Unable to load events.");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    if (!authReady) return;
    if (!user) {
      void refreshAccountData();
      return;
    }
    void refreshAccountData();
  }, [authReady, user, refreshAccountData]);

  const addEvent = useCallback(async (event: NewEvent) => {
    const created = await apiFetch<EventItem>("/api/events", {
      method: "POST",
      body: JSON.stringify(event),
    });
    setEvents((current) => [...current, created].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    setMyEvents((current) => [...current, created].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    void refreshAccountData();
    return created;
  }, [refreshAccountData]);

  const updateEvent = useCallback(async (event: EventItem) => {
    const updated = await apiFetch<EventItem>(`/api/events/${encodeURIComponent(event.id)}`, {
      method: "PATCH",
      body: JSON.stringify(event),
    });
    setEvents((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    setMyEvents((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    setJoinedEvents((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    void refreshAccountData();
    return updated;
  }, [refreshAccountData]);

  const deleteEvent = useCallback(async (eventId: string) => {
    await apiFetch<void>(`/api/events/${encodeURIComponent(eventId)}`, { method: "DELETE" });
    setEvents((current) => current.filter((event) => event.id !== eventId));
    setMyEvents((current) => current.filter((event) => event.id !== eventId));
    setJoinedEvents((current) => current.filter((event) => event.id !== eventId));
    setJoins((current) => current.filter((join) => join.eventId !== eventId));
    void refreshAccountData();
  }, [refreshAccountData]);

  const joinEvent = useCallback(async (eventId: string) => {
    const existingRequest = joinRequests.current.get(eventId);
    if (existingRequest) return existingRequest;
    const request = (async () => {
      const join = await apiFetch<JoinedEvent>(`/api/events/${encodeURIComponent(eventId)}/join`, {
        method: "POST",
      });
      setJoins((current) => current.some((item) => item.eventId === eventId && item.userId === join.userId)
        ? current
        : [...current, join]);
      try {
        const updatedEvent = await apiFetch<EventItem>(`/api/events/${encodeURIComponent(eventId)}`);
        setEvents((current) => current.map((event) => (event.id === eventId ? updatedEvent : event)));
        setJoinedEvents((current) => current.some((event) => event.id === eventId)
          ? current.map((event) => (event.id === eventId ? updatedEvent : event))
          : [...current, updatedEvent].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
      } catch (refreshError) {
        console.error("Join succeeded, but event details could not be refreshed:", refreshError);
      }
      await refreshAccountData();
      return true;
    })();
    joinRequests.current.set(eventId, request);
    try {
      return await request;
    } finally {
      if (joinRequests.current.get(eventId) === request) joinRequests.current.delete(eventId);
    }
  }, [refreshAccountData]);

  const getJoinedEvents = useCallback(
    (userId: string) => (user?.id === userId ? visibleJoinedEvents : []),
    [visibleJoinedEvents, user?.id],
  );

  const hasJoined = useCallback(
    (eventId: string, userId: string) => visibleJoins.some((join) => join.eventId === eventId && join.userId === userId)
      || visibleJoinedEvents.some((event) => event.id === eventId),
    [visibleJoins, visibleJoinedEvents],
  );

  const value = useMemo(
    () => ({
      events,
      myEvents: visibleMyEvents,
      joins: visibleJoins,
      isLoading,
      error,
      isAccountDataLoading,
      accountDataError,
      accountDataErrors,
      refreshAccountData,
      addEvent,
      updateEvent,
      deleteEvent,
      joinEvent,
      getJoinedEvents,
      hasJoined,
      refreshEvents,
    }),
    [events, visibleMyEvents, visibleJoins, isLoading, error, isAccountDataLoading, accountDataError, accountDataErrors, refreshAccountData, addEvent, updateEvent, deleteEvent, joinEvent, getJoinedEvents, hasJoined, refreshEvents],
  );

  return <CommunityContext.Provider value={value}>{children}</CommunityContext.Provider>;
}

export function useCommunity() {
  const context = useContext(CommunityContext);
  if (!context) throw new Error("useCommunity must be used within a CommunityProvider");
  return context;
}
