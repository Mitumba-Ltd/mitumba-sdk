# @mitumba/sdk — Code Style Guide

Naming conventions, patterns, and standards for the SDK codebase.

---

## Naming Conventions

### Files

| Pattern | Example |
|---|---|
| Module implementation | `src/modules/listings.ts` |
| Module tests | `src/modules/listings.test.ts` |
| Core client | `src/client.ts` |
| Public types | `src/types.ts` |
| Type submodules (if types.ts grows) | `src/types/listings.ts` |

All filenames: **kebab-case**, lowercase only.

### Types & Interfaces

- **PascalCase** for all types: `Listing`, `OrderStatus`, `VAZIOutfit`
- Suffix inputs with `Input`: `CreateListingInput`, `LoginInput`
- Suffix query params with `Params`: `ListingsFeedParams`, `SearchParams`
- Use `type` over `interface` unless extending is needed
- Enums as union types, not TypeScript `enum`:

```typescript
// ✅ Do this
export const CONDITIONS = ['new', 'like_new', 'good', 'fair'] as const
export type Condition = typeof CONDITIONS[number]

// ❌ Not this
export enum Condition { New, LikeNew, Good, Fair }
```

### Methods

| Operation | Prefix | Example |
|---|---|---|
| Fetch single resource | `get*` | `getListing(id)` |
| Fetch collection | `list*` or `get*` | `listOrders(params)`, `getFeed(params)` |
| Full-text search | `search*` | `search(params)` |
| Create resource | `create*` | `createListing(input)` |
| Update resource | `update*` | `updateListing(id, input)` |
| Delete resource | `delete*` | `deleteListing(id)` |
| State transition | `transition*` | `transitionOrder(id, status)` |
| Auth actions | verb | `login()`, `register()`, `verifyOtp()`, `refresh()` |

### Error Codes

- **snake_case**: `invalid_credentials`, `not_found`, `listing_immutable`
- Prefix with domain when ambiguous: `otp_expired`, `otp_invalid`

---

## TypeScript Rules

### Strict Mode

- `strict: true` in tsconfig — **no exceptions**
- `any` is **FORBIDDEN** — use `unknown` and narrow with type guards
- All function return types must be explicit
- All parameters must be typed

### Const Assertions

```typescript
export const ORDER_STATUSES = [
  'created', 'payment_pending', 'paid', 'seller_confirmed',
  'shipped', 'delivered', 'completed', 'cancelled', 'disputed',
] as const

export type OrderStatus = typeof ORDER_STATUSES[number]
```

### Generics

The core client uses generics for type-safe responses:

```typescript
async get<T>(path: string, params?: Record<string, string>): Promise<T>
async post<T>(path: string, body: unknown): Promise<T>
```

### No Default Exports

```typescript
// ✅ Named exports
export class ListingsModule { }
export { MitumbaClient }

// ❌ Default exports
export default class ListingsModule { }
```

---

## Module Pattern

Every domain module follows this structure:

```typescript
import { APIClient } from '../client'
import type {
  Listing,
  CreateListingInput,
  ListingsFeedParams,
  PaginatedResponse,
} from '../types'

export class ListingsModule {
  constructor(private readonly client: APIClient) {}

  /** Fetch the public listing feed with optional filters. */
  async getFeed(params?: ListingsFeedParams): Promise<PaginatedResponse<Listing>> {
    return this.client.get<PaginatedResponse<Listing>>('/listings/feed', params)
  }

  /** Fetch a single listing by ID. */
  async getById(id: string): Promise<Listing> {
    return this.client.get<Listing>(`/listings/${id}`)
  }

  /** Create a new listing (seller only). */
  async create(input: CreateListingInput): Promise<Listing> {
    return this.client.post<Listing>('/listings', input)
  }
}
```

Rules:
1. Constructor takes **only** `APIClient` — no other dependencies
2. All methods are `async` and return typed `Promise`s
3. Methods are thin wrappers — no business logic in the SDK
4. JSDoc on every public method

---

## Test Pattern

Every module file **must** have a co-located `.test.ts` file:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ListingsModule } from './listings'
import type { APIClient } from '../client'

function createMockClient(): APIClient {
  return {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  } as unknown as APIClient
}

describe('ListingsModule', () => {
  let client: APIClient
  let listings: ListingsModule

  beforeEach(() => {
    client = createMockClient()
    listings = new ListingsModule(client)
    vi.clearAllMocks()
  })

  describe('getFeed', () => {
    it('calls GET /listings/feed with params', async () => {
      const mockData = { data: [], total: 0, page: 1, page_size: 20, has_more: false }
      vi.mocked(client.get).mockResolvedValue(mockData)

      const result = await listings.getFeed({ city_id: 'nairobi' })

      expect(client.get).toHaveBeenCalledWith('/listings/feed', { city_id: 'nairobi' })
      expect(result).toEqual(mockData)
    })
  })
})
```

### Required Test Coverage

For every module method, test:
- ✅ Happy path
- ✅ Error paths: `400`, `401`, `403`, `404`, `500`
- ✅ Edge cases: empty results, pagination boundaries
- ✅ Parameter serialization

---

## Import Order

Group imports in this order, separated by blank lines:

1. External packages (`vitest`, etc.)
2. Internal absolute imports (`../client`, `../types`)
3. Type-only imports

```typescript
import { describe, it, expect } from 'vitest'

import { APIClient } from '../client'
import { ListingsModule } from './listings'

import type { Listing, CreateListingInput } from '../types'
```

---

## Comments & Documentation

- **JSDoc** on all public exports
- `@param` and `@returns` for all public methods
- `@throws {APIError}` for methods that can throw
- `@example` for non-obvious usage
- No inline comments for self-explanatory code

```typescript
/**
 * Fetch the public listing feed with optional filters.
 *
 * @param params - Optional filters and pagination
 * @returns Paginated listing results
 * @throws {APIError} On network or server errors
 *
 * @example
 * ```typescript
 * const feed = await sdk.listings.getFeed({
 *   city_id: 'nairobi',
 *   condition: 'like_new',
 *   sort: 'price_asc',
 * })
 * ```
 */
async getFeed(params?: ListingsFeedParams): Promise<PaginatedResponse<Listing>>
```

---

## Git Conventions

### Commit Messages

[Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <description>
```

| Type | When |
|---|---|
| `feat` | New feature or method |
| `fix` | Bug fix |
| `test` | Adding or updating tests |
| `docs` | Documentation only |
| `chore` | Tooling, deps, config |
| `refactor` | No behavior change |

**Scope** = module name or `core`:
```
feat(auth): add OTP verification flow
fix(client): handle 204 No Content responses
test(listings): add error path coverage
chore(deps): bump vitest to 3.x
refactor(core): extract pagination helper
```

**Rules:**
- Present tense, imperative mood: `add` not `added` or `adds`
- Lowercase description
- No period at the end

### Atomic Commits

Commit after each **logical unit of work**. A branch will typically contain multiple commits:

```
feat(types): define Listing and CreateListingInput types
feat(listings): implement ListingsModule with getFeed and getById
test(listings): add unit tests for ListingsModule
feat(client): wire ListingsModule to MitumbaClient
```

**Do NOT** squash an entire module into a single commit. Each commit should be independently reviewable and revertable.
