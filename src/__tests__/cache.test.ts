import { hashPreferences } from "@/lib/cache";
import type { TripPreferences, TripItinerary } from "@/types";

const basePrefs: TripPreferences = {
  destination: "Tokyo, Japan",
  startDate: "2026-06-01",
  endDate: "2026-06-07",
  travelers: 2,
  budget: "medium",
  interests: ["Food & Cuisine", "Culture & History"],
  dietaryRestrictions: "",
  mobilityConstraints: "",
  accommodationType: "hotel",
};

const sampleItinerary: TripItinerary = {
  tripTitle: "Tokyo Adventure",
  destination: "Tokyo, Japan",
  duration: "6 nights",
  estimatedBudget: "$1500",
  currency: "USD",
  days: [
    {
      day: 1,
      date: "2026-06-01",
      theme: "Arrival & Exploration",
      activities: [
        {
          time: "14:00",
          activity: "Check in",
          location: "Hotel",
          description: "Check into your hotel",
          estimatedCost: "$150/night",
          tips: "Ask for a high floor",
        },
      ],
    },
  ],
  packingList: ["Passport", "Yen"],
  travelTips: ["Get a Suica card", "Learn basic Japanese phrases"],
  emergencyContacts: ["Embassy: +81-3-3224-5000"],
};

describe("hashPreferences", () => {
  it("returns a 20-char hex string", () => {
    const hash = hashPreferences(basePrefs);
    expect(hash).toHaveLength(20);
    expect(hash).toMatch(/^[0-9a-f]+$/);
  });

  it("is deterministic for same input", () => {
    expect(hashPreferences(basePrefs)).toBe(hashPreferences(basePrefs));
  });

  it("differs for different destinations", () => {
    const h1 = hashPreferences(basePrefs);
    const h2 = hashPreferences({ ...basePrefs, destination: "Paris, France" });
    expect(h1).not.toBe(h2);
  });

  it("differs for different budgets", () => {
    const h1 = hashPreferences(basePrefs);
    const h2 = hashPreferences({ ...basePrefs, budget: "high" });
    expect(h1).not.toBe(h2);
  });

  it("differs for different dates", () => {
    const h1 = hashPreferences(basePrefs);
    const h2 = hashPreferences({ ...basePrefs, startDate: "2026-07-01" });
    expect(h1).not.toBe(h2);
  });

  it("normalises destination casing", () => {
    const h1 = hashPreferences({ ...basePrefs, destination: "TOKYO, JAPAN" });
    const h2 = hashPreferences({ ...basePrefs, destination: "tokyo, japan" });
    expect(h1).toBe(h2);
  });

  it("normalises interest order", () => {
    const h1 = hashPreferences({ ...basePrefs, interests: ["Food & Cuisine", "Culture & History"] });
    const h2 = hashPreferences({ ...basePrefs, interests: ["Culture & History", "Food & Cuisine"] });
    expect(h1).toBe(h2);
  });

  it("differs for different traveler counts", () => {
    const h1 = hashPreferences({ ...basePrefs, travelers: 2 });
    const h2 = hashPreferences({ ...basePrefs, travelers: 4 });
    expect(h1).not.toBe(h2);
  });
});

describe("getCachedItinerary + setCachedItinerary (mocked Firestore)", () => {
  const mockGet = jest.fn();
  const mockSet = jest.fn();
  const mockDoc = jest.fn(() => ({ get: mockGet, set: mockSet }));
  const mockCollection = jest.fn(() => ({ doc: mockDoc }));

  beforeEach(() => {
    jest.resetModules();
    jest.mock("@/lib/firebase-admin", () => ({
      getAdminDb: () => ({ collection: mockCollection }),
    }));
    mockGet.mockReset();
    mockSet.mockReset();
  });

  it("returns null when Firestore has no doc", async () => {
    mockGet.mockResolvedValueOnce({ exists: false });
    const { getCachedItinerary } = await import("@/lib/cache");
    const result = await getCachedItinerary(basePrefs);
    expect(result).toBeNull();
  });

  it("returns itinerary when fresh cache hit", async () => {
    mockGet.mockResolvedValueOnce({
      exists: true,
      data: () => ({
        itinerary: sampleItinerary,
        cachedAt: new Date().toISOString(),
      }),
    });
    const { getCachedItinerary } = await import("@/lib/cache");
    const result = await getCachedItinerary(basePrefs);
    expect(result).toEqual(sampleItinerary);
  });

  it("returns null when cache entry is expired (>7 days)", async () => {
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 8);
    mockGet.mockResolvedValueOnce({
      exists: true,
      data: () => ({
        itinerary: sampleItinerary,
        cachedAt: oldDate.toISOString(),
      }),
    });
    const { getCachedItinerary } = await import("@/lib/cache");
    const result = await getCachedItinerary(basePrefs);
    expect(result).toBeNull();
  });

  it("returns null when Firestore throws", async () => {
    mockGet.mockRejectedValueOnce(new Error("Firestore unavailable"));
    const { getCachedItinerary } = await import("@/lib/cache");
    const result = await getCachedItinerary(basePrefs);
    expect(result).toBeNull();
  });

  it("silently handles Firestore write errors", async () => {
    mockSet.mockRejectedValueOnce(new Error("Write failed"));
    const { setCachedItinerary } = await import("@/lib/cache");
    await expect(setCachedItinerary(basePrefs, sampleItinerary)).resolves.toBeUndefined();
  });
});
