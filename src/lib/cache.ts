import crypto from "crypto";
import type { TripPreferences, TripItinerary } from "@/types";

const COLLECTION = "itinerary_cache";
const TTL_DAYS = 7;

export function hashPreferences(prefs: TripPreferences): string {
  const normalized = JSON.stringify({
    destination: prefs.destination.toLowerCase().trim(),
    startDate: prefs.startDate,
    endDate: prefs.endDate,
    travelers: prefs.travelers,
    budget: prefs.budget,
    interests: [...prefs.interests].sort(),
    dietaryRestrictions: prefs.dietaryRestrictions,
    mobilityConstraints: prefs.mobilityConstraints,
    accommodationType: prefs.accommodationType,
  });
  return crypto.createHash("sha256").update(normalized).digest("hex").slice(0, 20);
}

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
    if (ageMs > TTL_DAYS * 24 * 60 * 60 * 1000) return null;
    return data.itinerary as TripItinerary;
  } catch {
    return null;
  }
}

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
