"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useSyncExternalStore } from "react";

const STORAGE_KEY = "community-connect-theme";
const CHANGE_EVENT = "community-connect-theme-change";

function getThemeSnapshot() {
  if (typeof window === "undefined") return false;
  const savedTheme = window.localStorage.getItem(STORAGE_KEY);
  return savedTheme ? savedTheme === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function subscribeTheme(listener: () => void) {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  window.addEventListener("storage", listener);
  window.addEventListener(CHANGE_EVENT, listener);
  mediaQuery.addEventListener("change", listener);
  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener(CHANGE_EVENT, listener);
    mediaQuery.removeEventListener("change", listener);
  };
}

export function ThemeToggle() {
  const darkMode = useSyncExternalStore(subscribeTheme, getThemeSnapshot, () => false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const toggleTheme = () => {
    const nextMode = !darkMode;
    window.localStorage.setItem(STORAGE_KEY, nextMode ? "dark" : "light");
    document.documentElement.classList.toggle("dark", nextMode);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  };

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      aria-pressed={darkMode}
      title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggleTheme}
      className="cc-theme-toggle"
    >
      {darkMode ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
