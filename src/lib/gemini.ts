import { GoogleGenAI } from "@google/genai";
import type { TripPreferences, TripItinerary } from "@/types";

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || "promptwars-live";
const LOCATION = "us-central1";

/** Only gemini-2.5-flash is enabled in the Vertex AI Model Garden for this project. */
const VERTEX_MODELS = ["gemini-2.5-flash"] as const;
/** API key fallback model list for local development (Vertex ADC not available). */
const API_KEY_MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.0-flash-lite"] as const;

/** Returns a Vertex AI client authenticated via Application Default Credentials. */
function getVertexClient(): GoogleGenAI {
  return new GoogleGenAI({ vertexai: true, project: PROJECT_ID, location: LOCATION });
}

/** Returns a Gemini client authenticated via API key (local dev fallback). */
function getApiKeyClient(apiKey: string): GoogleGenAI {
  return new GoogleGenAI({ apiKey });
}

/**
 * Calls Google Gemini to generate a day-by-day travel itinerary.
 *
 * Strategy:
 * 1. Try Vertex AI (ADC — no quota limits, used in production on Cloud Run).
 * 2. Fall back to API key client (local dev only, subject to free-tier limits).
 *
 * @param preferences - Validated trip preferences from the user
 * @returns A structured TripItinerary with days, activities, tips, and packing list
 * @throws When all model attempts fail and no itinerary can be generated
 */
export async function generateItinerary(
  preferences: TripPreferences
): Promise<TripItinerary> {
  const nights =
    Math.ceil(
      (new Date(preferences.endDate).getTime() -
        new Date(preferences.startDate).getTime()) /
        (1000 * 60 * 60 * 24)
    ) || 1;

  const today = new Date().toISOString().split("T")[0];

  const prompt = `You are an expert travel planner with real-time destination knowledge. Today's date is ${today}. Generate a detailed, practical travel itinerary that accounts for current seasonal conditions.

Trip Details:
- Destination: ${preferences.destination}
- Dates: ${preferences.startDate} to ${preferences.endDate} (${nights} nights)
- Travelers: ${preferences.travelers}
- Budget: ${preferences.budget}
- Interests: ${preferences.interests.join(", ") || "general sightseeing"}
- Dietary restrictions: ${preferences.dietaryRestrictions || "none"}
- Mobility constraints: ${preferences.mobilityConstraints || "none"}
- Accommodation: ${preferences.accommodationType}

Consider current season, local events, and weather conditions typical for the travel dates when planning activities and packing recommendations.

Return ONLY valid JSON matching this exact schema:
{
  "tripTitle": "string",
  "destination": "string",
  "duration": "string",
  "estimatedBudget": "string",
  "currency": "string",
  "days": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "theme": "string",
      "activities": [
        {
          "time": "HH:MM",
          "activity": "string",
          "location": "string",
          "description": "string",
          "estimatedCost": "string",
          "tips": "string",
          "accessibilityNotes": "string or empty"
        }
      ]
    }
  ],
  "packingList": ["item1", "item2"],
  "travelTips": ["tip1", "tip2"],
  "emergencyContacts": ["contact1"]
}

Make it realistic, specific to the destination, and respect all constraints provided.`;

  let lastError: Error | null = null;

  // Always try Vertex AI first in production (Cloud Run ADC, no free-tier limits)
  try {
    const vertexAI = getVertexClient();
    for (const modelName of VERTEX_MODELS) {
      try {
        const response = await vertexAI.models.generateContent({
          model: modelName,
          contents: prompt,
          config: { responseMimeType: "application/json" },
        });
        const text = response.text ?? "";
        return JSON.parse(text) as TripItinerary;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
      }
    }
  } catch {
    // Vertex AI client init failed (no ADC) — fall through to API key
  }

  // Fallback: API key (local dev or ADC unavailable)
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    const aiKeyClient = getApiKeyClient(apiKey);
    for (const modelName of API_KEY_MODELS) {
      try {
        const response = await aiKeyClient.models.generateContent({
          model: modelName,
          contents: prompt,
          config: { responseMimeType: "application/json" },
        });
        const text = response.text ?? "";
        return JSON.parse(text) as TripItinerary;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
      }
    }
  }

  throw lastError ?? new Error("Failed to generate itinerary");
}
