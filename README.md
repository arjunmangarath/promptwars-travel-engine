# Travel Planning & Experience Engine

> PromptWars Bengaluru 2026 — Warm-Up Challenge

## Vertical Chosen
**Travel Planning & Experience Engine** — Plan trips dynamically with preferences, constraints, and real-time AI-powered updates.

## Approach & Logic

This application is a smart, context-aware travel planning assistant that uses Google Gemini to generate personalised, day-by-day trip itineraries based on user preferences and constraints.

### Architecture

```
User Input → Validation (Zod) → Gemini API → Structured JSON → Rendered Itinerary
```

### Key Design Decisions
- **Server-side API route** (`/api/plan`) keeps the Gemini API key secure — never exposed to the client
- **Zod schema validation** on every request boundary — rejects malformed input before it reaches the AI
- **Structured JSON output** from Gemini (`responseMimeType: "application/json"`) ensures reliable parsing
- **Accessibility-first UI** — ARIA labels, keyboard navigation, live regions, skip links, semantic HTML throughout

## How It Works

1. User fills in: destination, travel dates, number of travelers, budget level, interests, dietary restrictions, mobility constraints, and accommodation type
2. On submit, preferences are validated client-side (form constraints) and server-side (Zod schema)
3. A structured prompt is sent to **Google Gemini 1.5 Flash** requesting a typed JSON itinerary
4. The itinerary is rendered as a day-by-day plan with activities, timings, cost estimates, travel tips, and accessibility notes

## Google Services Used
- **Google Gemini API** (`gemini-1.5-flash`) — core AI planning engine
- **Google Cloud Run** — production deployment target (Dockerfile included)

## Tech Stack
- **Next.js 15** (App Router) + **TypeScript** — type-safe full-stack framework
- **Tailwind CSS** — utility-first styling
- **Zod** — runtime input validation
- **Jest** — unit tests for validation logic

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

# 4. Run locally
npm run dev

# 5. Run tests
npm test
```

## Assumptions
- Gemini API key is provided via environment variable (never hardcoded)
- Trip duration is calculated from start/end dates — minimum 1 night
- Budget tiers (low/medium/high) guide Gemini's recommendations for accommodation and activities
- Accessibility notes in the itinerary are generated only when mobility constraints are specified
