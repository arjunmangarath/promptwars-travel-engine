/**
 * Centralised environment variable access with validation.
 * Logs a warning (not a crash) for missing optional vars so the
 * application can still start in development without all vars set.
 */

import { logWarn } from "./logger";

function requireEnv(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (!value) {
    logWarn(`Environment variable ${key} is not set`, { key });
  }
  return value ?? "";
}

/** Validated, typed access to all environment variables used by the server. */
export const env = {
  /** Google Cloud project ID — used for Vertex AI and Firebase Admin. */
  googleCloudProject: requireEnv("GOOGLE_CLOUD_PROJECT", "promptwars-live"),

  /** Gemini API key — used as a fallback when Vertex AI ADC is not available. */
  geminiApiKey: process.env.GEMINI_API_KEY ?? null,

  /** Firebase project ID for Firestore and Analytics. */
  firebaseProjectId: requireEnv(
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    "promptwars-live"
  ),

  /** Firebase public API key for client-side Analytics init. */
  firebaseApiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? null,

  /** Node environment — "production" on Cloud Run, "development" locally. */
  nodeEnv: process.env.NODE_ENV ?? "development",

  /** True when running in a production Cloud Run environment. */
  isProduction: process.env.NODE_ENV === "production",
} as const;
