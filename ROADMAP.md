# @mitumba/sdk — Roadmap

This roadmap defines the implementation phases for the Mitumba SDK. Each phase must be completed and verified before moving to the next.

See [`API_REFERENCE.md`](./API_REFERENCE.md) for the exact endpoint shapes each module wraps.

---

## Phase 1: Core Foundation
**Status: ✅ Complete** (v0.2.0)

1.  Initialize `package.json` with `tsup`, `vitest`, and TypeScript.
2.  Setup `tsconfig.json` for isomorphic library compilation (ESM + CJS).
3.  Implement `APIError` class with `code`, `message`, `status`, `details`.
4.  Implement the base `APIClient` fetch wrapper (`get`, `post`, `put`, `patch`, `delete`).
5.  Implement automatic token refresh interceptor (retry on 401).
6.  Implement the `MitumbaClient` entry point class with config.
7.  Write tests for `APIClient` and `APIError`.

**Exit criteria:** ✅ `MitumbaClient` can be instantiated and raw fetch calls work with error handling.

---

## Phase 2: Auth Module
**Status: ✅ Complete** (v0.2.0)

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

**Exit criteria:** ✅ Full auth flow works — register, login, OTP, refresh, logout — with all error codes tested.

---

## Phase 3: Listings & Search
**Status: ✅ Complete** (v0.2.0)

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

**Exit criteria:** ✅ Browse, search, and listing CRUD work. Seller storefronts and categories load correctly.

---

## Phase 4: Orders & Pay
**Status: ✅ Complete** (v0.2.0)

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

**Exit criteria:** ✅ Full purchase flow works — create order → pay → track status. Order lifecycle transitions tested.

---

## Phase 5: Vazi (AI Outfits)
**Status: ✅ Complete** (v0.2.0)

1.  Define vazi types: `VAZIOutfit`, `VAZIOutfitItem`, `GarmentType`, `StyleTier`, `VaziFeedParams`.
2.  Implement `VaziModule`:
    -   `getFeed(params?)` — browse AI-assembled outfits
    -   `completeOutfit(listingId)` — get outfit built around a listing
3.  Write tests for both methods.
4.  Wire to `MitumbaClient`.

**Exit criteria:** ✅ Outfit feed loads and outfit completion works for eligible listings.

---

## Phase 6: CI/CD & Publishing
**Status: ✅ Complete** (v0.2.0)

1.  Setup GitHub Actions workflow:
    -   `typecheck` + `test` + `build` on every PR
    -   Coverage reporting
2.  Setup automated NPM publishing:
    -   Changesets for versioning
    -   OIDC provenance publishing via GitHub Actions
3.  Add `exports` field to `package.json` for ESM/CJS dual publishing.
4.  Create comprehensive `README.md` with installation, quick start, and API overview.

**Exit criteria:** ✅ SDK is live on npm as `@mitumba/sdk`, CI passes on every PR, and publishing is automated.

---

## Phase 7: DX Polish
**Status: ✅ Complete** (v0.2.0)

1.  ✅ Add request/response logging in development mode (`debug: true`).
2.  ✅ Add request abort/cancellation support via `AbortController`.
3.  ✅ Add retry logic with exponential backoff for 5xx errors (`maxRetries`).

---

## Phase 8: Marketplace Features (Post-Launch)
**Status: ✅ Complete** (v0.4.0 – v0.24.0)

Additional modules built beyond the original roadmap to support the full marketplace experience:

| Version | Module | Features |
|---|---|---|
| v0.4.0 | `auth` | `forgotPassword()`, `resetPassword()` |
| v0.5.0 | `auth` | `me()` — get current user profile |
| v0.6.0 | `messages` | Conversations, threads, send messages |
| v0.7.0 | `notifications` | List (paginated + unread count), mark read |
| v0.8.0 | `stores` | Get by slug, follow/unfollow, store listings |
| v0.9.0 | `reviews` | List store reviews, create review |
| v0.10.0 | `listings` | `getSimilar()` — related listings |
| v0.11.0 | `wishlists` | Save/unsave listings |
| v0.12.0 | `messages` | Store-scoped inboxes |
| v0.13.0 | `search` | Search history (get/save) |
| v0.14.0 | `cart` | Cart CRUD + multi-store checkout |
| v0.15.0 | `pay` | Paystack support + `initMpesa()` alias |
| v0.16.0 | `auth` | `completeOnboarding()` |
| v0.17.0 | `settings` | Full account settings (profile, security, addresses, payment methods, linked accounts) |
| v0.18.0 | `auth`/`settings` | 2FA TOTP support |
| v0.19.0 | `mailer` | 39 typed transactional email templates |
| v0.20.0 | `auth` | Email verification |
| v0.21.0–v0.24.0 | `stores` | `getMyStores()`, `create()`, `update()`, `getStats()`, `getSettings()`/`updateSettings()`, `getAnalytics()` |

---

## Current State (v0.24.0)

The SDK is feature-complete with **14 modules**:

```
sdk.auth          sdk.listings      sdk.search        sdk.orders
sdk.pay           sdk.vazi          sdk.messages      sdk.notifications
sdk.stores        sdk.reviews       sdk.wishlists     sdk.cart
sdk.settings      sdk.mailer
```

All modules have full test coverage and the SDK is published to npm with automated CI/CD.
