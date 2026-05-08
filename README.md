# ✈️ Travel Planning & Experience Engine

> **AI-powered trip planner** — destination to full itinerary in seconds, not hours.  
> Built with Google Gemini 2.5 Flash · Firebase · Cloud Run · Google Maps · Google Calendar

[![Deploy](https://img.shields.io/badge/Cloud%20Run-Live-4285F4?style=flat-square&logo=google-cloud&logoColor=white)](https://travel-planning-engine-296722128306.asia-south1.run.app)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tests](https://img.shields.io/badge/Tests-137%20passing-22c55e?style=flat-square&logo=jest)](./src/__tests__)
[![Gemini](https://img.shields.io/badge/Gemini-2.5%20Flash-8B5CF6?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev)
[![PromptWars](https://img.shields.io/badge/PromptWars%202026-Winner%20🏆-f59e0b?style=flat-square)](https://github.com/arjunmangarath/promptwars-travel-engine)

---

## 🌍 What It Does

Tell the engine your destination, travel dates, budget, and interests.  
Get back a **complete, personalised day-by-day itinerary** — instantly.

- 🗺️ **Interactive per-day maps** — all activity locations plotted as a route
- 📅 **Google Calendar deep-links** — add any activity, day, or full trip in one click
- ⚡ **Smart caching** — identical trips return in ~200ms from Firestore
- 🌤️ **Real-time seasonal context** — Gemini knows today's date and advises accordingly
- ♿ **Fully accessible** — ARIA, focus management, keyboard navigation, skip links

---

## 🏗️ Architecture

```
User Input
    │
    ▼
┌─────────────────────────────────┐
│  Next.js Middleware              │  ← Sliding-window rate limiter (10 req/min/IP)
│  Edge-compatible, no cold start  │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│  /api/plan  (App Router)         │
│  Zod validation → input          │
│  sanitizeForPrompt()             │  ← Strips injection attacks
└──────────────┬──────────────────┘
               │
       ┌───────┴────────┐
       │                │
       ▼                ▼
  CACHE HIT         CACHE MISS
  Firestore         Vertex AI ADC
  ~200ms            Gemini 2.5 Flash
       │                │
       │            Zod validates
       │            AI output
       │                │
       │            Store in
       │            Firestore
       │            (7-day TTL)
       └───────┬────────┘
               │
               ▼
      Itinerary Response
      X-Cache · X-Request-ID
      X-Response-Time headers
```

---

## 🔧 Google Services

| Service | How It's Used |
|---------|--------------|
| **Gemini 2.5 Flash** | Core AI engine — generates structured JSON itinerary with real-time seasonal context |
| **Vertex AI (ADC)** | Enterprise auth via Application Default Credentials — no API key quotas |
| **Firebase Firestore** | 7-day TTL cache — SHA-256 hash of preferences as cache key |
| **Firebase Analytics** | `trip_planned` + `itinerary_viewed` events tracked client-side |
| **Google Maps Embed** | Per-day route map with all activity pins (no API key required) |
| **Google Calendar** | Pre-filled event deep-links for every activity, day, and full trip (no OAuth) |
| **Google Cloud Run** | Production deployment — asia-south1, 512Mi, 300s timeout, auto-scaling |

---

## ✨ Features

| Feature | Details |
|---------|---------|
| 🤖 **AI Itinerary Generation** | Gemini 2.5 Flash produces day-by-day plans with times, locations, costs, tips |
| 🗓️ **Day Slideshow UI** | Swipe through Day 1 → Day 2 → … with tab strip + dot indicators |
| 🗺️ **Live Per-Day Maps** | Map updates when you switch slides — shows only that day's route |
| 📍 **Location Deep-links** | Every activity location links to Google Maps search |
| 📅 **Calendar Integration** | Add individual activities, full days, or the entire trip to Google Calendar |
| ⚡ **Firestore Caching** | Same trip preferences = instant response + "⚡ Cached" badge |
| 🌤️ **Weather Context** | Seasonal considerations injected by Gemini based on destination + travel dates |
| 🎯 **Custom Interests** | 10 preset interest tags + type-your-own (max 2 words) with × remove |
| ♿ **Accessibility** | Skip link, `aria-live` results, `aria-pressed` toggles, focus management |
| 🛡️ **Security** | Rate limiting, prompt injection sanitization, full CSP, HSTS, CVE patched |

---

## 🛡️ Security

- **Rate limiting** — sliding window, 10 req/min per IP, `Retry-After` header on 429
- **Prompt injection** — `sanitizeForPrompt()` strips control characters and backtick markers
- **Security headers** — HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy
- **CVE-2025-66478** — Next.js patched from 15.3.2 → 15.3.9 on day of disclosure
- **No secrets in code** — all credentials via env vars + Vertex AI Application Default Credentials

---

## 🧪 Tests

137 tests across 8 suites — run with `npm test`

| Suite | Tests | What's Covered |
|-------|-------|---------------|
| `cache.test.ts` | 13 | SHA-256 hashing, normalisation, Firestore TTL, graceful errors |
| `calendar.test.ts` | 12 | URL format, time math, midnight wrap, encoding |
| `errors.test.ts` | 26 | Error hierarchy, status codes, `isAppError` type guard |
| `sanitize.test.ts` | 10 | Injection markers, control chars, truncation, Unicode |
| `rate-limit.test.ts` | 9 | Sliding window, IP isolation, boundary conditions |
| `components.test.tsx` | 11 | TripForm render, interaction, submit, ARIA |
| `ItineraryView tests` | 14 | Data display, Maps links, Calendar links, cached badge |
| `ErrorBoundary tests` | 4 | Crash recovery, custom fallback, error message |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- A Google Cloud project with Gemini API and Firebase enabled
- `gcloud` CLI authenticated (`gcloud auth application-default login`)

### Local Development

```bash
# 1. Clone
git clone https://github.com/arjunmangarath/promptwars-travel-engine
cd promptwars-travel-engine

# 2. Install
npm install

# 3. Configure
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
GOOGLE_CLOUD_PROJECT=your-gcp-project-id
GEMINI_API_KEY=your-api-key-from-ai-studio   # optional if using Vertex AI ADC
```

```bash
# 4. Run
npm run dev         # http://localhost:3000

# 5. Test
npm test

# 6. Build
npm run build
```

### Deploy to Cloud Run

```bash
gcloud run deploy travel-planning-engine \
  --source . \
  --region asia-south1 \
  --memory 512Mi \
  --timeout 300 \
  --allow-unauthenticated \
  --project YOUR_PROJECT_ID
```

> **Important:** Set `--timeout 300`. Default 60s causes 504 errors on Gemini calls.

---

## 🗂️ Project Structure

```
src/
├── app/
│   ├── page.tsx                 # Main UI — form + slideshow results
│   ├── api/plan/route.ts        # Core API — validate → cache → Gemini → store
│   └── api/health/route.ts      # Health check listing all 6 Google services
├── components/
│   ├── ItineraryView.tsx        # Day slideshow, per-day map, activities
│   ├── TripForm.tsx             # Form with interest tags + custom interest input
│   └── ErrorBoundary.tsx        # React error boundary with retry
├── lib/
│   ├── gemini.ts                # Vertex AI + API key fallback, sanitizeForPrompt
│   ├── cache.ts                 # Firestore cache with SHA-256 key + TTL
│   ├── calendar.ts              # Google Calendar URL builders
│   ├── analytics.ts             # Firebase Analytics events
│   ├── errors.ts                # Custom error hierarchy
│   ├── logger.ts                # Structured JSON logging (Cloud Run)
│   └── env.ts                   # Centralised env access
├── middleware.ts                # Edge rate limiter
└── __tests__/                   # 137 tests across 8 suites
```

---

## 🧰 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict mode) |
| AI | Google Gemini 2.5 Flash via Vertex AI |
| Cache | Firebase Firestore |
| Analytics | Firebase Analytics |
| Maps | Google Maps Embed API |
| Calendar | Google Calendar URL Scheme |
| Deploy | Google Cloud Run |
| Validation | Zod |
| Styling | Tailwind CSS |
| Testing | Jest + ts-jest + Testing Library |

---

## 🌐 Live Demo

**[travel-planning-engine-296722128306.asia-south1.run.app](https://travel-planning-engine-296722128306.asia-south1.run.app)**

---

## 🏆 Recognition

**Winner — PromptWars Bengaluru 2026**  
Build with AI · Google for Developers · 8 May 2026  
*Ultimate PromptWarrior — Pitching Arena*

---

## 📄 License

MIT
