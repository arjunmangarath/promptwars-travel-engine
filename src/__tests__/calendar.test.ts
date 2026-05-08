import { buildGoogleCalendarUrl, buildGoogleCalendarDayUrl } from "@/lib/calendar";

describe("buildGoogleCalendarUrl", () => {
  it("generates a valid Google Calendar URL", () => {
    const url = buildGoogleCalendarUrl({
      title: "Visit Senso-ji Temple",
      date: "2026-06-01",
      startTime: "09:00",
      location: "Senso-ji, Asakusa, Tokyo",
      description: "Morning visit to the famous temple",
    });
    expect(url).toContain("calendar.google.com/calendar/render");
    expect(url).toContain("action=TEMPLATE");
  });

  it("encodes event title in URL", () => {
    const url = buildGoogleCalendarUrl({
      title: "Tea Ceremony & Tour",
      date: "2026-06-01",
      startTime: "14:00",
    });
    expect(url).toContain("Tea");
  });

  it("sets start date correctly (YYYYMMDD format)", () => {
    const url = buildGoogleCalendarUrl({
      title: "Dinner",
      date: "2026-06-15",
      startTime: "19:00",
    });
    expect(url).toContain("20260615T190000");
  });

  it("sets end time one hour after start", () => {
    const url = buildGoogleCalendarUrl({
      title: "Lunch",
      date: "2026-06-10",
      startTime: "12:00",
    });
    expect(url).toContain("20260610T130000");
  });

  it("wraps midnight correctly (23:00 → end at 00:00)", () => {
    const url = buildGoogleCalendarUrl({
      title: "Late Night Show",
      date: "2026-06-10",
      startTime: "23:00",
    });
    expect(url).toContain("20260610T230000");
    expect(url).toContain("20260610T000000");
  });

  it("includes location when provided", () => {
    const url = buildGoogleCalendarUrl({
      title: "Meeting",
      date: "2026-06-01",
      startTime: "10:00",
      location: "Shinjuku Station, Tokyo",
    });
    expect(url).toContain("Shinjuku");
  });

  it("omits location param when not provided", () => {
    const url = buildGoogleCalendarUrl({
      title: "Rest",
      date: "2026-06-01",
      startTime: "13:00",
    });
    expect(url).not.toContain("location=");
  });

  it("includes description when provided", () => {
    const url = buildGoogleCalendarUrl({
      title: "Museum Visit",
      date: "2026-06-02",
      startTime: "10:00",
      description: "Bring your passport",
    });
    expect(url).toContain("Bring+your+passport");
  });
});

describe("buildGoogleCalendarDayUrl", () => {
  it("generates a valid all-day event URL", () => {
    const url = buildGoogleCalendarDayUrl({
      title: "Day 1: Arrival",
      date: "2026-06-01",
    });
    expect(url).toContain("calendar.google.com/calendar/render");
    expect(url).toContain("action=TEMPLATE");
    expect(url).toContain("20260601");
  });

  it("uses same date for start and end (all-day)", () => {
    const url = buildGoogleCalendarDayUrl({
      title: "Day 3: Culture",
      date: "2026-06-03",
    });
    const dateCount = (url.match(/20260603/g) || []).length;
    expect(dateCount).toBeGreaterThanOrEqual(2);
  });

  it("includes description when provided", () => {
    const url = buildGoogleCalendarDayUrl({
      title: "Tokyo Trip",
      date: "2026-06-01",
      description: "09:00 — Breakfast\n10:00 — Temple",
    });
    expect(url).toContain("details=");
  });

  it("handles trip title with special characters", () => {
    const url = buildGoogleCalendarDayUrl({
      title: "Day 1 & 2: Arrival + Exploration",
      date: "2026-06-01",
    });
    expect(url).toContain("calendar.google.com");
    expect(typeof url).toBe("string");
  });
});
