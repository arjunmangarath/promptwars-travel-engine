# STATE.md — Source of Truth

> Update this file after every completed task. New agents read this to orient themselves.

## Event
PromptWars Bengaluru 2026 — May 8, 2026 @ Google Office, Bagmane Capital Park
Prize: INR 50,000

## Scoring (AUTOMATED — platform reads code, not humans)
Scored on ALL of these — every one matters:
1. **Code Quality** — clean, typed, no dead code
2. **Security** — no hardcoded secrets, input validation, safe deps
3. **Efficiency** — Big O, no N+1, no unnecessary re-renders
4. **Testing** — actual tests must exist and pass
5. **Accessibility** — semantic HTML, ARIA labels, keyboard nav
6. **Problem Statement Alignment** — must match challenge brief
7. **Google Services Usage** — use multiple Google services, not just Cloud Run

## All Surprise Rewards — Full List

### Speed/Score Rewards
| Reward | Trigger | Target? |
|--------|---------|---------|
| **First Ping** | First successful Cloud Run submission | Secondary — deploy early |
| **Orbital** | First to score 90+ | YES |
| **One Shot** | 85+ on 1st attempt | **PRIMARY TARGET** |
| **The Comeback** | Biggest jump Sub 1 → Sub 3 | Fallback only |
| **All-In** | 3rd submission risk | Only if desperate |

### Category Dominance Rewards (highest score per category)
| Reward | Category | Action |
|--------|----------|--------|
| **Clean Coder** | Code Quality | TypeScript, clean arch, no dead code |
| **Inclusive Icon** | Accessibility | Max ARIA, keyboard nav, semantic HTML — **TARGET** |
| **Cyber Sentinel** | Security | Secret Manager, CSP headers, input validation — **TARGET** |
| **Algorithm Ace** | Efficiency | Big O, no N+1, lazy loading |
| **Google Cloud Guru** | Most Google Services | Pile on: Cloud Run + Firestore + Firebase Auth + Vertex AI + Secret Manager + Storage |

### FREE Behavioral Rewards (grab these with zero code effort)
| Reward | Trigger | Do it NOW |
|--------|---------|-----------|
| **Human FAQ** | Most questions asked to organizers | Ask questions all day — start now |
| **Social Node** | Best live build thread on social | Start Twitter/LinkedIn thread NOW |
| **Team Player** | Help a neighbor with Git/env issue | Look around and offer help |
| **Top 10** | Final leaderboard top 10 | Comes from score |
| **The Final Patch** | Last check-in at venue | Already done on arrival |

### Winning Stack: Maximum Google Services = Google Cloud Guru
Use ALL of these:
1. Cloud Run (mandatory)
2. Firestore (database)
3. Firebase Auth (authentication)
4. Vertex AI / Gemini API (AI feature)
5. Secret Manager (env vars — also boosts Security score)
6. Cloud Storage (if any file uploads needed)

### Target: ONE SHOT (85+) + ORBITAL (90+) + INCLUSIVE ICON + CYBER SENTINEL + GOOGLE CLOUD GURU + HUMAN FAQ + SOCIAL NODE
Build right the first time. Max Google services. Ask questions. Post live thread.

## Hard Constraints (DQ triggers)
- Cloud Run deployed link MUST be live and working — DQ if broken even in Top 10
- Only FINAL submission score counts — best attempt is NOT used
- Warm-up scores don't count toward leaderboard
- Top 10 = Leaderboard score + working Cloud Run URL

## Mandatory Stack Elements
- Deployment: **Google Cloud Run** (non-negotiable — DQ otherwise)
- Must use Google services (Firebase, Firestore, Vertex AI, Maps, etc.)

## Challenge (WARM-UP)
- Problem statement: Travel Planning & Experience Engine
- Brief: Plan trips dynamically with preferences, constraints, and real-time updates
- GCP Project: promptwars-live

## Stack Decision (LOCKED)
- Frontend: Next.js 14 App Router + TypeScript + Tailwind CSS
- AI: Gemini API (@google/generative-ai) — structured itinerary generation
- Database: Firestore — real-time trip sync
- Auth: Firebase Auth (Google Sign-in)
- Deployment: Google Cloud Run
- Secrets: Secret Manager (boosts Security score)
- Extra services: Maps Places API (location data)

## Environment Variables
<!-- List names only — never values -->
- TBD

## Completed Tasks
<!-- Append as tasks complete -->
- [ ] Challenge revealed
- [ ] Stack decided
- [ ] Phase 1 planned
- [ ] Phase 1 executed
- [ ] Phase 1 verified

## Active Bugs
<!-- Track here so new agents don't re-introduce fixes -->

## Architectural Decisions
<!-- Document the WHY behind key choices -->
