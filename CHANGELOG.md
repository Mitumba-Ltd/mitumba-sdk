# @mitumba/sdk

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
