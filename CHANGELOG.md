# @mitumba/sdk

## 5.23.0

### Minor Changes

- 5671894: Categories carry an optional `section` (`'fashion' | 'home'`) and `new_only` flag. New helpers:

  - `categorySection` reads the section, defaulting to fashion;
  - `isNewOnlyCategory` and `isConditionAllowed` check the condition rule;
  - `categoriesBySection` splits a category list by section.

  Creating or editing a listing as used in a new-only category is `409 new_only_category`.

## 5.22.0

### Minor Changes

- c1b615c: Bale orders carry the buyer protection fee: `BaleOrder` gains `bpf_kes` and `amount_due_kes` (the bales' price plus the BPF, what the buyer pays), and `wholesale.createBaleOrder` returns `CreatedBaleOrder` with both.

## 5.21.0

### Minor Changes

- b4103b8: Cart lines carry their availability: `CartItem` gains `quantity`, `status`, `stock_quantity` and `available_quantity` (already returned by `GET /listings/cart`). New helpers `cartLineAvailability`, `isCartLineBuyable` and `partitionCart` classify each line as available, limited, reserved, sold or unavailable, so a client can fix the cart before checkout. `CartItem.delivery_fee` is deprecated: delivery is priced per shop at checkout.

## 5.20.0

### Minor Changes

- fb0f565: Add `sdk.checkouts.create` and `sdk.checkouts.get` with typed `Checkout` totals, including the buyer protection fee (`bpf`, `bpf_total`), and `checkoutRefusal(error)` to read a refusal's details. `APIError` gains `body`, the decoded error body. `cart.checkout()` is deprecated.

## 5.19.0

### Minor Changes

- d994eb2: - New self-service methods for IAM users:
  - `iam.listSessions()` returns this user's live sessions. The one making the request is marked `current`.
  - `iam.endSession(id)` ends one of those sessions.
  - `iam.listSignIns({ limit? })` returns recent sign-in attempts, both successful and refused.
  - New administration methods (require `roles:grant`):
    - `iam.listUserSessions(orgId, userId)`
    - `iam.endUserSession(orgId, userId, sessionId)`
    - `iam.endAllUserSessions(orgId, userId)` signs the user out of every device now without disabling them.
    - `iam.listUserSignIns(orgId, userId, { limit? })`
  - New types: `IamSession`, `IamSessionsResult`, `IamSignIn`, `IamSignInsResult`, `IamSignInFailureReason`.
- d994eb2: - `admin.listSettings()` returns every platform setting with its current value, who last changed it and why, and whether it can be changed from the console.
  - `admin.getSetting(key)` returns one setting and its change history.
  - `admin.changeSetting(key, { value, reason })` changes an editable setting. It requires `roles:grant` and a recent passkey. It refuses payment and messaging settings (`not_editable`), and refuses a change that would remove the caller's own operator domain (`would_lock_you_out`).
  - New types:
    - `PlatformSetting`
    - `PlatformSettingDetail`
    - `PlatformSettingChange`
    - `PlatformSettingKind`
    - `PlatformSettingGroup`
    - `ChangePlatformSettingInput`
    - `ChangePlatformSettingResult`

## 5.18.0

### Minor Changes

- 4db1513: - New methods for the messaging safety queue:
  - `admin.listMessageReports({ status?, page? })` returns `AdminMessageReportList`: reported conversations and messages, oldest first. Each carries the reported side's recent risk signals and a `priority`.
  - `admin.getMessageReport(id)` returns `AdminMessageReportDetail`: the report, its thread as delivered, and the unmasked original when it may be released. It requires `audit:read` and a recent passkey. Opening a report is audited.
  - `admin.resolveMessageReport(id, { status, outcome, note? })` returns `ResolveMessageReportResult`. A repeat of the same resolution is a safe retry; a conflicting one is 409.
  - `AdminPayoutItem` gains `needs_correlation`, and `admin.listPayouts()` accepts `needs_correlation: 0 | 1`. This finds Daraja payouts whose provider reference must be repaired with `admin.repairPayoutCorrelation()`.
  - New types:
    - `AdminMessageReport`
    - `AdminMessageReportList`
    - `AdminMessageReportDetail`
    - `AdminMessageReportThreadMessage`
    - `MessageReportStatus`
    - `MessageReportOutcome`
    - `MessagingSide`
    - `ResolveMessageReportInput`
    - `ResolveMessageReportResult`

## 5.17.1

### Patch Changes

- cd109d2: - Fixed: an expiring access token whose refresh is refused (400 or 401) now behaves like a refusal after a 401. The SDK calls `onAuthExpired` and rejects with `APIError` 401 `session_expired`.
  - Before this fix, the request rejected with a plain internal error ("Refresh credentials are invalid.") and `onAuthExpired` never fired. Apps could not tell that the session had ended.
  - Transient refresh failures (offline, 5xx) still propagate unchanged and keep the session.

## 5.17.0

### Minor Changes

- fdcc779: - Add `admin.completeLibraryOccurrence(slug, dueOn, note?)`. It records one occurrence of a scheduled Library routine as done and returns `LibraryOccurrenceRecorded`.
  - Only operators whose role is in the document's audience may call it.
  - Errors: 409 when the occurrence is already recorded, and 422 `invalid_occurrence` with a `reason` for a day that cannot be recorded.
  - `LibraryDocumentSummary` gains two fields:
    - `schedule` (`LibrarySchedule`): the rules, a plain-words label, notice and grace;
    - `routine` (`LibraryRoutineState`): the current occurrence and its status, the next due day, and the missed count.
  - `LibraryDocument` gains `occurrences` (recent history, with who recorded each) and `can_record`.
  - `LibraryCadence` gains `yearly`.
  - New types:
    - `LibraryWeekday`
    - `LibrarySeason`
    - `LibraryScheduleRule`
    - `LibrarySchedule`
    - `LibraryOccurrenceStatus`
    - `LibraryCompleter`
    - `LibraryOccurrence`
    - `LibraryRoutineState`
    - `LibraryOccurrenceRecorded`

## 5.16.0

### Minor Changes

- 295e474: - Add `admin.listLibrary()`, which returns `LibraryListing`: the operations-library documents the caller may read, as summaries with review due dates, plus `can_read_all`.
  - Add `admin.getLibraryDocument(slug)`, which returns `LibraryDocument`: one document with its markdown body. A document the caller may not read returns 404, exactly like a missing one.
  - New types: `LibraryKind`, `LibraryCadence`, `LibraryDocumentSummary`, `LibraryDocument` and `LibraryListing`.
  - `AdminPermission` gains `library:read_all`.

## 5.15.0

### Minor Changes

- fa88f38: - Add `orders.getDocument(orderId)`. It returns an order's invoice or receipt as a PDF: `{ kind: 'invoice' | 'receipt', filename, blob }`. It reads `GET /orders/:id/document`, and errors with `document_not_found` (404) when the order has no document.
  - Add `APIClient.getFile(path, params?, options?)`, a GET whose body is a file. It returns `{ blob, contentType, headers }`, with the same authentication, token refresh, retries and error decoding as every other request.
  - New types: `OrderDocument`, `OrderDocumentKind` and `FileResponse`.

## 5.14.0

### Minor Changes

- a8b2ee4: - Add admin methods for the sign-in client registry, which require `clients:manage`:
  - `listOAuthClients()` and `getOAuthClient()`;
  - `registerOAuthClient()`, which returns a confidential client's secret once only;
  - `deactivateOAuthClient()`;
  - `setOAuthClientRedirectUris()` and `setOAuthClientScopes()`.
  - Add admin methods for OIDC signing keys, which require `oidc:rotate_keys`: `listOidcSigningKeys()` returns key metadata only, and `rotateOidcSigningKey()` runs the rotation.
  - New types: `OAuthClientSummary`, `OAuthClient`, `RegisterOAuthClientInput`, `RegisteredOAuthClient`, `OAuthClientType`, `OAuthClientTrustLevel` and `OidcSigningKey`.
  - `AdminPermission` gains `clients:manage` and `oidc:rotate_keys`.
  - The docs and examples now use the canonical API host, `https://api.mitumba.africa`.

## 5.13.0

### Minor Changes

- 9b9c654: - `OAuthAuthorizeInput` gains an optional `nonce`. It's forwarded by `oauth.authorize()` and `oauth.silentAuthorize()` and echoed in the id_token's `nonce` claim, so a relying party can bind the id_token to its request.
  - `auth.verifyOtp()` now returns `AuthTokens | TwoFactorRequired`. A phone sign-in to an account with two-factor authentication returns the challenge (narrow with `'requires_2fa' in result`) and persists nothing. Finish it with `verify2FA()` or the passkey ceremony, as with `login()`. Accounts without 2FA are unchanged.

## 5.12.0

### Minor Changes

- a65d00d: OAuth token exchange for relying parties. `OAuthTokenResult` gains `id_token`, and `refresh_token` is now optional. It's present only when the exchange yields a Mitumba session. Other relying parties receive an access token addressed only to themselves, limited to the consented scope, and no refresh token. `exchangeCode()` persists a client session only when a `refresh_token` is returned, and otherwise returns the result untouched. `userinfo()` documents passing a relying party's own access token through `headers`.

## 5.11.0

### Minor Changes

- cc7f873: `Business` now carries `phone` (the contact / payout number in E.164), and `UpdateBusinessInput` accepts `phone` and `null` for `county` or `phone` to clear them. `county` must be a region name from `sdk.markets.regions()` and is stored canonically; an invalid county or phone is a 400 (`invalid_county` / `invalid_phone`). `becomeSeller` and `becomeBaleSeller` now store the phone they are given on the business, and validate both fields the same way.

## 5.10.0

### Minor Changes

- 1ae1738: Add `sdk.markets.regions(code)` (public `GET /markets/:code/regions`) returning a market's first-level regions, e.g. Kenya's 47 counties, with the market's `label`/`plural` for them. Send a region's canonical `name` back to the API. New root helpers `findRegion(regions, name)` (canonical name after trimming, otherwise exact) and `regionById(regions, id)`, plus the `MarketRegion` and `MarketRegionsResponse` types.

## 5.9.0

### Minor Changes

- 6edbb64: Add `admin.listAuditLog(query)` for the attributed, filterable audit trail (`GET /admin/audit`): filters by `actor`, `action`, `target_type`, `target_id`, `since`/`until`, and keyset paging via `before` / `next_cursor`. Audit entries now carry an optional resolved `actor` (`user` | `iam` | `unknown` with email, display name and organization), and `target_id` is nullable.

## 5.8.0

### Minor Changes

- b006582: Admin list filters and wholesale review: `sdk.admin.listStores({ seller_id })` lists one seller's stores; `sdk.disputes.list({ status: 'all', q })` lists every status and searches by dispute, order, buyer or seller ID; `sdk.admin.listWholesaleApplications({ status: 'pending' | 'rejected' })` and `sdk.admin.rejectWholesaleStore(storeId, reason)` give wholesale applications a real rejection; `AdminWholesalePendingStore` gains its review fields.

## 5.7.0

### Minor Changes

- 2bea4d1: Add IAM self-service: `sdk.iam.regenerateBackupCodes(password)` replaces an IAM user's recovery codes, and `sdk.iam.deleteMethod(methodId, password)` removes one of their own second factors (refused with `last_factor` when it is the only verified one).

## 5.6.0

### Minor Changes

- 3eb222b: Add `sdk.markets.list()` (public `GET /markets`) and market-driven helpers: `formatMoney`, `formatAmount`, `formatMoneyCompact`, `normalizePhone`, `isValidPhone`, `formatPhone`, `maskPhone`, `findMarket` and `activeMarkets`. Clients can now read a market's currency, calling code, phone rules and region naming at runtime instead of hardcoding Kenya.

## 5.5.0

### Minor Changes

- cf7890a: Add the typed `sdk.iam` module for organization-scoped operator sign-in, activation, passkey/TOTP verification, session lifecycle, organization administration, and IAM-user provisioning. IAM access tokens now refresh through the IAM refresh endpoint automatically.

## 5.4.0

### Minor Changes

- 3dfc8e2: Add `sdk.oauth.silentAuthorize()` for the `prompt=none` silent-SSO attempt. It performs the no-interaction authorize and returns a discriminated `SilentAuthorizeResult` — `{ ok: true, code, state }` on a silent mint, or `{ ok: false, reason: 'login_required' | 'interaction_required' | 'unauthenticated' }` for the expected fallbacks (returned, not thrown) — so a first-party app can attempt silent sign-in and fall back cleanly. Only genuinely unexpected errors throw.

## 5.3.0

### Minor Changes

- 120993d: Add OIDC consent support to `sdk.oauth`: `grantConsent()`, `revokeConsent()`, and `listConsents()` wrap the consent endpoints, and `authorize()` now returns `OAuthAuthorizeResult | OAuthConsentRequired` for `first_party_consent` clients (narrow with the new `isConsentRequired()` guard). Adds `OAuthConsentInput`, `OAuthConsent`, `OAuthConsentRevokeResult`, and `OAuthConsentRequired` types.

## 5.2.0

### Minor Changes

- 238c5d7: Add OIDC provider-client helpers to `sdk.oauth`: `discover()` (OpenID discovery document), `getJwks()` (public signing keys), and `userinfo()` (the current session's claim set). Wraps the provider's `/auth/oauth/openid-configuration`, `/auth/oauth/jwks.json`, and `/auth/oauth/userinfo` endpoints, with `OpenIdConfiguration`, `Jwks`/`Jwk`, and `UserInfo` types.

## 5.1.0

### Minor Changes

- 98ad1a4: Add `sdk.oauth` session hand-off (authorize + exchangeCode) for the relying-party OAuth authorization-code + PKCE flow.

## 5.0.0

### Major Changes

- c8495dd: `AuthModule.logout()` now reads the refresh token the SDK holds and revokes exactly that session server-side, then **always** clears local tokens — even when the request fails or there is no token — so the device is signed out regardless. It is idempotent and returns `{ ok, revoked }`, where `revoked` is true only when the server confirmed revocation (Mitumba-Ltd/mitumba#328).

  **Breaking:** `logout()` no longer takes a `{ refresh_token }` argument — the SDK owns its stored token. Callers that passed one (including an empty placeholder) must drop the argument: `sdk.auth.logout()`.

### Minor Changes

- 95435db: Add `Order.buyer_county` (nullable). A seller sees the buyer's first name and county before payment, while `buyer_phone`/`delivery_address` remain gated to the `paid`→`delivered` handover window (Mitumba-Ltd/mitumba#321). Additive, non-breaking.

## 4.0.0

### Major Changes

- 37f3a23: `SettingsModule.updateProfile` now resolves to the updated `UserProfile` instead of `{ ok: true }`, so a profile edit no longer needs a follow-up `getProfile()` to read back the server-normalized result (Mitumba-Ltd/mitumba#330).

  `UpdateProfileInput` is now documented with the server-enforced contract: a non-empty display name (max 80), canonical Kenyan `+254` phone (unique — `phone_taken` 409), one of Kenya's 47 county names, a bounded bio (max 500), and a trusted-CDN avatar URL. Invalid input is rejected with `invalid_input` (400).

  Migration: if you read the old `{ ok: true }` result, drop that check — a resolved promise already means success, and the resolved value is now the profile.

### Patch Changes

- b541bc4: Document the visibility rules for `Order.buyer_phone` and `Order.delivery_address`: both are always visible to the buyer, but visible to the seller only during the `paid`→`delivered` handover window and `null` otherwise (Mitumba-Ltd/mitumba#321). The fields were already nullable, so this is a documentation-only change — no type or runtime behavior changes.

## 3.1.0

### Minor Changes

- 056d657: Add store-level aggregates and pagination metadata to `reviews.list()`. The response now includes `rating_counts` (a 1–5 star histogram across all of a store's reviews), `page_size`, and `has_more`, exposed through the new `StoreReviewsPage` return type.

## 3.0.0

### Major Changes

- f32245a: `CreateReviewInput.order_id` is now **required**. The server has always rejected a review without an order and enforces one review per order (Mitumba-Ltd/mitumba#307), so omitting `order_id` only ever produced a runtime 400 — the type now reflects that. `ReviewsModule.create` documents the `review_not_allowed` and `already_reviewed` error codes it can throw.

  Migration: pass the delivered/completed `order_id` you are reviewing (you almost certainly already do). This is a type-only tightening; no runtime behavior changed.

## 2.1.0

### Minor Changes

- 026c9a6: Add `wholesale.removeBaleImage(baleId, index)` to delete a bale photo, completing the bale image management surface alongside `presignBaleImage` / `uploadBaleImage` (shipped in 1.33.0). Backed by `DELETE /listings/bales/:baleId/images/:index` and returns `{ ok: true }`.

## 2.0.0

### Major Changes

- 62fc629: Retire Messaging v1. The deprecated v1 methods are removed from `MessagesModule`:

  - Conversations and messages: `list`, `getThread`, `send`, `markRead`
  - Realtime sockets: `connectTyping`, `connectInbox`, `connectInboxFresh`
  - Moderation: `createReport`, `createBlock`, `removeBlock`

  Every client is on Messaging v2 and the backend now returns `410` for the v1 `/notify/messages*` routes (Mitumba-Ltd/mitumba#346). Migrate to the v2 surface: `listConversations` / `listStoreConversations`, `resolveThread` + `listThreadMessages`, `sendThreadMessage`, `advanceThreadReadCursor`, managed realtime (`createMessagesRealtimeConnection` / `connectMessagesRealtime`), and `createMessagingReport` / `createMessagingBlock` / `removeMessagingBlock`.

## 1.33.0

### Minor Changes

- 09006f9: feat(wholesale): bale image upload and bale-seller analytics

  Add three methods to `WholesaleModule`:

  - `presignBaleImage(baleId, index)` and `uploadBaleImage(baleId, file, index)` — bale image upload, mirroring the listing image flow (multipart upload, slot 0 is the cover).
  - `getAnalytics(period?)` — performance analytics for the session-resolved wholesale store.

  Adds the `BaleImageUploadResult` and `WholesaleAnalytics` types. Backward compatible. Closes #170 and #171.

## 1.32.1

### Patch Changes

- a0159b4: Expose the complete Messaging v2 capability response so clients can gate HTTP, realtime, migration, and attachment behavior safely.

## 1.32.0

### Minor Changes

- 11943ef: Define and export the additive Messaging v2 public contracts, correlated resource unions, cursor and idempotency inputs, error guard, and stable realtime errors while preserving the partner-based v1 API.
- 11943ef: Add Messaging v2 conversation and thread methods, cursor-paged idempotent messages, monotonic reads, derived-context moderation, private attachment staging, injectable WebSocket transport, and managed resumable realtime.

### Patch Changes

- 11943ef: Preserve valid sessions when token refresh or replay fails transiently, forward abort signals to refresh, and add a fresh-token legacy inbox connection.

## 1.31.0

### Minor Changes

- 78cfd0a: Add `listingShareUrl`, `storeShareUrl` and `baleShareUrl`: validated builders for canonical go.mitumba.africa share links with a configurable staging origin.

## 1.30.1

### Patch Changes

- c38a456: Keep approved-but-not-yet-disbursed payouts visible in the approval queue, with the approval timestamp and operator id.

## 1.30.0

### Minor Changes

- ae3456b: Add the contracts the standalone admin console needs:

  - public auth capabilities and backup-code regeneration
  - assisted recovery request, status, cancellation, completion, review queue and audit events
  - operator permission and role management, audit trail, payout approval queue, approve/hold, correlation repair, and wholesale moderation
  - typed admin permissions, authentication strength, role presets, operators, pending payouts and recovery records
  - one-time root setup using a protocol header rather than placing the bootstrap secret in a JSON body
  - custom request headers that cannot override the SDK-managed Authorization header

  Also makes the three previously dead IP-blocking methods real by matching the backend endpoints, while preserving their published call signature as a deprecated overload.

## 1.29.0

### Minor Changes

- 1323003: Add provider-neutral `pay.initiateCheckout()` types, transport, and continuation actions for the deployed checkout initiation route.

## 1.28.0

### Minor Changes

- 87acbde: Add `pay.getCheckoutStatus(orderId, options?)` with typed retail and bale checkout lifecycle responses, polling guidance, payment-attempt metadata, and package-root lifecycle type exports. Deprecate `pay.getStatus()` without changing its legacy route, declaration, or runtime response.

## 1.27.1

### Patch Changes

- 5bb8a5c: Add `buyer_name` and `store_name` to `BaleOrder` type (backend already returns them).

## 1.27.0

### Minor Changes

- b0e55c5: Wholesale Phase D + wholesaler onboarding:

  - `sdk.auth.becomeBaleSeller(input)` — grant `bale_seller` role (POST /auth/become-bale-seller)
  - `sdk.wholesale.createBaleOrder(input)` — create a bale order (buyer)
  - `sdk.wholesale.myBaleOrders()` — buyer's bale orders
  - `sdk.wholesale.incomingBaleOrders()` — seller's incoming bale orders
  - `sdk.wholesale.getBaleOrder(id)` — order detail with events
  - `sdk.wholesale.transitionBaleOrder(id, action)` — advance order status

  New exported types: `BecomeBaleSellerInput`, `BaleOrder`, `BaleOrderEvent`, `BaleOrderStatus`, `BaleFulfillment`, `CreateBaleOrderInput`

## 1.26.0

### Minor Changes

- 490e294: Wholesale vertical (Phases A–C):

  **Foundation (Phase A):**

  - New types: `BusinessType` (`'individual' | 'business'`), `SellerType` (`'retail' | 'bale'`)
  - `BecomeSellerInput.business_type` — replaces the overloaded `seller_type` field (kept as deprecated alias)

  **Wholesale module (Phases B+C) — `sdk.wholesale`:**

  - `getWholesaleStore()` — get user's wholesale store + depots
  - `saveWholesaleStore(input)` — create/update wholesale store (bale_seller only)
  - `addDepot(input)` / `removeDepot(id)` — manage depots
  - `createBale(input)` — create a bale listing (requires verified store)
  - `getBale(id)` — get bale detail (public)
  - `updateBale(id, input)` — update a bale
  - `removeBale(id)` — soft-delete a bale
  - `myBales()` — list user's bales
  - `wholesaleFeed(params?)` — browse the wholesale feed (public)

  New exported types: `BusinessType`, `SellerType`, `BaleGrade`, `BaleType`, `WholesaleStore`, `WholesaleDepot`, `Bale`, `BaleDetail`, `CreateBaleInput`, `WholesaleFeedParams`, `BaleFeedItem`, `SaveWholesaleStoreInput`, `AddDepotInput`

## 1.25.0

### Minor Changes

- 53839ca: Three features in one release:

  **1. Inbox Realtime** (`sdk.messages`)

  - `connectInbox()` — user-scoped WebSocket for live conversation list updates
  - New type: `InboxRealtimeEvent`

  **2. UserProfile fields**

  - Add `county`, `bio`, `avatar_url` to `UserProfile` (removes last `as any` cast in profile settings)

  **3. WebAuthn / Passkeys** (Phase 4 of multi-method 2FA)

  - `TwoFactorMethodType` now includes `'passkey'`
  - `sdk.settings.startPasskeyRegistration(input?)` — begin passkey registration
  - `sdk.settings.finishPasskeyRegistration(methodId, credential)` — complete attestation
  - `sdk.auth.startPasskeyLogin(input)` — get assertion options for login
  - `sdk.auth.finishPasskeyLogin(input)` — submit assertion, receive tokens

  New exported types: `InboxRealtimeEvent`, `PublicKeyCredentialCreationOptionsJSON`, `RegistrationResponseJSON`, `PublicKeyCredentialRequestOptionsJSON`, `AuthenticationResponseJSON`

## 1.24.1

### Patch Changes

- 1b9aa1b: Add `email_2fa_available?: boolean` to `UserProfile` — platform flag for whether email 2FA is offered.

## 1.24.0

### Minor Changes

- d8aca26: Complete multi-method 2FA (Phase 3):

  - `sdk.auth.sendLogin2FAChallenge({ temp_token, method_id })` — request SMS/email code at login time (POST /auth/2fa/login/challenge)
  - `UserProfile.sms_2fa_available` — whether the platform offers SMS as a 2FA method

## 1.23.0

### Minor Changes

- 9ab3e9f: Add multi-method 2FA to `sdk.settings`:

  - `list2FAMethods()` — list all 2FA methods
  - `add2FAMethod(input)` — add totp/sms/email method
  - `verify2FAMethod(id, code)` — confirm pending method
  - `enable2FAMethod(id, code)` — re-enable disabled method
  - `disable2FAMethod(id, code)` — disable method (keep credentials)
  - `delete2FAMethod(id, code)` — permanently remove method
  - `setPrimary2FAMethod(id)` — set default login method
  - `challenge2FAMethod(id)` — resend sms/email code

  Updated types:

  - `TwoFactorRequired.methods` — available methods at login
  - `Verify2FAInput.method_id` — specify which method to verify against
  - `UserProfile.two_factor_methods_count` — count of verified methods

  New exported types: `TwoFactorMethod`, `TwoFactorMethodType`, `Add2FAMethodInput`, `Add2FAMethodResult`

## 1.22.0

### Minor Changes

- 8dd1234: 2FA lifecycle + messages store authorship:

  - `sdk.settings.enable2FA(code)` — re-enable 2FA using existing secret (POST /auth/2fa/enable)
  - `sdk.settings.delete2FA(code)` — permanently remove 2FA secret (DELETE /auth/2fa)
  - `UserProfile.totp_configured` — whether a TOTP secret is on file (distinct from `totp_enabled`)
  - `SendMessageInput.from_store` — marks message as sent by the store side
  - `Message.from_store` — orientation field on received messages (1 = store side, 0 = buyer)

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
