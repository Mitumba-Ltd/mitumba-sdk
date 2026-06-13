# @mitumba/sdk

## 0.15.0

### Minor Changes

- b22352e: Add Paystack support to `sdk.pay`:

  - `initMpesa(input)` — M-Pesa STK Push (alias for initiateStk)
  - `initPaystack(input)` — Paystack inline payment (POST /pay/paystack/init)

  New exported types: `MpesaInput`, `PaystackInput`, `PaystackInitResponse`

## 0.14.0

### Minor Changes

- f360689: Add `sdk.cart` module:

  - `list()` — get cart items (GET /listings/cart)
  - `add(listingId)` — add to cart (POST /listings/cart/:listingId)
  - `remove(listingId)` — remove from cart (DELETE /listings/cart/:listingId)
  - `checkout()` — create orders from cart grouped by store (POST /orders/checkout)

  New exported type: `CartItem`

## 0.13.0

### Minor Changes

- cb85f2e: Add search history to `sdk.search`:

  - `getHistory()` — get user's recent searches (GET /search/history)
  - `saveHistory(input)` — save a search query (POST /search/history)

  New exported types: `SearchHistoryItem`, `SaveSearchInput`

## 0.12.0

### Minor Changes

- 873d17e: Update `sdk.messages` for store-scoped inboxes:

  - `list(storeId?)` — optional `storeId` param to filter by store inbox
  - `getThread(partnerId, storeId?)` — optional `storeId` param for store context
  - `Conversation` type now includes `listing_title` field

## 0.11.0

### Minor Changes

- 8df05a4: Add `sdk.wishlists` module:

  - `list()` — get saved listings (GET /listings/wishlists)
  - `add(listingId)` — save a listing (POST /listings/wishlists/:listingId)
  - `remove(listingId)` — unsave a listing (DELETE /listings/wishlists/:listingId)

  New exported type: `WishlistListing`

## 0.10.0

### Minor Changes

- 26fb9e1: Add `sdk.listings.getSimilar(listingId, mode?)` — fetches up to 8 similar listings (GET /listings/:id/similar).

  New exported type: `SimilarListing`

## 0.9.1

### Patch Changes

- e171e73: - Fix `stores.getListings()` to use correct path `GET /listings/stores/:storeId/listings`
  - Add `store_id` (required) and `vazi_eligible` (optional) to `CreateListingInput`

## 0.9.0

### Minor Changes

- 93c6eb7: Add `sdk.reviews` module:

  - `list(storeId, page?)` — list store reviews with avg rating (GET /listings/stores/:storeId/reviews)
  - `create(storeId, input)` — create a review (POST /listings/stores/:storeId/reviews)

  New exported types: `Review`, `CreateReviewInput`

## 0.8.0

### Minor Changes

- 5ede442: Add `sdk.stores` module:

  - `getBySlug(slug)` — get store by URL slug (GET /listings/stores/:slug)
  - `follow(storeId)` — follow a store (POST /listings/stores/:storeId/follow)
  - `unfollow(storeId)` — unfollow a store (DELETE /listings/stores/:storeId/follow)
  - `getListings(storeId, page?)` — get store's listings (GET /listings?store_id=...)

  Add convenience methods to `sdk.listings`:

  - `feed(params?)` — browse listing feed with simplified params
  - `get(id)` — alias for getById
  - `search(params)` — full-text search with filters

  New exported types: `Store`, `SubscriptionTier`

## 0.7.0

### Minor Changes

- fd81e62: Add `sdk.notifications` module:

  - `list(page?)` — list paginated notifications with unread count (GET /notify/notifications)
  - `markRead(ids?)` — mark specific or all notifications as read (POST /notify/notifications/read)

  New exported types: `Notification`, `NotificationType`

## 0.6.0

### Minor Changes

- cf95d40: Add `sdk.messages` module for in-app messaging:

  - `list()` — list all conversations (GET /notify/messages)
  - `getThread(partnerId)` — get message thread with a partner (GET /notify/messages/:partnerId)
  - `send(input)` — send a message (POST /notify/messages)

  New exported types: `Conversation`, `Message`, `SendMessageInput`

## 0.5.0

### Minor Changes

- dbcd56a: Add `sdk.auth.me()` method to fetch the current authenticated user's profile (GET /auth/me).

  New exported type: `UserProfile`

## 0.4.0

### Minor Changes

- 45f9211: Add password reset flow to auth module:

  - `forgotPassword({ email })` — sends a password reset link to the given email (POST /auth/forgot-password)
  - `resetPassword({ token, password })` — resets the password using the token from the reset email (POST /auth/reset-password)

  New exported types: `ForgotPasswordInput`, `ResetPasswordInput`

## 0.3.0

### Minor Changes

- 6bf553c: Align all module methods with the SDK contract:

  - **auth**: `refresh()` and `logout()` now accept `{ refresh_token }` object input
  - **listings**: `getById()` returns `Listing & { images: ListingImage[] }`, `updateStatus()` returns `{ ok, status }`, `PresignImageResponse` uses `r2_key`
  - **search**: Renamed `search()` → `query()`, `getTrending()` → `trending(params?)`
  - **orders**: `getById()` returns `Order & { events: OrderEvent[] }`, `transition()` returns `{ ok, status }`
  - **pay**: Renamed `initiateStkPush()` → `initiateStk()`
  - **vazi**: Renamed `completeOutfit()` → `getCompleteLook()`
  - **client**: Added `getToken()` utility method

## 0.2.0

### Minor Changes

- 096b260: Initial release of the fully isomorphic TypeScript SDK for the Mitumba marketplace platform!

  Includes:

  - Dual-mode Authentication (Email/Password & OTP)
  - Listings Management & Feeds
  - AI-powered Search
  - Orders and Checkout Flows
  - M-Pesa STK Push Integration
  - Vazi AI Outfit Engine
  - Automatic Token Rotation
  - Exponential Backoff & Request Cancellation
