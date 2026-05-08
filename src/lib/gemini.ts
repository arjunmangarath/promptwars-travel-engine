import { GoogleGenAI } from "@google/genai";
import type { TripPreferences, TripItinerary } from "@/types";

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || "promptwars-live";
const LOCATION = "us-central1";

// Only gemini-2.5-flash is available via Vertex AI on this project
const VERTEX_MODELS = ["gemini-2.5-flash"];
// API key fallback models (local dev only)
const API_KEY_MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.0-flash-lite"];

function getVertexClient(): GoogleGenAI {
  return new GoogleGenAI({ vertexai: true, project: PROJECT_ID, location: LOCATION });
}

function getApiKeyClient(apiKey: string): GoogleGenAI {
  return new GoogleGenAI({ apiKey });
}

export async function generateItinerary(
  preferences: TripPreferences
): Promise<TripItinerary> {
  const nights =
    Math.ceil(
      (new Date(preferences.endDate).getTime() -
        new Date(preferences.startDate).getTime()) /
        (1000 * 60 * 60 * 24)
    ) || 1;

  const prompt = `You are an expert travel planner. Generate a detailed, practical travel itinerary.

Trip Details:
- Destination: ${preferences.destination}
- Dates: ${preferences.startDate} to ${preferences.endDate} (${nights} nights)
- Travelers: ${preferences.travelers}
- Budget: ${preferences.budget}
- Interests: ${preferences.interests.join(", ") || "general sightseeing"}
- Dietary restrictions: ${preferences.dietaryRestrictions || "none"}
- Mobility constraints: ${preferences.mobilityConstraints || "none"}
- Accommodation: ${preferences.accommodationType}

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
