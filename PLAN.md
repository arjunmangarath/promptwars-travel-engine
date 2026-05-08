# PLAN.md — Executable Roadmap

> This is not documentation — it is an executable prompt. Run /gsd-execute-phase N to execute.

## TARGET: One Shot (85+) + Orbital (90+)
Build right the first time. Quality > speed on submission.

---

## Phase 0: Challenge Intake (< 5 min after reveal)
- [ ] Paste problem statement into STATE.md
- [ ] Decide stack (Next.js/FastAPI + Firestore + Cloud Run + Vertex AI)
- [ ] Run `/gsd-discuss-phase 1` to lock decisions
- [ ] Start Cloud Run project + enable APIs immediately (parallel to coding)

## Phase 1: Foundation + Deployment Pipeline (target: 30 min)
- [ ] Scaffold with TypeScript — no plain JS
- [ ] Set up Google Cloud Run deployment (Dockerfile + cloudbuild.yaml)
- [ ] Set up Firestore / chosen DB schema
- [ ] Set up env var management (Secret Manager, not .env in code)
- [ ] Deploy skeleton to Cloud Run → claim **First Ping** reward
- [ ] Write smoke tests for core routes

## Phase 2: Core Feature (target: 60-90 min)
<!-- Populated after challenge reveal -->
- [ ] TBD — implement the problem statement solution
- [ ] Integrate Vertex AI / Gemini API if applicable
- [ ] Write unit + integration tests for each feature
- [ ] Add ARIA labels + semantic HTML to every UI component
- [ ] Input validation on every API boundary

## Phase 3: Score Maximization (target: 30 min before deadline)
- [ ] Run `/optimize-code` on all critical paths
- [ ] Accessibility audit — keyboard nav, screen reader, contrast ratios
- [ ] Security sweep — no secrets, parameterized queries, rate limiting
- [ ] Test coverage check — aim for 80%+
- [ ] Re-deploy to Cloud Run and verify live URL works
- [ ] Final submission

## Pre-Submit Scoring Checklist (all must be green)
- [ ] Code Quality: TypeScript, no dead code, conventional commits
- [ ] Security: no hardcoded secrets, all inputs validated, HTTPS
- [ ] Efficiency: no N+1 queries, no unnecessary loops
- [ ] Testing: tests exist and pass
- [ ] Accessibility: ARIA labels, semantic HTML, keyboard navigation
- [ ] Google Services: Cloud Run + at least 1 more (Firestore/Vertex AI/Firebase Auth)
- [ ] Alignment: solution directly addresses every requirement in problem statement
- [ ] Cloud Run URL: live and returning 200 ✅

## Execution Rules
- Each task gets one atomic commit with conventional commit message
- No task marked done without passing tests
- Update STATE.md after each task
- NEVER submit until all checklist items are green
