import { GoogleGenerativeAI } from "@google/generative-ai";
import type { TripPreferences, TripItinerary } from "@/types";

function getClient(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY environment variable is not set");
  return new GoogleGenerativeAI(apiKey);
}

export async function generateItinerary(
  preferences: TripPreferences
): Promise<TripItinerary> {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: { responseMimeType: "application/json" },
  });

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

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  try {
    return JSON.parse(text) as TripItinerary;
  } catch {
    throw new Error("Failed to parse itinerary from AI response");
  }
}
