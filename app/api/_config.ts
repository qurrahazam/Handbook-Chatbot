/**
 * Server-only settings for the backend proxy.
 *
 * BACKEND_URL and API_KEY are deliberately NOT NEXT_PUBLIC_*: keeping them
 * unprefixed means they stay on the Vercel server and are never inlined into
 * the browser bundle.
 */

const DEFAULT_BACKEND = "https://qurrah-amrood-labs-hr-api.hf.space";

export const BACKEND_URL = (process.env.BACKEND_URL || DEFAULT_BACKEND).replace(
  /\/+$/,
  "",
);

export const API_KEY = process.env.API_KEY || "";

export const UPSTREAM_TIMEOUT_MS = Number(process.env.UPSTREAM_TIMEOUT_MS ?? 45000);

export const UPSTREAM_HEADERS: Record<string, string> = {
  "Content-Type": "application/json",
  ...(API_KEY ? { "X-API-Key": API_KEY } : {}),
};