import { GoogleGenAI } from "@google/genai";
import type { TripPreferences, TripItinerary } from "@/types";
import { GenerationError } from "./errors";
import { logInfo, logError, logWarn } from "./logger";

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
 * Sanitizes a user-supplied string before inserting it into the Gemini prompt.
 * Strips control characters and prompt-injection markers (triple backticks)
 * to prevent malicious inputs from manipulating the AI's instruction context.
 *
 * @param input - Raw user input
 * @param maxLength - Hard truncation limit (default: 200 chars)
 * @returns Sanitized string safe for inclusion in a prompt
 */
export function sanitizeForPrompt(input: string, maxLength = 200): string {
  return input
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .replace(/`{3,}/g, "")
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .trim()
    .slice(0, maxLength);
}

/**
 * Calls Google Gemini to generate a day-by-day travel itinerary.
 *
 * Strategy:
 * 1. Try Vertex AI (ADC — no quota limits, used in production on Cloud Run).
 * 2. Fall back to API key client (local dev only, subject to free-tier limits).
 *
 * All user inputs are sanitized before insertion into the prompt to prevent
 * prompt injection attacks.
 *
 * @param preferences - Validated trip preferences from the user
 * @returns A structured TripItinerary with days, activities, tips, packing list, and weather context
 * @throws {GenerationError} When all model attempts fail
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

  // Sanitize all free-text inputs before injecting into the prompt
  const safeDestination = sanitizeForPrompt(preferences.destination, 100);
  const safeDietary = sanitizeForPrompt(preferences.dietaryRestrictions || "none");
  const safeMobility = sanitizeForPrompt(preferences.mobilityConstraints || "none");
  const safeInterests = preferences.interests
    .map((i) => sanitizeForPrompt(i, 50))
    .join(", ") || "general sightseeing";

  const prompt = `You are an expert travel planner with real-time destination knowledge. Today's date is ${today}. Generate a detailed, practical travel itinerary that accounts for current seasonal conditions.

Trip Details:
- Destination: ${safeDestination}
- Dates: ${preferences.startDate} to ${preferences.endDate} (${nights} nights)
- Travelers: ${preferences.travelers}
- Budget: ${preferences.budget}
- Interests: ${safeInterests}
- Dietary restrictions: ${safeDietary}
- Mobility constraints: ${safeMobility}
- Accommodation: ${preferences.accommodationType}

Consider current season, local events, and typical weather for the travel dates. Provide seasonal weather context and best-time tips.

Return ONLY valid JSON matching this exact schema:
{
  "tripTitle": "string",
  "destination": "string",
  "duration": "string",
  "estimatedBudget": "string",
  "currency": "string",
  "weatherConsiderations": "string (current season info, typical weather for travel dates, what to expect)",
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

  logInfo("Generating itinerary", {
    destination: safeDestination,
    nights,
    budget: preferences.budget,
  });

  let lastError: Error | null = null;

  // Always try Vertex AI first in production (Cloud Run ADC, no free-tier limits)
  try {
    const vertexAI = getVertexClient();
    for (const modelName of VERTEX_MODELS) {
      try {
        logInfo("Trying Vertex AI model", { model: modelName });
        const response = await vertexAI.models.generateContent({
          model: modelName,
          contents: prompt,
          config: { responseMimeType: "application/json" },
        });
        const text = response.text ?? "";
        const itinerary = JSON.parse(text) as TripItinerary;
        logInfo("Itinerary generated via Vertex AI", { model: modelName });
        return itinerary;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        logWarn("Vertex AI model failed", { model: modelName, error: lastError.message });
      }
    }
  } catch (err) {
    // Vertex AI client init failed (no ADC) — fall through to API key
    logWarn("Vertex AI client init failed", {
      error: err instanceof Error ? err.message : String(err),
    });
  }

  // Fallback: API key (local dev or ADC unavailable)
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    const aiKeyClient = getApiKeyClient(apiKey);
    for (const modelName of API_KEY_MODELS) {
      try {
        logInfo("Trying API key model", { model: modelName });
        const response = await aiKeyClient.models.generateContent({
          model: modelName,
          contents: prompt,
          config: { responseMimeType: "application/json" },
        });
        const text = response.text ?? "";
        const itinerary = JSON.parse(text) as TripItinerary;
        logInfo("Itinerary generated via API key", { model: modelName });
        return itinerary;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        logWarn("API key model failed", { model: modelName, error: lastError.message });
      }
    }
  }

  logError("All model attempts failed", { destination: safeDestination });
  throw new GenerationError(
    "Failed to generate itinerary after all model attempts",
    lastError ?? undefined
  );
}
