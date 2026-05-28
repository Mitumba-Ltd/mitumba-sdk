# Contributing to @mitumba/sdk

This is the Mitumba API SDK. Read this fully before writing a single line of code. A bug here breaks the entire platform (Web, Admin, and Mobile).

---

## Mindset

The SDK is the **public contract** of the Mitumba platform. It must be resilient, perfectly typed, and provide a flawless Developer Experience (DX). Frontend developers using this SDK should not need to guess what an endpoint returns or how to format a payload.

Design with these principles in mind:
-   **Predictability:** Methods follow consistent naming (`getFeed`, `createListing`, `transitionOrder`).
-   **Resilience:** The SDK must gracefully handle network failures, malformed JSON, and unexpected 500s.
-   **No Leaks:** Never leak backend implementation details (Cloudflare Workers, D1, KV, R2, etc.) into the SDK interface.
-   **Isomorphic:** Works in Browser, Node.js, and Edge runtimes. Native `fetch` only.

---

## Branch Strategy

We use GitHub Flow.

```
main
  └── feat/auth-module
  └── feat/listings-module
  └── fix/token-refresh-race-condition
  └── chore/update-types
  └── agent/feat-core-client
```

**Rules:**
-   Branch from `main` always.
-   One module or specific fix per branch.
-   Lowercase, hyphenated names only.
-   `main` is protected — PRs required, no direct pushes.
-   **Multiple atomic commits per branch** — don't squash everything into one commit. Each commit should be a logical, reviewable unit (types, implementation, tests, wiring).

---

## Commit Convention

[Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <description>
```

**Types:** `feat`, `fix`, `test`, `docs`, `chore`, `refactor`

**Scopes:** `core`, `client`, `types`, `auth`, `listings`, `search`, `orders`, `pay`, `vazi`, `deps`, `ci`

**Examples:**
```
feat(types): define Order and OrderStatus types
feat(orders): implement OrdersModule with create and getById
test(orders): add unit tests for OrdersModule
feat(client): wire OrdersModule to MitumbaClient
fix(client): handle 204 No Content responses
chore(deps): bump vitest to 3.x
docs(readme): update quick start example
```

---

## Pull Request Process

### Before opening

-   [ ] `npm run typecheck` — zero errors.
-   [ ] `npm run test` — all tests pass (new tests added for new features).
-   [ ] `npm run build` — package builds cleanly with `tsup`.
-   [ ] No `console.log` statements left behind.
-   [ ] No `any` types used.
-   [ ] Native `fetch` used (no external fetch libraries).

### Review rules

-   Minimum 1 approval before merge.
-   Stanley approves all major architectural changes.
-   Squash merge into `main`.

---

## SDK Authoring Standards

### File Structure

```
src/
├── index.ts           # Main export (MitumbaClient class + re-exports)
├── client.ts          # Core fetch wrapper, APIError class
├── types.ts           # All public types and interfaces
├── types/             # (optional) Type submodules if types.ts grows
│   ├── listings.ts
│   ├── orders.ts
│   └── ...
└── modules/
    ├── auth.ts
    ├── auth.test.ts
    ├── listings.ts
    ├── listings.test.ts
    ├── search.ts
    ├── search.test.ts
    ├── orders.ts
    ├── orders.test.ts
    ├── pay.ts
    ├── pay.test.ts
    ├── vazi.ts
    └── vazi.test.ts
```

### The Core Client (`client.ts`)

The core client must handle:
1.  **Base URL resolution** — prepend configured `baseUrl` to all paths
2.  **Authorization headers** — inject `Bearer <token>` when token is set
3.  **Error wrapping** — convert non-2xx responses into typed `APIError` instances
4.  **Token refresh** — intercept 401s, call refresh, retry the original request
5.  **Query param serialization** — convert objects to URL search params

### Module Structure

Every domain is a separate class attached to `MitumbaClient`:

```typescript
// src/modules/listings.ts
import { APIClient } from '../client'
import type { Listing, CreateListingInput, PaginatedResponse } from '../types'

export class ListingsModule {
  constructor(private readonly client: APIClient) {}

  async getFeed(params?: ListingsFeedParams): Promise<PaginatedResponse<Listing>> {
    return this.client.get<PaginatedResponse<Listing>>('/listings/feed', params)
  }

  async getById(id: string): Promise<Listing> {
    return this.client.get<Listing>(`/listings/${id}`)
  }

  async create(input: CreateListingInput): Promise<Listing> {
    return this.client.post<Listing>('/listings', input)
  }
}
```

### Types

All public types are defined in `src/types.ts`. Types should be derived from the API response shapes documented in `API_REFERENCE.md`. Do not use `any` — use `unknown` and narrow with type guards.

---

## Module Scopes

The SDK covers the following domain modules:

| Module | Class | Description |
|---|---|---|
| **Auth** | `AuthModule` | Registration, login, OTP, token management |
| **Listings** | `ListingsModule` | Feed, CRUD, seller storefronts, categories, cities |
| **Search** | `SearchModule` | Full-text search, trending terms |
| **Orders** | `OrdersModule` | Create, view, transition, history |
| **Pay** | `PayModule` | STK Push, payment status polling |
| **Vazi** | `VaziModule` | AI outfit feed, outfit completion |

---

## Testing Requirements

We use `vitest` for testing.

-   **Unit Tests:** Every module method must be tested.
-   **Mocking:** Mock the `APIClient` methods (`get`, `post`, `put`, `patch`, `delete`). Do not make real HTTP requests in tests.
-   **Error Paths:** You **must** test how the SDK behaves when the API returns `400`, `401`, `403`, `404`, and `500`.
-   **Edge Cases:** Empty results, pagination boundaries, malformed responses.

See [`STYLE_GUIDE.md`](./STYLE_GUIDE.md) for the test boilerplate pattern.

---

## For Agent Sessions

If you are an AI agent reading this:

1.  **Read `AGENTS.md` first** — it is your primary instruction file.
2.  **Read `ROADMAP.md`** — to understand what phase we are building.
3.  **Read `API_REFERENCE.md`** — to know the exact endpoint shapes.
4.  **Read `STYLE_GUIDE.md`** — to follow naming and code patterns.
5.  **One module per branch** — `agent/feat-auth-module`, `agent/feat-listings-module`.
6.  **Multiple atomic commits per branch** — types, implementation, tests, wiring.
7.  **Run before pushing:** `npm run typecheck` + `npm run test` + `npm run build`.
8.  **Strict Typing:** Never use `any`.
