# @mitumba/sdk

## 1.21.0

### Minor Changes

- c4ebfe0: Add account deletion flow:

  - `sdk.stores.delete(storeId)` — delete a store (blocked if active obligations)
  - `sdk.auth.getDeletionEligibility()` — check if account can be deleted
  - `sdk.auth.requestAccountDeletion()` — send confirmation email
  - `sdk.auth.confirmAccountDeletion({ token, code? })` — confirm deletion (clears session)

  Also: `APIClient.delete()` now supports an optional request body (for DELETE-with-body endpoints).

## 1.20.0

### Minor Changes

- df0b869: Update messages types to match grouped conversation backend:

  - `SendMessageInput`: add optional `order_id`
  - `Conversation`: now grouped per-partner with `partner_name`, `store_name`, `unread_count`
  - `Message`: add optional `order_id`

## 1.19.0

### Minor Changes

- e0c502d: **Self-contained token lifecycle — sessions can no longer silently die:**

  1. `auth.login()`, `auth.register()`, `auth.verifyOtp()`, `auth.verify2FA()` now **auto-persist** tokens internally. Consumers no longer need to call `setToken()` after login.
  2. `auth.logout()` now **auto-clears** the stored session.
  3. `onAuthExpired` now fires on **any 401 with no usable refresh token** — not just on refresh failure. Prevents infinite 401 loops.
  4. `setToken()` guards against empty refresh tokens (treats `""` as missing).
  5. New: `sdk.setSession({ access_token, refresh_token })` — explicit method that requires both tokens.

## 1.18.0

### Minor Changes

- 6854904: Add `sdk.stores.getFollowing(params?)` — list stores the authenticated user follows (GET /listings/stores/following).

  New exported type: `FollowedStore`

## 1.17.0

### Minor Changes

- fa4f435: Add optional `media: string[]` to `Listing`, `SearchResult`, and `WishlistListing` — array of all image CDN URLs ordered by position, enabling swipeable carousels in list views.

## 1.16.0

### Minor Changes

- e4d42b7: Extend `sdk.admin` with 25 new platform management methods (all backends live):

  - **Users**: `listUsers`, `getUser`, `setUserRole`, `revokeUserSessions`
  - **Stores**: `listStores`, `getStore`
  - **Verification**: `listVerifications`, `approveVerification`, `rejectVerification`
  - **STI**: `adjustSti`, `getStiEvents`
  - **Listings**: `listListings`, `removeListing`, `reinstateListing`
  - **Orders**: `listOrders`, `getOrder`, `forceTransitionOrder`
  - **Payouts**: `getPayoutSummary`, `listPayouts`, `disbursePayout`
  - **Metrics**: `getStatsTimeseries`, `getStatsByCity`
  - **Reports**: `listReports`, `resolveReport`
  - **Reviews**: `removeReview`, `reinstateReview`
  - **VAZI**: `listVaziOutfits`, `removeVaziOutfit`, `reinstateVaziOutfit`
  - **Broadcast**: `broadcast`

  Add `sdk.reports` module (user-facing):

  - `create(input)` — flag a listing/review/store/user for admin review (POST /listings/reports)

  New exported types: `AdminUserListItem`, `AdminUserDetail`, `AdminStoreListItem`, `AdminStoreDetail`, `AdminVerificationItem`, `StiEvent`, `AdminListingItem`, `AdminOrderListItem`, `AdminOrderDetail`, `AdminPayoutItem`, `AdminReport`, `AdminVaziOutfit`, `CreateReportInput`

## 1.15.0

### Minor Changes

- df5983b: Add `sdk.uploads.upload(file)` — generic file upload (POST /listings/uploads). Returns `{ url }` with the public CDN URL.

## 1.14.0

### Minor Changes

