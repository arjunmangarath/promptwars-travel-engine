# Travel Planning & Experience Engine

> PromptWars Bengaluru 2026 — Warm-Up Challenge

## Vertical Chosen
**Travel Planning & Experience Engine** — Plan trips dynamically with preferences, constraints, and real-time AI-powered updates.

## Approach & Logic

This application is a smart, context-aware travel planning assistant that uses Google Gemini 2.5 Flash to generate personalised, day-by-day trip itineraries based on user preferences and constraints. Results are cached in Firebase Firestore for instant repeat lookups, displayed with Google Maps, and schedulable directly into Google Calendar.

### Architecture

```
User Input → Zod Validation → Firebase Cache Check → Gemini 2.5 Flash → Firestore Cache → Rendered Itinerary
                                        ↓ (cache hit)
                                  Instant Response
```

### Key Design Decisions
- **Server-side API route** (`/api/plan`) keeps the Gemini API key secure — never exposed to the client
- **Firebase Firestore caching** — identical requests return instantly without a second Gemini call
- **Structured JSON output** from Gemini (`responseMimeType: "application/json"`) ensures reliable parsing
- **Zod schema validation** on every request boundary — rejects malformed input before it reaches the AI
- **Google Calendar integration** — every activity and day has a direct "Add to Google Calendar" link
- **Google Maps embed** — destination rendered as an interactive map; all locations link to Google Maps
- **Firebase Analytics** — trip planning and itinerary view events tracked automatically
- **Accessibility-first UI** — ARIA labels, keyboard navigation, live regions, skip links, semantic HTML

## How It Works

1. User fills in: destination, travel dates, travelers, budget, interests, dietary restrictions, mobility constraints, accommodation
2. Preferences are validated client-side (form constraints) and server-side (Zod schema)
3. Firebase Firestore is checked for a cached itinerary (7-day TTL) — returns instantly on hit
4. On cache miss, a structured prompt is sent to **Google Gemini 2.5 Flash** (fallback: gemini-2.0-flash)
5. Response is stored in Firestore, rendered with an interactive Google Maps embed and per-activity Google Calendar links

## Google Services Used
- **Google Gemini API** (`gemini-2.5-flash`) — core AI planning engine with model fallback
- **Firebase Firestore** — itinerary caching with 7-day TTL, reducing redundant AI calls
- **Firebase Analytics** — tracks `trip_planned` and `itinerary_viewed` events
- **Google Maps** — interactive destination embed + per-location "View on Google Maps" links
- **Google Calendar** — "Add to Calendar" link on every activity, every day, and the full trip
- **Google Cloud Run** — production deployment (asia-south1, 512Mi, auto-scaling)

## Tech Stack
- **Next.js 15** (App Router) + **TypeScript** — type-safe full-stack framework
- **@google/genai** — official Google Generative AI SDK
- **firebase-admin** — server-side Firestore access via Application Default Credentials
- **firebase** — client-side Analytics
- **Tailwind CSS** — utility-first styling
- **Zod** — runtime input validation
- **Jest** + **ts-jest** — 55 unit tests across 3 suites (schema, cache, calendar)

## Setup

```bash
# 1. Clone the repo
git clone https://github.com/arjunmangarath/promptwars-travel-engine
cd promptwars-travel-engine

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.local.example .env.local
# Add your GEMINI_API_KEY from Google AI Studio
# Add GOOGLE_CLOUD_PROJECT for Firebase/Firestore

# 4. Run locally
npm run dev

# 5. Run tests
npm test
```

## Assumptions
- Gemini API key is provided via environment variable (never hardcoded)
- Firebase Admin SDK uses Application Default Credentials on Cloud Run (no service account JSON in code)
- Trip duration is calculated from start/end dates — minimum 1 night
- Budget tiers (low/medium/high) guide Gemini's recommendations for accommodation and activities
- Accessibility notes in the itinerary are generated only when mobility constraints are specified
- Google Calendar links use the URL scheme — no OAuth required, opens in the user's browser
