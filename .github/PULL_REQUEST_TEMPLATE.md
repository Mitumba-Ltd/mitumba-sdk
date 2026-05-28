## What does this PR do?

<!-- One paragraph. What was the problem and what does this change do about it? -->

## Type of change

- [ ] `feat` — new feature
- [ ] `fix` — bug fix
- [ ] `refactor` — no behavior change
- [ ] `chore` — tooling, deps, config
- [ ] `docs` — documentation only
- [ ] `test` — tests only

## Module Scope

- [ ] `Core Client` (`client.ts`, `index.ts`)
- [ ] `Types` (`types.ts`)
- [ ] `Auth`
- [ ] `Listings`
- [ ] `Search`
- [ ] `Orders`
- [ ] `Pay`
- [ ] `Vazi`

## Checklist

- [ ] `npm run typecheck` passes
- [ ] `npm test` passes (new tests added for new features)
- [ ] `npm run build` passes
- [ ] No `any` types used
- [ ] No `console.log` left behind
- [ ] Native `fetch` used (no external fetch libraries)
- [ ] No backend implementation details leaked (no CF Workers, D1, KV, R2 references)

## Related issues

<!-- Closes #__ -->

## Questions for review

<!-- Anything architecturally ambiguous you want a human to weigh in on before this merges -->
