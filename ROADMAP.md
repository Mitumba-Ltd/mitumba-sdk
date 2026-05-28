# @mitumba/sdk — Roadmap

This roadmap defines the implementation phases for the Mitumba SDK. Each phase must be completed and verified before moving to the next.

See [`API_REFERENCE.md`](./API_REFERENCE.md) for the exact endpoint shapes each module will wrap.

---

## Phase 1: Core Foundation
**Status: Not Started**

1.  Initialize `package.json` with `tsup`, `vitest`, and TypeScript.
2.  Setup `tsconfig.json` for isomorphic library compilation (ESM + CJS).
3.  Implement `APIError` class with `code`, `message`, `status`, `details`.
4.  Implement the base `APIClient` fetch wrapper (`get`, `post`, `put`, `patch`, `delete`).
5.  Implement automatic token refresh interceptor (retry on 401).
6.  Implement the `MitumbaClient` entry point class with config.
7.  Write tests for `APIClient` and `APIError`.

**Exit criteria:** `MitumbaClient` can be instantiated and raw fetch calls work with error handling.

---

## Phase 2: Auth Module
**Status: Not Started**

1.  Define auth types: `TokenResponse`, `LoginInput`, `RegisterInput`, `OtpVerifyInput`, etc.
2.  Implement `AuthModule`:
    -   `register(input)` — dual-mode (email+password / phone OTP)
    -   `login(input)` — dual-mode
    -   `sendOtp(phone)`
    -   `verifyOtp(phone, code)`
    -   `refresh(refreshToken)`
    -   `logout(refreshToken)`
3.  Write tests for all auth methods (including OTP flow and error paths).
4.  Wire `AuthModule` to `MitumbaClient` as `sdk.auth`.

**Exit criteria:** Full auth flow works — register, login, OTP, refresh, logout — with all error codes tested.

---

## Phase 3: Listings & Search
**Status: Not Started**

1.  Define listing types: `Listing`, `ListingImage`, `CreateListingInput`, `ListingsFeedParams`, `Category`, `City`, `SellerStorefront`, etc.
2.  Implement `ListingsModule`:
    -   `getFeed(params?)` — paginated feed with filters
    -   `getById(id)` — single listing with images
    -   `create(input)` — create listing (seller only)
    -   `update(id, input)` — update listing
    -   `updateStatus(id, status)` — status transition
    -   `delete(id)` — soft delete
    -   `getSellerStorefront(sellerId, params?)` — seller's listings
    -   `getCategories()` — list categories
    -   `getCities()` — list cities
    -   `presignImage(listingId, index)` — image upload slot
3.  Define search types: `SearchParams`, `SearchResult`, `TrendingTerm`.
4.  Implement `SearchModule`:
    -   `search(params)` — full-text search with filters
    -   `getTrending(cityId?)` — trending search terms
5.  Write tests for both modules.
6.  Wire both to `MitumbaClient`.

**Exit criteria:** Browse, search, and listing CRUD work. Seller storefronts and categories load correctly.

---

## Phase 4: Orders & Pay
**Status: Not Started**

1.  Define order types: `Order`, `OrderEvent`, `OrderStatus`, `CreateOrderInput`, `OrderHistoryParams`.
2.  Implement `OrdersModule`:
    -   `create(input)` — create order from listing
    -   `getById(id)` — order details with event timeline
    -   `transition(id, status, note?)` — change order status
    -   `getHistory(params?)` — paginated order history (buyer/seller view)
3.  Define pay types: `StkPushInput`, `StkPushResponse`, `PaymentStatus`.
4.  Implement `PayModule`:
    -   `initiateStkPush(input)` — trigger M-Pesa STK Push
    -   `getStatus(orderId)` — poll payment status
5.  Write tests for both modules (including order state machine transitions).
6.  Wire both to `MitumbaClient`.

**Exit criteria:** Full purchase flow works — create order → pay → track status. Order lifecycle transitions tested.

---

## Phase 5: Vazi (AI Outfits)
**Status: Not Started**

1.  Define vazi types: `VAZIOutfit`, `VAZIOutfitItem`, `GarmentType`, `StyleTier`, `VaziFeedParams`.
2.  Implement `VaziModule`:
    -   `getFeed(params?)` — browse AI-assembled outfits
    -   `completeOutfit(listingId)` — get outfit built around a listing
3.  Write tests for both methods.
4.  Wire to `MitumbaClient`.

**Exit criteria:** Outfit feed loads and outfit completion works for eligible listings.

---

## Phase 6: CI/CD & Publishing
**Status: Not Started**

1.  Setup GitHub Actions workflow:
    -   `typecheck` + `test` + `build` on every PR
    -   Coverage reporting
2.  Setup automated NPM publishing:
    -   Publish on tag push (`v*`)
    -   Generate changelog from conventional commits
3.  Add `exports` field to `package.json` for ESM/CJS dual publishing.
4.  Create comprehensive `README.md` with installation, quick start, and API overview.

**Exit criteria:** SDK is live on npm as `@mitumba/sdk`, CI passes on every PR, and publishing is automated.

---

## Phase 7: Polish & DX (Post-Launch)
**Status: Not Started**

1.  Add request/response logging in development mode.
2.  Add request abort/cancellation support via `AbortController`.
3.  Add retry logic with exponential backoff for 5xx errors.
4.  Add TypeScript playground examples.
5.  Consider generating types from the backend Zod schemas (shared types package).
