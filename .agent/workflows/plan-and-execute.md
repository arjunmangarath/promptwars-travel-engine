# /plan-and-execute — Atomic Feature Workflow

## Phase 1: Plan
1. Read STATE.md and PLAN.md for current context
2. Generate `implementation_plan.md` — stack, architecture, affected files
3. STOP — wait for human review and feedback injection
4. Generate atomic Task List from approved plan

## Phase 2: Execute
5. Execute ONE task at a time in isolation
6. After each task: run tests, capture screenshot if UI changed
7. Atomic commit per task with conventional commit message
8. Update STATE.md with completed task and any decisions made

## Phase 3: Verify
9. Run full test suite
10. Generate `walkthrough.md` with proof of functionality
11. Only mark phase complete when walkthrough is written
