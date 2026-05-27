# @mitumba/sdk — Roadmap

This roadmap defines the implementation phases for the Mitumba SDK. Agents must follow this progression strictly.

---

## Phase 1: Core Foundation
**Status: Not Started**

1.  Initialize `package.json` with `tsup` and `vitest`.
2.  Setup `tsconfig.json` for isomorphic library compilation.
3.  Implement `APIError` and the base `request` fetch wrapper.
4.  Implement the base `MitumbaClient` class.

## Phase 2: Discovery & Listings
**Status: Not Started**

1.  Implement `ListingsModule` (`getListings`, `getListingById`, `getTrending`).
2.  Implement `SearchModule`.
3.  Implement `VaziModule` (outfit generation, classification).

## Phase 3: Tenant & Storefronts
**Status: Not Started**

1.  Implement `StoresModule` (fetch store profiles, inventory).
2.  Implement Seller Dashboard analytics endpoints.

## Phase 4: Auth & Transactions
**Status: Not Started**

1.  Implement `AuthModule` (login, register, verify OTP).
2.  Implement `OrdersModule` (create cart, checkout STK Push, order history).

## Phase 5: CI/CD & Publishing
**Status: Not Started**

1.  Setup GitHub Actions for automated testing.
2.  Setup automated NPM publishing.
