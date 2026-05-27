# Contributing to @mitumba/sdk

This is the Mitumba API SDK. Read this fully before writing a single line of code. A bug here breaks the entire platform (Web, Admin, and Mobile).

---

## Mindset

The SDK is the **public contract** of the Mitumba platform. It must be resilient, perfectly typed, and provide a flawless Developer Experience (DX). Frontend developers using this SDK should not need to guess what an endpoint returns or how to format a payload.

Design with these principles in mind:
-   **Predictability:** Endpoints should follow a consistent naming convention (`getListing`, `createOrder`, `listStores`).
-   **Resilience:** The SDK must gracefully handle network failures, malformed JSON, and unexpected 500s from the workers.
-   **No Leaks:** Never leak Cloudflare-specific or backend-specific implementation details into the frontend through the SDK interface.

---

## Branch strategy

We use the GitHub Flow.

```
main
  └── feat/auth-module
  └── feat/vazi-integration
  └── fix/token-refresh-race-condition
  └── chore/update-types
  └── agent/feat-core-client
```

**Rules:**
-   Branch from `main` always.
-   One module or specific fix per branch.
-   Lowercase, hyphenated names only.
-   `main` is protected — PRs required, no direct pushes.

---

## Pull Request Process

### Before opening

-   [ ] `npm run typecheck` — zero errors.
-   [ ] `npm run test` — all tests pass.
-   [ ] `npm run build` — package builds cleanly using `tsup` or `tsc`.
-   [ ] No `console.log` statements left behind.

### Review rules

-   Minimum 1 approval before merge.
-   Stanley approves all major architectural changes.
-   Squash merge into `main`.

---

## SDK Authoring Standards

### File structure

```
src/
├── index.ts           # Main export (the SDK class and types)
├── client.ts          # Core fetch wrapper, APIError class
├── types.ts           # Shared interfaces
└── modules/
    ├── auth.ts
    ├── listings.ts
    └── ...
```

### The Core Client (`client.ts`)

The core client must handle:
1.  **Base URL mapping**
2.  **Authorization headers** (Bearer JWT)
3.  **Error wrapping** (Converting 4xx/5xx responses into typed `APIError` objects)

### Module Structure

Every domain must be a separate class or namespace attached to the main `MitumbaClient`.

```typescript
// src/modules/listings.ts
import { APIClient } from '../client';
import type { Listing } from '../types';

export class ListingsModule {
  constructor(private client: APIClient) {}

  async getListing(id: string): Promise<Listing> {
    return this.client.get<Listing>(`/api/listings/${id}`);
  }
}
```

### Types

All types should ultimately derive from the `@mitumba/types` package if possible, or be strictly defined in `src/types.ts`. Do not use `any` unless absolutely necessary (and even then, prefer `unknown`).

---

## Testing Requirements

We use `vitest` for testing.

-   **Unit Tests:** Every module method must be tested.
-   **Mocking:** Use `msw` (Mock Service Worker) or `vitest` fetch mocks to intercept requests and simulate backend responses.
-   **Error Paths:** You MUST test how the SDK behaves when the API returns a 400, 401, 403, and 500.

---

## For Agent Sessions (Claude Code)

If you are a Claude Code agent reading this:

1.  **Read `AGENTS.md` first** — it is your primary instruction file.
2.  **Read `ROADMAP.md`** — to understand what phase of the SDK we are currently building.
3.  **One module per branch** — `agent/feat-auth-module`, `agent/feat-listings-module`.
4.  **Run before every commit:** `npm run typecheck` + `npm run test` + `npm run build`.
5.  **Strict Typing:** Never use `any`.
6.  **Atomic Commits:** Make frequent, atomic commits for every logical step.
