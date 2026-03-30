"use client";

import axios, { AxiosError } from "axios";

import { getAccessToken } from "./auth";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

const api = axios.create({
  baseURL,
});

function authHeaders(): Record<string, string> {
  const token = getAccessToken();
  if (!token) return {};
  return {
    Authorization: `Bearer ${token}`,
  };
}

export function getApiBaseUrl() {
  return baseURL;
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await api.get(path, { headers: authHeaders() });
  return res.data as T;
}

export async function apiPost<T>(path: string, body: unknown, formData?: boolean): Promise<T> {
  const headers: Record<string, string> = { ...authHeaders() };
  if (!formData) headers["Content-Type"] = "application/json";

  const res = await api.post(path, body, { headers });
  return res.data as T;
}

export async function apiPostMultipart<T>(path: string, form: FormData): Promise<T> {
  const res = await api.post(path, form, {
    headers: {
      ...authHeaders(),
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data as T;
}

export function normalizeApiError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const e = err as AxiosError<unknown>;
    const responseData = e.response?.data;
    if (responseData !== undefined && responseData !== null) {
      if (typeof responseData === "string") return responseData;
      if (typeof responseData === "object") {
        const maybe = responseData as Record<string, unknown>;
        const detail = maybe["detail"];
        if (typeof detail === "string") return detail;
      }
      return JSON.stringify(responseData);
    }
    return e.message ?? "Request failed";
  }
  if (err instanceof Error) return err.message;
  return String(err);
}

