"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { User } from "@/lib/types";
import { authClient } from "@/lib/auth-client";
import { apiFetch, refreshAccessToken, setAccessToken } from "@/lib/api";

type LoginPayload = {
  email: string;
  password: string;
};

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  photoUrl?: string;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  updateProfile: (payload: { name: string; photoUrl?: string }) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGitHub: (callbackURL?: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function assertAuthSuccess(result: { error?: { message?: string } | null }) {
  if (result.error) throw new Error(result.error.message || "Authentication failed. Please try again.");
}

async function loadCurrentUser() {
  const result = await authClient.getSession();
  assertAuthSuccess(result);
  if (!result.data?.user) {
    setAccessToken(null);
    return null;
  }
  await refreshAccessToken();
  return apiFetch<User>("/api/profile");
}

function validateCredentials(email: string, password: string) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter a valid email address.");
  if (!password) throw new Error("Password is required.");
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let active = true;
    loadCurrentUser()
      .then((currentUser) => {
        if (active) setUser(currentUser);
      })
      .catch((error: unknown) => {
        setAccessToken(null);
        console.error("Unable to restore the authentication session:", error);
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setIsReady(true);
      });

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async ({ email, password }: LoginPayload) => {
    validateCredentials(email, password);
    const result = await authClient.signIn.email({ email, password });
    assertAuthSuccess(result);
    const currentUser = await loadCurrentUser();
    if (!currentUser) throw new Error("The server did not create an authenticated session.");
    setUser(currentUser);
  }, []);

  const register = useCallback(async ({ name, email, password, photoUrl }: RegisterPayload) => {
    validateCredentials(email, password);
    if (name.trim().length < 2 || name.trim().length > 80) {
      throw new Error("Please enter a name between 2 and 80 characters.");
    }
    if (password.length < 6 || !/[A-Z]/.test(password) || !/[a-z]/.test(password)) {
      throw new Error("Password must contain at least 6 characters, including an uppercase and a lowercase letter.");
    }
    if (photoUrl?.trim()) {
      try {
        const imageUrl = new URL(photoUrl.trim());
        if (photoUrl.length > 2048 || !["http:", "https:"].includes(imageUrl.protocol)) throw new Error();
      } catch {
        throw new Error("Enter a valid HTTP(S) photo URL.");
      }
    }

    const result = await authClient.signUp.email({
      name: name.trim(),
      email,
      password,
      image: photoUrl || undefined,
    });
    assertAuthSuccess(result);
    const currentUser = await loadCurrentUser();
    if (!currentUser) throw new Error("The server did not create an authenticated session.");
    setUser(currentUser);
  }, []);

  const updateProfile = useCallback(async ({ name, photoUrl }: { name: string; photoUrl?: string }) => {
    const updatedUser = await apiFetch<User>("/api/profile", {
      method: "PATCH",
      body: JSON.stringify({ name, photoUrl: photoUrl ?? null }),
    });
    setUser(updatedUser);
  }, []);

  const logout = useCallback(async () => {
    const result = await authClient.signOut();
    assertAuthSuccess(result);
    setAccessToken(null);
    setUser(null);
  }, []);

  const loginWithGitHub = useCallback(async (callbackURL?: string) => {
    const result = await authClient.signIn.social({
      provider: "github",
      callbackURL: callbackURL || window.location.origin,
    });
    assertAuthSuccess(result);
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isReady,
      login,
      register,
      updateProfile,
      logout,
      loginWithGitHub,
    }),
    [user, isReady, login, register, updateProfile, logout, loginWithGitHub],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
