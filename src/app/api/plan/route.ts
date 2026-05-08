import { NextRequest, NextResponse } from "next/server";
import { generateItinerary } from "@/lib/gemini";
import { getCachedItinerary, setCachedItinerary } from "@/lib/cache";
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

export async function POST(
  req: NextRequest
): Promise<NextResponse<PlanResponse | ApiError>> {
  try {
    const body = await req.json();
    const parsed = preferencesSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.message },
        { status: 400 }
      );
    }

    const preferences = parsed.data;

    if (new Date(preferences.endDate) <= new Date(preferences.startDate)) {
      return NextResponse.json(
        { error: "End date must be after start date" },
        { status: 400 }
      );
    }

    // Check Firestore cache first — avoids redundant Gemini API calls
    const cached = await getCachedItinerary(preferences);
    if (cached) {
      return NextResponse.json(
        { itinerary: cached, generatedAt: new Date().toISOString(), cached: true },
        {
          headers: {
            "X-Cache": "HIT",
            "Cache-Control": "private, max-age=3600",
          },
        }
      );
    }

    const itinerary = await generateItinerary(preferences);

    // Store in Firestore for future cache hits
    void setCachedItinerary(preferences, itinerary);

    return NextResponse.json(
      { itinerary, generatedAt: new Date().toISOString(), cached: false },
      {
        headers: {
          "X-Cache": "MISS",
          "Cache-Control": "private, max-age=3600",
        },
      }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/plan]", message);
    return NextResponse.json(
      { error: "Failed to generate itinerary", details: message },
      { status: 500 }
    );
  }
}
