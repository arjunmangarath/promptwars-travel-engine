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

export function trackTripPlanned(destination: string, budget: string) {
  if (typeof window === "undefined") return;
  initAnalytics().then((a) => {
    if (a) logEvent(a, "trip_planned", { destination, budget });
  });
}

export function trackItineraryViewed(destination: string, days: number) {
  if (typeof window === "undefined") return;
  initAnalytics().then((a) => {
    if (a) logEvent(a, "itinerary_viewed", { destination, days });
  });
}
