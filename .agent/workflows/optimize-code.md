# /optimize-code — Code Optimization Workflow

## Process
1. Read the target file(s)
2. Analyze time complexity using Big O notation
3. Identify: nested loops, redundant variable assignments, unnecessary re-renders, N+1 queries
4. Flatten nested loops where possible
5. Remove dead code and redundant assignments
6. Propose changes as a diff — wait for approval before applying
7. After applying: run tests to confirm no regressions

## Rules
- Never sacrifice correctness for speed
- Document any non-obvious optimization with a one-line comment explaining the WHY
- Always measure before and after if benchmarking is feasible
