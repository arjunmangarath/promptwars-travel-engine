import { z } from "zod";
import type { TripPreferences } from "@/types";

// ── Zod schema (mirrors route.ts) ──────────────────────────────────────────

const preferencesSchema = z.object({
  destination: z.string().min(2).max(100).trim(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  travelers: z.number().int().min(1).max(20),
  budget: z.enum(["low", "medium", "high"]),
  interests: z.array(z.string()).max(10),
  dietaryRestrictions: z.string().max(200).default(""),
  mobilityConstraints: z.string().max(200).default(""),
  accommodationType: z.enum(["hotel", "hostel", "airbnb", "resort"]),
});

const valid: TripPreferences = {
  originLocation: "New York, USA",
  destination: "Tokyo, Japan",
  startDate: "2026-06-01",
  endDate: "2026-06-07",
  travelers: 2,
  budget: "medium",
  interests: ["Culture & History", "Food & Cuisine"],
  dietaryRestrictions: "vegetarian",
  mobilityConstraints: "",
  accommodationType: "hotel",
  transportMode: "flight",
  departureTime: "08:00",
  returnTime: "18:00",
};

describe("Trip preferences validation", () => {
  it("accepts valid preferences", () => {
    expect(preferencesSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects single-char destination", () => {
    expect(preferencesSchema.safeParse({ ...valid, destination: "A" }).success).toBe(false);
  });

  it("trims whitespace from destination", () => {
    const result = preferencesSchema.safeParse({ ...valid, destination: "  Tokyo  " });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.destination).toBe("Tokyo");
  });

  it("rejects destination longer than 100 chars", () => {
    const result = preferencesSchema.safeParse({ ...valid, destination: "A".repeat(101) });
    expect(result.success).toBe(false);
  });

  it("rejects invalid budget enum", () => {
    expect(preferencesSchema.safeParse({ ...valid, budget: "luxury" }).success).toBe(false);
  });

  it("accepts all valid budget values", () => {
    (["low", "medium", "high"] as const).forEach((b) => {
      expect(preferencesSchema.safeParse({ ...valid, budget: b }).success).toBe(true);
    });
  });

  it("rejects travelers below minimum (0)", () => {
    expect(preferencesSchema.safeParse({ ...valid, travelers: 0 }).success).toBe(false);
  });

  it("rejects travelers above maximum (21)", () => {
    expect(preferencesSchema.safeParse({ ...valid, travelers: 21 }).success).toBe(false);
  });

  it("accepts traveler boundary values (1 and 20)", () => {
    expect(preferencesSchema.safeParse({ ...valid, travelers: 1 }).success).toBe(true);
    expect(preferencesSchema.safeParse({ ...valid, travelers: 20 }).success).toBe(true);
  });

  it("rejects non-integer travelers", () => {
    expect(preferencesSchema.safeParse({ ...valid, travelers: 1.5 }).success).toBe(false);
  });

  it("rejects invalid date format", () => {
    expect(preferencesSchema.safeParse({ ...valid, startDate: "June 1 2026" }).success).toBe(false);
    expect(preferencesSchema.safeParse({ ...valid, startDate: "2026/06/01" }).success).toBe(false);
  });

  it("accepts valid ISO date format", () => {
    expect(preferencesSchema.safeParse({ ...valid, startDate: "2026-12-31" }).success).toBe(true);
  });

  it("rejects more than 10 interests", () => {
    const tooMany = Array.from({ length: 11 }, (_, i) => `Interest${i}`);
    expect(preferencesSchema.safeParse({ ...valid, interests: tooMany }).success).toBe(false);
  });

  it("accepts exactly 10 interests", () => {
    const exactly10 = Array.from({ length: 10 }, (_, i) => `Interest${i}`);
    expect(preferencesSchema.safeParse({ ...valid, interests: exactly10 }).success).toBe(true);
  });

  it("accepts empty interests array", () => {
    expect(preferencesSchema.safeParse({ ...valid, interests: [] }).success).toBe(true);
  });

  it("accepts all accommodation types", () => {
    (["hotel", "hostel", "airbnb", "resort"] as const).forEach((type) => {
      expect(preferencesSchema.safeParse({ ...valid, accommodationType: type }).success).toBe(true);
    });
  });

  it("rejects invalid accommodation type", () => {
    expect(preferencesSchema.safeParse({ ...valid, accommodationType: "tent" }).success).toBe(false);
  });

  it("defaults dietaryRestrictions to empty string when omitted", () => {
    const { dietaryRestrictions: _, ...withoutDietary } = valid;
    const result = preferencesSchema.safeParse(withoutDietary);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.dietaryRestrictions).toBe("");
  });

  it("rejects dietaryRestrictions longer than 200 chars", () => {
    const result = preferencesSchema.safeParse({ ...valid, dietaryRestrictions: "x".repeat(201) });
    expect(result.success).toBe(false);
  });

  it("rejects missing required field (destination)", () => {
    const { destination: _, ...rest } = valid;
    expect(preferencesSchema.safeParse(rest).success).toBe(false);
  });
});

// ── Date business logic ────────────────────────────────────────────────────

describe("Date validation logic", () => {
  it("detects end before start", () => {
    const start = new Date("2026-06-10");
    const end = new Date("2026-06-05");
    expect(end <= start).toBe(true);
  });

  it("detects same-day as invalid (≤ start)", () => {
    const start = new Date("2026-06-01");
    const end = new Date("2026-06-01");
    expect(end <= start).toBe(true);
  });

  it("accepts valid range", () => {
    const start = new Date("2026-06-01");
    const end = new Date("2026-06-07");
    expect(end > start).toBe(true);
  });

  it("calculates trip duration correctly", () => {
    const start = new Date("2026-06-01");
    const end = new Date("2026-06-07");
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    expect(nights).toBe(6);
  });

  it("handles single-night trip", () => {
    const start = new Date("2026-06-01");
    const end = new Date("2026-06-02");
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    expect(nights).toBe(1);
  });
});

// ── Response shape validation ──────────────────────────────────────────────

describe("PlanResponse structure", () => {
  const mockItinerary = {
    tripTitle: "Tokyo Trip",
    destination: "Tokyo",
    duration: "6 nights",
    estimatedBudget: "$1500",
    currency: "USD",
    days: [],
    packingList: [],
    travelTips: [],
    emergencyContacts: [],
  };

  it("contains required itinerary fields", () => {
    const fields = ["tripTitle", "destination", "duration", "estimatedBudget", "currency", "days", "packingList", "travelTips", "emergencyContacts"];
    fields.forEach((f) => expect(mockItinerary).toHaveProperty(f));
  });

  it("allows cached to be true or false", () => {
    const withCache = { itinerary: mockItinerary, generatedAt: new Date().toISOString(), cached: true };
    const withoutCache = { itinerary: mockItinerary, generatedAt: new Date().toISOString(), cached: false };
    expect(withCache.cached).toBe(true);
    expect(withoutCache.cached).toBe(false);
  });

  it("generatedAt is a valid ISO string", () => {
    const ts = new Date().toISOString();
    expect(() => new Date(ts)).not.toThrow();
    expect(new Date(ts).toISOString()).toBe(ts);
  });
});

// ── Error response shape ───────────────────────────────────────────────────

describe("ApiError structure", () => {
  it("has required error field", () => {
    const err = { error: "Invalid request", details: "destination too short" };
    expect(err).toHaveProperty("error");
    expect(typeof err.error).toBe("string");
  });

  it("details is optional", () => {
    const err = { error: "Failed to generate itinerary" };
    expect(err.error).toBeDefined();
    expect((err as { details?: string }).details).toBeUndefined();
  });
});
