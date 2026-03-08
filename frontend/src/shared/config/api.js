const trimTrailingSlash = (value) => String(value || "").replace(/\/+$/, "");

const envApiBase = trimTrailingSlash(import.meta.env.VITE_API_BASE_URL);
const envApiServer = trimTrailingSlash(import.meta.env.VITE_API_SERVER_URL);

// Prefer explicit env vars; fallback supports same-origin deployments.
export const API_BASE_URL = envApiBase || "/api";
export const API_SERVER_URL =
  envApiServer ||
  (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
