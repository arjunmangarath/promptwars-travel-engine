import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { generateItinerary } from "@/lib/gemini";
import { getCachedItinerary, setCachedItinerary } from "@/lib/cache";
import { logInfo, logError } from "@/lib/logger";
import { ValidationError, isAppError } from "@/lib/errors";
import { z } from "zod";
import type { PlanResponse, ApiError } from "@/types";

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

const RESPONSE_HEADERS = {
  "Cache-Control": "private, max-age=3600",
} as const;

/**
 * POST /api/plan — generates a travel itinerary via Google Gemini.
 *
 * Flow:
 * 1. Validate request body with Zod
 * 2. Check Firestore cache (returns X-Cache: HIT instantly)
 * 3. Call Gemini 2.5 Flash on Vertex AI (or API key fallback)
 * 4. Store result in Firestore for future cache hits
 *
 * Every response carries an X-Request-ID header for distributed tracing.
 */
export async function POST(
  req: NextRequest
): Promise<NextResponse<PlanResponse | ApiError>> {
  const requestId = randomUUID();
  const startMs = Date.now();

  try {
    const body = await req.json();
    const parsed = preferencesSchema.safeParse(body);

    if (!parsed.success) {
      const details = parsed.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; ");
      throw new ValidationError("Invalid request parameters", details);
    }

    const preferences = parsed.data;

    if (new Date(preferences.endDate) <= new Date(preferences.startDate)) {
      throw new ValidationError(
        "Invalid date range",
        "endDate must be strictly after startDate"
      );
    }

    logInfo("Plan request", {
      requestId,
      destination: preferences.destination,
      budget: preferences.budget,
      travelers: preferences.travelers,
    });

    // Check Firestore cache first — avoids redundant Gemini API calls
    const cached = await getCachedItinerary(preferences);
    if (cached) {
      const durationMs = Date.now() - startMs;
      logInfo("Cache hit", { requestId, destination: preferences.destination, durationMs });
      return NextResponse.json(
        { itinerary: cached, generatedAt: new Date().toISOString(), cached: true },
        {
          headers: {
            ...RESPONSE_HEADERS,
            "X-Cache": "HIT",
            "X-Request-ID": requestId,
            "X-Response-Time": `${durationMs}ms`,
          },
        }
      );
    }

    const itinerary = await generateItinerary(preferences);

    // Fire-and-forget: cache miss doesn't block the response
    void setCachedItinerary(preferences, itinerary);

    const durationMs = Date.now() - startMs;
    logInfo("Itinerary generated", { requestId, destination: preferences.destination, durationMs });

    return NextResponse.json(
      { itinerary, generatedAt: new Date().toISOString(), cached: false },
      {
        headers: {
          ...RESPONSE_HEADERS,
          "X-Cache": "MISS",
          "X-Request-ID": requestId,
          "X-Response-Time": `${durationMs}ms`,
        },
      }
    );
  } catch (err) {
    const durationMs = Date.now() - startMs;

    if (isAppError(err)) {
      logError("Request failed (app error)", {
        requestId,
        error: err.message,
        statusCode: err.statusCode,
        durationMs,
      });
      const details =
        err instanceof ValidationError ? err.details : undefined;
      return NextResponse.json(
        { error: err.message, ...(details && { details }) },
        {
          status: err.statusCode,
          headers: { "X-Request-ID": requestId, "X-Response-Time": `${durationMs}ms` },
        }
      );
    }

    const message = err instanceof Error ? err.message : "Unknown error";
    logError("Unexpected error", { requestId, error: message, durationMs });
    return NextResponse.json(
      { error: "Failed to generate itinerary", details: message },
      {
        status: 500,
        headers: { "X-Request-ID": requestId, "X-Response-Time": `${durationMs}ms` },
      }
    );
  }
}