- 256621f: Add `sdk.disputes` module for order dispute management:

  **Buyer methods:**

  - `raise(orderId, input)` — open a dispute (POST /orders/:orderId/dispute)
  - `getForOrder(orderId)` — get dispute for an order (GET /orders/:orderId/dispute)
  - `get(disputeId)` — get dispute by ID (GET /orders/disputes/:id)
  - `addEvidence(disputeId, input)` — add evidence (POST /orders/disputes/:id/evidence)
  - `escalate(disputeId)` — escalate to admin (POST /orders/disputes/:id/escalate)
  - `withdraw(disputeId)` — withdraw dispute (POST /orders/disputes/:id/withdraw)

  **Seller methods:**

  - `respond(disputeId, input)` — accept or contest (POST /orders/disputes/:id/respond)

  **Admin methods:**

  - `list(params?)` — list all disputes (GET /orders/disputes)
  - `resolve(disputeId, input)` — resolve dispute (POST /orders/disputes/:id/resolve)

  New exported types: `Dispute`, `DisputeEvidence`, `DisputeEvent`, `DisputeReason`, `DesiredResolution`, `DisputeStatus`, `RaiseDisputeInput`, `RespondDisputeInput`, `ResolveDisputeInput`, `DisputeListParams`

## 1.13.0

### Minor Changes

- 826ea36: Add `sdk.admin` module for platform administration (requires admin role):

  - `blockIp(ip, durationHours?)` — block an IP address (POST /admin/block-ip)
  - `unblockIp(ip)` — remove IP block (POST /admin/unblock-ip)
  - `getBlockedIps()` — list blocked IPs (GET /admin/blocked-ips)
  - `getSystemStats()` — platform statistics (GET /admin/stats)
  - `suspendUser(userId, reason)` — suspend account (POST /admin/users/:id/suspend)
  - `unsuspendUser(userId)` — reactivate account (POST /admin/users/:id/unsuspend)
  - `verifyStore(storeId)` — grant verified badge (POST /admin/stores/:id/verify)
  - `unverifyStore(storeId)` — revoke verified badge (POST /admin/stores/:id/unverify)

  New exported types: `BlockedIp`, `SystemStats`

## 1.12.0

### Minor Changes

- 0eaaa6c: Reliable token lifecycle:

  - **IndexedDB token persistence** — tokens survive browser cleanup (falls back to in-memory for Node/Edge)
  - **Proactive refresh** — checks JWT expiry before every request, refreshes if <60s remaining
  - **`onAuthExpired` callback** — fires only when refresh token is truly dead (user needs to re-login)
  - **`sdk.hydrate()`** — restores tokens from IndexedDB on app boot
  - **`sdk.isAuthenticated()`** — checks if a valid session exists in the store

  New exports: `TokenStore` (interface), `MemoryTokenStore`, `IDBTokenStore`, `createTokenStore`

## 1.11.0

### Minor Changes

- aa33622: Add `sdk.cart.updateQuantity(listingId, quantity)` — update cart item quantity (PATCH /listings/cart/:listingId).

## 1.10.0

### Minor Changes

- 44132b3: Add optional `featuring` param to `VaziFeedParams` — filters outfits containing a specific listing ID.

## 1.9.0

### Minor Changes

- 4a44843: Add `sdk.vazi.getOutfit(outfitId)` — get a single outfit with full item details (GET /vazi/outfits/:id).

  New exported types: `VAZIOutfitDetail`, `VAZIOutfitDetailItem`

## 1.8.0

### Minor Changes

- 8e71710: Add `totp_enabled: boolean` to `UserProfile` type — indicates whether the user has 2FA enabled.

## 1.7.0

### Minor Changes

- 2275695: Add `sdk.reviews.getReviewableOrders(storeId)` — returns orders eligible for review (delivered/completed, not yet reviewed). GET /listings/stores/:storeId/reviews/eligible.

  New exported type: `ReviewableOrder`

## 1.6.0

### Minor Changes

- 5960b53: Add to `sdk.messages`:

  - `markRead(partnerId, storeId?)` — mark messages from a partner as read (POST /notify/messages/:partnerId/read)
  - `connectTyping(partnerId)` — connect to typing indicator WebSocket (returns native WebSocket instance)

  Also adds `getBaseUrl()` to `APIClient`.

## 1.5.0

### Minor Changes

