import crypto from "crypto";
import type { TripPreferences, TripItinerary } from "@/types";

const COLLECTION = "itinerary_cache";
const TTL_DAYS = 7;
const TTL_MS = TTL_DAYS * 24 * 60 * 60 * 1000;

/**
 * Produces a 20-char hex cache key from trip preferences.
 * Normalises destination casing and sorts interests so that
 * semantically identical requests always map to the same key.
 */
export function hashPreferences(prefs: TripPreferences): string {
  const normalized = JSON.stringify({
    originLocation: prefs.originLocation.toLowerCase().trim(),
    destination: prefs.destination.toLowerCase().trim(),
    startDate: prefs.startDate,
    endDate: prefs.endDate,
    travelers: prefs.travelers,
    budget: prefs.budget,
    interests: [...prefs.interests].sort(),
    dietaryRestrictions: prefs.dietaryRestrictions,
    mobilityConstraints: prefs.mobilityConstraints,
    accommodationType: prefs.accommodationType,
    transportMode: prefs.transportMode,
    departureTime: prefs.departureTime,
    returnTime: prefs.returnTime,
  });
  return crypto.createHash("sha256").update(normalized).digest("hex").slice(0, 20);
}

/**
 * Retrieves a cached itinerary from Firestore, respecting the 7-day TTL.
 * Returns null on any error so the caller always falls through to AI generation.
 */
export async function getCachedItinerary(
  prefs: TripPreferences
): Promise<TripItinerary | null> {
  try {
    const { getAdminDb } = await import("./firebase-admin");
    const db = getAdminDb();
    const key = hashPreferences(prefs);
    const doc = await db.collection(COLLECTION).doc(key).get();
    if (!doc.exists) return null;
    const data = doc.data();
    if (!data?.itinerary) return null;
    const cachedAt = new Date(data.cachedAt as string);
    const ageMs = Date.now() - cachedAt.getTime();
    if (ageMs > TTL_MS) return null;
    return data.itinerary as TripItinerary;
  } catch {
    return null;
  }
}

/**
 * Persists a generated itinerary to Firestore for future cache hits.
 * Silently no-ops on write failure — caching is best-effort.
 */
export async function setCachedItinerary(
  prefs: TripPreferences,
  itinerary: TripItinerary
): Promise<void> {
  try {
    const { getAdminDb } = await import("./firebase-admin");
    const db = getAdminDb();
    const key = hashPreferences(prefs);
    await db.collection(COLLECTION).doc(key).set({
      itinerary,
      cachedAt: new Date().toISOString(),
      destination: prefs.destination,
      travelers: prefs.travelers,
      budget: prefs.budget,
    });
  } catch {
    // Graceful degradation — cache miss is not a failure
  }
}
