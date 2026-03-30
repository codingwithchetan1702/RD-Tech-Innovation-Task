"use client";

export const TOKEN_KEYS = {
  access: "access_token",
  refresh: "refresh_token",
} as const;

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEYS.access);
}

export function setTokens(tokens: { access: string; refresh?: string }) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEYS.access, tokens.access);
  if (tokens.refresh) window.localStorage.setItem(TOKEN_KEYS.refresh, tokens.refresh);
}

export function clearTokens() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEYS.access);
  window.localStorage.removeItem(TOKEN_KEYS.refresh);
}