- 56413b5: Pre-launch unified update (issue #153):

  - **Orders**: `Order` type now includes `listing_title`, `listing_image_url`, `listing_condition`, `listing_size`, `buyer_name`, `buyer_phone`, and `delivery_address`
  - **Stores**: Add `uploadLogo(storeId, file)` and `uploadBanner(storeId, file)` methods (multipart upload, returns CDN URL)
  - **Listings**: Add `image_url` field to `Listing` type (full CDN URL of first image)

  New exported type: `DeliveryAddress`

## 1.4.0

### Minor Changes

- af08ce5: Update `CartItem` and `WishlistListing` types to match backend response:

  - `CartItem`: replace `image_keys` with `image_url` (full CDN URL), add `delivery_fee`, remove `id`/`added_at`
  - `WishlistListing`: replace `image_keys` with `image_url`, add `size`, remove `store_id`/`category_id`/`city_id`/`status`/`created_at`

## 1.3.0

### Minor Changes

- 32a2307: Add home feed methods to `sdk.listings`:

  - `getTrending(categoryId?)` — trending listings (GET /listings/trending)
  - `getTopStores()` — top stores for home feed (GET /listings/top-stores)
  - `getForYou()` — personalized listings (GET /listings/for-you)

## 1.2.0

### Minor Changes

- 8037ec9: Add `size` field to `Listing` (as `string | null`), `CreateListingInput` (as optional `string`), and `CartItem` (as `string | null`). Also adds `store_slug` to `CartItem`.

## 1.1.0

### Minor Changes

- 684cdd5: Add `sdk.listings.uploadImage(listingId, file, index)` — uploads a listing image directly via multipart/form-data (POST /listings/:id/images/upload). Returns `{ r2_key, image_id, url }`.

## 1.0.0

### Major Changes

- 37b2ef1: **BREAKING:** Update VAZI types to match new backend response:

  - `VAZIOutfitItem` now has `id`, `title`, `price`, `imageUrl` (removed `garment_type`, `seller_id`, `seller_sti`, `seller_city`, `image_url`, `is_seed`, `final_score`, `listing_id`, `price_kes`)
  - `VAZIOutfit` now has `total_price`, `webm_url`, `mp4_url`, `has_video`, `item_count` (removed `total_price_kes`, `sellers_count`, `is_multi_city`, `assembled_at`)
  - Removed `GarmentType` and `GARMENT_TYPES` exports

## 0.30.0

### Minor Changes

- 8b85c83: Add `sdk.businesses` module for managing seller business entities:

  - `getMine()` — get all businesses owned by the current user (GET /listings/businesses/mine)
  - `getById(id)` — get a business by ID (GET /listings/businesses/:id)
  - `update(id, input)` — update a business (PUT /listings/businesses/:id)

  New exported types: `Business`, `UpdateBusinessInput`

## 0.29.0

### Minor Changes

- 797a2db: Add `business_id` to `CreateStoreInput` and `business_name` to `BecomeSellerInput` — links stores to business entities created during seller onboarding.

## 0.28.0

### Minor Changes

- 997cd2a: Add optional `logo_url` and `banner_url` to `CreateStoreInput` — allows passing store images during creation.

## 0.27.0

### Minor Changes

- 0d56e86: Add `sdk.auth.becomeSeller(input)` — upgrades the current user to a seller role (POST /auth/become-seller). Idempotent.

  New exported type: `BecomeSellerInput`

## 0.26.0

### Minor Changes

- 631507c: Add optional `store_id` to `OrderHistoryParams` — allows multi-store sellers to filter order history by store when using `sdk.orders.getHistory({ role: 'seller', store_id })`.

## 0.25.0

### Minor Changes

- f5e2384: Expand `Store` type with fields now returned by the backend:

  - Add `seller_id` — the store owner's user ID
  - Add `tagline`, `category` — store metadata fields
  - Add `city_id` — store's city reference
  - Add `is_verified` — store verification status
  - Add `updated_at` — last update timestamp
  - Add `sti_score` (optional) — seller's STI score (joined on getBySlug)

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
