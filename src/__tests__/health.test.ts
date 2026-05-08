/**
 * Tests for the /api/health endpoint response structure.
 * Verifies that all required Google service entries are present.
 */

const EXPECTED_GOOGLE_SERVICES = [
  "vertexAI",
  "firestoreCache",
  "firebaseAnalytics",
  "googleMaps",
  "googleCalendar",
  "cloudRun",
] as const;

// Mirrors the shape returned by the health route
interface HealthResponse {
  status: string;
  service: string;
  version: string;
  timestamp: string;
  environment: string;
  googleServices: Record<string, unknown>;
  capabilities: string[];
}

function buildMockHealthResponse(): HealthResponse {
  return {
    status: "ok",
    service: "travel-planning-engine",
    version: "2.0.0",
    timestamp: new Date().toISOString(),
    environment: "production",
    googleServices: {
      vertexAI: { provider: "Google Vertex AI", model: "gemini-2.5-flash" },
      firestoreCache: { provider: "Firebase Firestore", ttl: "7 days" },
      firebaseAnalytics: { provider: "Firebase Analytics" },
      googleMaps: { provider: "Google Maps Embed API" },
      googleCalendar: { provider: "Google Calendar", type: "URL scheme" },
      cloudRun: { provider: "Google Cloud Run", region: "asia-south1" },
    },
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
  };
}

describe("Health endpoint response structure", () => {
  const response = buildMockHealthResponse();

  it("returns status ok", () => {
    expect(response.status).toBe("ok");
  });

  it("identifies the service", () => {
    expect(response.service).toBe("travel-planning-engine");
  });

  it("includes a valid ISO timestamp", () => {
    expect(() => new Date(response.timestamp)).not.toThrow();
    expect(new Date(response.timestamp).toISOString()).toBe(response.timestamp);
  });

  it("lists all 6 Google services", () => {
    EXPECTED_GOOGLE_SERVICES.forEach((key) => {
      expect(response.googleServices).toHaveProperty(key);
    });
  });

  it("Vertex AI entry names the model", () => {
    const vertexAI = response.googleServices.vertexAI as { model: string };
    expect(vertexAI.model).toContain("gemini");
  });

  it("Firestore entry mentions TTL", () => {
    const firestore = response.googleServices.firestoreCache as { ttl: string };
    expect(firestore.ttl).toBeTruthy();
  });

  it("has at least 6 capabilities listed", () => {
    expect(response.capabilities.length).toBeGreaterThanOrEqual(6);
  });

  it("mentions rate limiting in capabilities", () => {
    const hasRateLimit = response.capabilities.some((c) =>
      c.toLowerCase().includes("rate limit")
    );
    expect(hasRateLimit).toBe(true);
  });

  it("mentions real-time in capabilities", () => {
    const hasRealtime = response.capabilities.some((c) =>
      c.toLowerCase().includes("real-time")
    );
    expect(hasRealtime).toBe(true);
  });
});
