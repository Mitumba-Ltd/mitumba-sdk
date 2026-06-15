# @mitumba/sdk

## 0.24.0

### Minor Changes

- f5f1b3a: Add `sdk.stores.getAnalytics(storeId, period?)` — get store analytics with revenue, orders breakdown, traffic sources, top listings, geography, and STI trend (GET /listings/stores/:storeId/analytics).

  New exported type: `StoreAnalytics`

## 0.23.0

### Minor Changes

- e4ad6d1: Add store settings to `sdk.stores`:

  - `getSettings(storeId)` — get full store settings (GET /listings/stores/:storeId/settings)
  - `updateSettings(storeId, input)` — partial update settings (PUT /listings/stores/:storeId/settings)

  New exported type: `StoreSettings`

  Also fixes duplicate type definitions in stores types file.

## 0.22.0

### Minor Changes

- 69c2478: Add store management methods to `sdk.stores`:

  - `update(storeId, input)` — update store details (PUT /listings/stores/:storeId)
  - `getStats(storeId)` — get store statistics (GET /listings/stores/:storeId/stats)

  New exported types: `UpdateStoreInput`, `StoreStats`

## 0.21.0

### Minor Changes

- 7e60d9f: Add store management to `sdk.stores`:

  - `getMyStores()` — get all stores owned by the authenticated user (GET /listings/stores/mine)
  - `create(input)` — create a new store (POST /listings/stores)

  New exported type: `CreateStoreInput`

## 0.20.1

### Patch Changes

- 7538302: Update `sendVerificationCode(email?)` and `verifyEmail(code, email?)` to support unauthenticated flows by accepting an optional email parameter.

## 0.20.0

### Minor Changes

- 5a0d2a3: Add email verification to `sdk.auth`:

  - `sendVerificationCode()` — send 6-digit code to user's email (POST /auth/verify-email/send)
  - `verifyEmail(code)` — confirm email with code (POST /auth/verify-email/confirm)
  - `UserProfile` now includes `email_verified: boolean`

## 0.19.0

### Minor Changes

- ec2f56b: Add `sdk.mailer` module for sending transactional emails via the notifications worker:

  - `send(template, input)` — POST /notify/email

  39 strongly-typed template names: `welcome`, `email-verification`, `password-reset`, `new-login`, `2fa-enabled`, `2fa-disabled`, `account-suspended`, `order-created`, `order-confirmed`, `order-shipped`, `order-delivered`, `order-cancelled`, `seller-new-order`, `seller-ship-reminder`, `payment-success`, `payment-failed`, `payout-complete`, `new-message`, `store-created`, `listing-sold`, `review-received`, `price-drop`, `weekly-digest`, `session-revoked`, `password-changed`, `linked-account-connected`, `seller-onboarding-complete`, `store-follower`, `listing-expired`, `vazi-outfit-match`, `seller-payout-failed`, `offer-received`, `offer-accepted`, `cart-abandoned`, `wishlist-back-in-stock`, `order-disputed`, `dispute-resolved`, `address-changed`, `payment-method-added`

  New exported types: `MailerTemplate`, `SendEmailInput`

## 0.18.1

### Patch Changes

- c78fe50: Add optional `remember` field to `EmailLoginInput` — controls refresh token TTL (180 days vs 7 days).

## 0.18.0

### Minor Changes

- c271f32: Add 2FA (TOTP) support:

  - `sdk.auth.login()` now returns `TwoFactorRequired` when 2FA is enabled
  - `sdk.auth.verify2FA(input)` — verify TOTP code during login (POST /auth/2fa/login)
  - `sdk.settings.setup2FA()` — get secret + QR URI (POST /auth/2fa/setup)
  - `sdk.settings.verify2FA(code)` — confirm setup, receive backup codes (POST /auth/2fa/verify)
  - `sdk.settings.disable2FA(code)` — disable 2FA (POST /auth/2fa/disable)

  New exported types: `TwoFactorRequired`, `Verify2FAInput`

## 0.17.0

### Minor Changes

- 2a3656d: Add `sdk.settings` module covering all user account settings:

  - **Profile**: `getProfile()`, `updateProfile(input)`
  - **Security**: `changePassword(input)`, `getSessions()`, `revokeSession(id)`
  - **Notification Prefs**: `getNotificationPrefs()`, `updateNotificationPref(channel, enabled)`
  - **Preferences**: `getPreferences()`, `updatePreferences(prefs)`
  - **Addresses**: `getAddresses()`, `addAddress(input)`, `updateAddress(id, input)`, `deleteAddress(id)`, `setDefaultAddress(id)`
  - **Payment Methods**: `getPaymentMethods()`, `addPaymentMethod(input)`, `deletePaymentMethod(id)`, `setDefaultPaymentMethod(id)`
  - **Linked Accounts**: `getLinkedAccounts()`, `linkAccount(provider, token)`, `unlinkAccount(provider)`

  Also adds optional `device` param to `EmailLoginInput` and `EmailRegisterInput` for session tracking.

  New exported types: `UpdateProfileInput`, `ChangePasswordInput`, `Session`, `NotificationPref`, `Address`, `AddAddressInput`, `PaymentMethod`, `AddPaymentMethodInput`, `PaymentMethodType`, `LinkedAccount`, `LinkedAccountProvider`

## 0.16.0

### Minor Changes

- 2588e72: Add `sdk.auth.completeOnboarding(input)` — completes the user onboarding flow (POST /auth/onboarding/complete).

  New exported type: `CompleteOnboardingInput`

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
