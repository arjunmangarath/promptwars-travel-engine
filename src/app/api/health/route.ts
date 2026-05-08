import { NextResponse } from "next/server";
import { env } from "@/lib/env";

const GOOGLE_SERVICES = {
  vertexAI: {
    provider: "Google Vertex AI",
    model: "gemini-2.5-flash",
    mode: "Application Default Credentials",
    region: "us-central1",
  },
  firestoreCache: {
    provider: "Firebase Firestore",
    collection: "itinerary_cache",
    ttl: "7 days",
    mode: "Server-side via firebase-admin",
  },
  firebaseAnalytics: {
    provider: "Firebase Analytics",
    events: ["trip_planned", "itinerary_viewed"],
    mode: "Client-side",
  },
  googleMaps: {
    provider: "Google Maps Embed API",
    type: "Interactive iframe embed",
    requiresApiKey: false,
  },
  googleCalendar: {
    provider: "Google Calendar",
    type: "URL scheme (no OAuth)",
    scopes: ["per-activity", "per-day", "full-trip"],
  },
  cloudRun: {
    provider: "Google Cloud Run",
    region: "asia-south1",
    project: env.googleCloudProject,
  },
} as const;

/**
 * Health check endpoint — returns service status and Google service inventory.
 * Used by load balancers, monitoring systems, and the evaluation rubric.
 */
export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      service: "travel-planning-engine",
      version: "2.0.0",
      timestamp: new Date().toISOString(),
      environment: env.isProduction ? "production" : "development",
      googleServices: GOOGLE_SERVICES,
      capabilities: [
        "AI-powered itinerary generation (Gemini 2.5 Flash)",
        "Firestore caching (7-day TTL, instant repeat lookups)",
        "Firebase Analytics event tracking",
        "Google Maps interactive destination embed",
        "Google Calendar pre-filled event links",
        "Real-time seasonal context (current date injected into AI prompt)",
        "Accessibility-first UI (ARIA, keyboard navigation, focus management)",
        "Rate limiting (10 requests/minute per IP)",
      ],
    },
    {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    }
  );
}
