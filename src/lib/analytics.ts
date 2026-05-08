"use client";

import { initializeApp, getApps } from "firebase/app";
import { getAnalytics, logEvent, Analytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "promptwars-live"}.firebaseapp.com`,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "promptwars-live",
  storageBucket: `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "promptwars-live"}.appspot.com`,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let analytics: Analytics | null = null;

/**
 * Lazily initialises Firebase Analytics on first call.
 * Returns null when called server-side or when the browser blocks analytics
 * (e.g. ad blockers, Safari ITP). All callers handle null gracefully.
 */
export async function initAnalytics(): Promise<Analytics | null> {
  if (typeof window === "undefined") return null;
  try {
    if (!getApps().length) initializeApp(firebaseConfig);
    const { isSupported } = await import("firebase/analytics");
    const supported = await isSupported();
    if (!supported) return null;
    analytics = getAnalytics();
    return analytics;
  } catch {
    return null;
  }
}

/**
 * Fires a `trip_planned` event with destination and budget tier.
 * No-ops server-side or when analytics is unavailable.
 */
export function trackTripPlanned(destination: string, budget: string): void {
  if (typeof window === "undefined") return;
  initAnalytics().then((a) => {
    if (a) logEvent(a, "trip_planned", { destination, budget });
  });
}

/**
 * Fires an `itinerary_viewed` event with destination and number of days.
 * No-ops server-side or when analytics is unavailable.
 */
export function trackItineraryViewed(destination: string, days: number): void {
  if (typeof window === "undefined") return;
  initAnalytics().then((a) => {
    if (a) logEvent(a, "itinerary_viewed", { destination, days });
  });
}
