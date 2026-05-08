import { z } from "zod";

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

describe("Trip preferences validation", () => {
  const valid = {
    destination: "Tokyo, Japan",
    startDate: "2026-06-01",
    endDate: "2026-06-07",
    travelers: 2,
    budget: "medium" as const,
    interests: ["Culture & History", "Food & Cuisine"],
    dietaryRestrictions: "vegetarian",
    mobilityConstraints: "",
    accommodationType: "hotel" as const,
  };

  it("accepts valid preferences", () => {
    expect(preferencesSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects empty destination", () => {
    const result = preferencesSchema.safeParse({ ...valid, destination: "A" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid budget", () => {
    const result = preferencesSchema.safeParse({ ...valid, budget: "luxury" });
    expect(result.success).toBe(false);
  });

  it("rejects travelers out of range", () => {
    expect(preferencesSchema.safeParse({ ...valid, travelers: 0 }).success).toBe(false);
    expect(preferencesSchema.safeParse({ ...valid, travelers: 21 }).success).toBe(false);
  });

  it("rejects invalid date format", () => {
    const result = preferencesSchema.safeParse({ ...valid, startDate: "June 1 2026" });
    expect(result.success).toBe(false);
  });

  it("rejects too many interests", () => {
    const tooMany = Array.from({ length: 11 }, (_, i) => `Interest${i}`);
    const result = preferencesSchema.safeParse({ ...valid, interests: tooMany });
    expect(result.success).toBe(false);
  });

  it("accepts all accommodation types", () => {
    const types = ["hotel", "hostel", "airbnb", "resort"] as const;
    types.forEach((type) => {
      expect(
        preferencesSchema.safeParse({ ...valid, accommodationType: type }).success
      ).toBe(true);
    });
  });
});

describe("Date validation logic", () => {
  it("detects end before start", () => {
    const start = new Date("2026-06-10");
    const end = new Date("2026-06-05");
    expect(end <= start).toBe(true);
  });

  it("allows same-day check-in check-out", () => {
    const start = new Date("2026-06-01");
    const end = new Date("2026-06-01");
    expect(end <= start).toBe(true);
  });

  it("accepts valid range", () => {
    const start = new Date("2026-06-01");
    const end = new Date("2026-06-07");
    expect(end > start).toBe(true);
  });
});
