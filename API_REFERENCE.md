# @mitumba/sdk — API Reference

Complete reference for every endpoint the SDK wraps. All paths are relative to the base URL.

**Base URL:** `https://api.mitumba.africa`

---

## Conventions

### Authentication

Protected endpoints require an `Authorization: Bearer <access_token>` header. The SDK injects this automatically when a token is configured.

### Response Shapes

**Paginated responses:**
```typescript
{
  data: T[]
  total: number
  page: number
  page_size: number
  has_more: boolean
}
```

**Error responses:**
```typescript
{
  error: string       // machine-readable code
  message?: string    // human-readable description
  details?: unknown   // Zod validation details (400 only)
}
```

---

## Auth Module (`/auth`)

### `POST /auth/register` — Register a new account

**Auth:** Public

| Mode | Request Body | Response (Success) |
|---|---|---|
| Email + Password | `{ email, password (min 8), display_name?, device? }` | `201 { access_token, refresh_token, expires_in: 900 }` |
| Phone OTP | `{ phone }` _(format: `+254XXXXXXXXX`)_ | `200 { message: "OTP sent. Verify with POST /auth/otp/verify" }` |

**Errors:** `invalid_input` (400), `email_taken` (409), `otp_rate_limited` (429), `otp_send_failed` (502)

---

### `POST /auth/login` — Log in to existing account

**Auth:** Public

| Mode | Request Body | Response (Success) |
|---|---|---|
| Email + Password | `{ email, password, device?, remember? }` | `200 { access_token, refresh_token, expires_in: 900 }` or `200 { requires_2fa: true, temp_token }` |
| Phone OTP | `{ phone }` | `200 { message: "OTP sent. Verify with POST /auth/otp/verify" }` |

> When `remember: true`, the refresh token TTL extends from 7 days to 180 days.

**Errors:** `invalid_input` (400), `invalid_credentials` (401), `account_suspended` (403)

---

### `POST /auth/otp/send` — Send OTP code

**Auth:** Public  
**Body:** `{ phone: string }`  
**Response:** `200 { message: "OTP sent." }`  
**Errors:** `sms_otp_disabled` (400), `invalid_input` (400), `otp_rate_limited` (429), `otp_send_failed` (502)

---

### `POST /auth/otp/verify` — Verify OTP code

**Auth:** Public  
**Body:** `{ phone, code }` _(code is 6 digits)_  
**Response:** `200 { access_token, refresh_token, expires_in: 900 }`  
**Errors:** `sms_otp_disabled` (400), `invalid_input` (400), `otp_expired` (400), `otp_max_attempts` (400), `otp_invalid` (400), `account_suspended` (403)

---

### `POST /auth/refresh` — Refresh token pair

**Auth:** Public  
**Body:** `{ refresh_token: string }`  
**Response:** `200 { access_token, refresh_token, expires_in: 900 }`  
**Errors:** `invalid_input` (400), `invalid_token` (401), `token_expired` (401)

---

### `POST /auth/logout` — Revoke refresh token

**Auth:** Protected  
**Body:** `{ refresh_token: string }`  
**Response:** `200 { ok: true }`

---

### `GET /auth/me` — Get current user profile

**Auth:** Protected

**Response:**
```typescript
{
  id: string
  email: string | null
  phone: string | null
  display_name: string | null
  city_id: string | null
  onboarding_completed: boolean
  email_verified: boolean
  is_active: boolean
  created_at: string
  roles: string[]
}
```

---

### `PUT /auth/me` — Update profile

**Auth:** Protected  
**Body:** `{ display_name?, phone?, county?, bio?, avatar_url? }`  
**Response:** `200 { ok: true }`

---

### `POST /auth/forgot-password` — Request password reset email

**Auth:** Public  
**Body:** `{ email: string }`  
**Response:** `200 { message: "Reset link sent" }`

---

### `POST /auth/reset-password` — Reset password with token

**Auth:** Public  
**Body:** `{ token: string, password: string }`  
**Response:** `200 { message: "Password reset successfully" }`

---

### `POST /auth/change-password` — Change password

**Auth:** Protected  
**Body:** `{ current_password: string, new_password: string }`  
**Response:** `200 { ok: true }`

---

### `POST /auth/onboarding/complete` — Complete onboarding

**Auth:** Protected  
**Body:** `{ display_name: string, county: string, phone: string }`  
**Response:** `200 { ok: true }`

---

### `POST /auth/verify-email/send` — Send email verification code

**Auth:** Mixed (authenticated or pass `{ email }`)  
**Body:** `{ email? }` _(optional if authenticated)_  
**Response:** `200 { ok: true }`

---

### `POST /auth/verify-email/confirm` — Verify email with code

**Auth:** Mixed  
**Body:** `{ code: string, email?: string }`  
**Response:** `200 { ok: true }`

---

### `POST /auth/2fa/login` — Verify 2FA during login

**Auth:** Public  
**Body:** `{ temp_token: string, code: string }`  
**Response:** `200 { access_token, refresh_token, expires_in: 900 }`

---

### `POST /auth/2fa/setup` — Setup 2FA (get TOTP secret)

**Auth:** Protected  
**Response:** `200 { secret: string, otpauth_uri: string }`

---

### `POST /auth/2fa/verify` — Confirm 2FA setup

**Auth:** Protected  
**Body:** `{ code: string }`  
**Response:** `200 { ok: true, backup_codes: string[] }`

---

### `POST /auth/2fa/disable` — Disable 2FA

**Auth:** Protected  
**Body:** `{ code: string }`  
**Response:** `200 { ok: true }`

---

### `GET /auth/sessions` — List active sessions

**Auth:** Protected  
**Response:** `200 { data: Session[] }`

```typescript
interface Session {
  id: string
  device: string
  location: string
  last_active: string
  is_current: boolean
}
```

---

### `DELETE /auth/sessions/:id` — Revoke a session

**Auth:** Protected  
**Response:** `200 { ok: true }`

---

### `GET /auth/notification-prefs` — Get notification preferences

**Auth:** Protected  
**Response:** `200 { data: Array<{ channel: string, enabled: boolean }> }`

---

### `PUT /auth/notification-prefs/:channel` — Update notification pref

**Auth:** Protected  
**Body:** `{ enabled: boolean }`  
**Response:** `200 { ok: true }`

---

### `GET /auth/preferences` — Get user preferences

**Auth:** Protected  
**Response:** `200 { data: Record<string, string> }`

---

### `PUT /auth/preferences` — Update user preferences

**Auth:** Protected  
**Body:** `{ prefs: Record<string, string> }`  
**Response:** `200 { ok: true }`

---

### `GET /auth/addresses` — List addresses

**Auth:** Protected  
**Response:** `200 { data: Address[] }`

```typescript
interface Address {
  id: string
  label: string
  name: string
  phone: string
  line1: string
  line2: string | null
  city: string
  county: string
  is_default: boolean
  created_at: string
}
```

---

### `POST /auth/addresses` — Add address

**Auth:** Protected  
**Body:** `{ label, name, phone, line1, line2?, city, county }`  
**Response:** `201 { id: string }`

---

### `PUT /auth/addresses/:id` — Update address

**Auth:** Protected  
**Body:** Partial of address fields  
**Response:** `200 { ok: true }`

---

### `DELETE /auth/addresses/:id` — Delete address

**Auth:** Protected  
**Response:** `200 { ok: true }`

---

### `POST /auth/addresses/:id/default` — Set default address

**Auth:** Protected  
**Response:** `200 { ok: true }`

---

### `GET /auth/payment-methods` — List payment methods

**Auth:** Protected  
**Response:** `200 { data: PaymentMethod[] }`

```typescript
interface PaymentMethod {
  id: string
  type: 'mpesa' | 'mpesa_till' | 'airtel' | 'telkom' | 'card'
  label: string
  detail: string
  is_default: boolean
  created_at: string
}
```

---

### `POST /auth/payment-methods` — Add payment method

**Auth:** Protected  
**Body:** `{ type, label, detail }`  
**Response:** `201 { id: string }`

---

### `DELETE /auth/payment-methods/:id` — Delete payment method

**Auth:** Protected  
**Response:** `200 { ok: true }`

---

### `POST /auth/payment-methods/:id/default` — Set default payment method

**Auth:** Protected  
**Response:** `200 { ok: true }`

---

### `GET /auth/linked-accounts` — List linked accounts

**Auth:** Protected  
**Response:** `200 { data: Array<{ provider: 'google' | 'apple', email: string | null, connected_at: string }> }`

---

### `POST /auth/linked-accounts` — Link an account

**Auth:** Protected  
**Body:** `{ provider: 'google' | 'apple', token: string }`  
**Response:** `200 { ok: true }`

---

### `DELETE /auth/linked-accounts/:provider` — Unlink an account

**Auth:** Protected  
**Response:** `200 { ok: true }`

---

## Listings Module (`/listings`)

### `GET /listings/feed` — Browse listing feed

**Auth:** Public

**Query Parameters:**

| Param | Type | Default | Description |
|---|---|---|---|
| `city_id` | string | — | Filter by city |
| `category_id` | string | — | Filter by category |
| `min_price` | int | — | Minimum price (KES) |
| `max_price` | int | — | Maximum price (KES) |
| `condition` | enum | — | `new`, `like_new`, `good`, `fair` |
| `sort` | enum | `recency` | `recency`, `price_asc`, `price_desc` |
| `page` | int | `1` | Page number (min 1) |
| `page_size` | int | `20` | Items per page (max 50) |

**Response:** Paginated listings with seller profile data.

---

### `GET /listings/:id` — Get listing details

**Auth:** Public  
**Response:** Single listing with images array and seller profile.  
**Errors:** `not_found` (404)

---

### `POST /listings` — Create a new listing

**Auth:** Protected (seller only)

**Body:**
```typescript
{
  store_id: string
  title: string           // 3–120 chars
  description?: string    // max 1000 chars
  category_id: string
  city_id: string
  price: number           // integer, min 50 KES
  condition: 'new' | 'like_new' | 'good' | 'fair'
  vazi_eligible?: boolean
}
```

**Response:** `201` — Created listing  
**Errors:** `not_a_seller` (403), `invalid_category` (400), `invalid_city` (400), `invalid_input` (400)

---

### `PUT /listings/:id` — Update listing

**Auth:** Protected (owner only)  
**Body:** Partial of create fields  
**Errors:** `not_found` (404), `listing_immutable` (400)

---

### `PATCH /listings/:id/status` — Change listing status

**Auth:** Protected (owner only)  
**Body:** `{ status: 'active' | 'sold' | 'removed' }`  
**Response:** `200 { ok: true, status }`  
**Errors:** `invalid_transition` (400), `not_found` (404)

---

### `DELETE /listings/:id` — Soft delete listing

**Auth:** Protected (owner only)  
**Response:** `200 { ok: true }`

---

### `GET /listings/seller/:seller_id` — Seller storefront

**Auth:** Public  
**Query:** `page?`, `page_size?`  
**Response:** `{ seller, listings, total, page, page_size, has_more }`  
**Errors:** `not_found` (404)

---

### `GET /listings/categories` — List categories

**Auth:** Public  
**Response:** `Array<{ id, name, slug }>`

---

### `GET /listings/cities` — List supported cities

**Auth:** Public  
**Response:** `Array<{ id, name, delivery_fee }>`

---

### `POST /listings/:id/images/presign` — Get image upload slot

**Auth:** Protected (owner only)  
**Body:** `{ index: number }` _(0–9)_  
**Response:** `201 { r2_key: string, image_id: string }`

---

### `POST /listings/bales/:baleId/images/presign` — Get bale image upload slot

**Auth:** Protected (owning wholesale store only)  
**Body:** `{ index: number }` _(slot 0 is the cover)_  
**Response:** `201 { r2_key: string, image_id: string }`  
**SDK:** `sdk.wholesale.presignBaleImage(baleId, index)`

---

### `POST /listings/bales/:baleId/images/upload` — Upload a bale image

**Auth:** Protected (owning wholesale store only)  
**Body:** `multipart/form-data` with `file` and `index` fields _(slot 0 is the cover)_  
**Response:** `201 { r2_key: string, image_id: string, url: string }`  
**SDK:** `sdk.wholesale.uploadBaleImage(baleId, file, index)`

---

### `GET /listings/:id/similar` — Get similar listings

**Auth:** Public  
**Query:** `mode?` (`global` | `store`)  
**Response:** `{ data: SimilarListing[] }`

---

## Stores Module (`/listings/stores`)

### `GET /listings/stores/:slug` — Get store by slug

**Auth:** Public  
**Response:**
```typescript
{
  id: string
  owner_id: string
  name: string
  slug: string
  description: string | null
  logo_url: string | null
  banner_url: string | null
  city: string | null
  subscription_tier: 'free' | 'pro' | 'premium'
  created_at: string
  follower_count?: number
  is_following?: boolean
}
```

---

### `GET /listings/stores/mine` — Get my stores

**Auth:** Protected  
**Response:** `{ data: Store[] }`

---

### `POST /listings/stores` — Create a store

**Auth:** Protected  
**Body:** `{ name, slug, category?, description?, tagline?, city_id? }`  
**Response:** `201 { id: string, slug: string }`

---

### `PUT /listings/stores/:storeId` — Update store

**Auth:** Protected (owner only)  
**Body:** `{ name?, tagline?, description?, category?, logo_url?, banner_url?, city_id? }`  
**Response:** `200 { ok: true }`

---

### `POST /listings/stores/:storeId/follow` — Follow a store

**Auth:** Protected  
**Response:** `200 { ok: true }`

---

### `DELETE /listings/stores/:storeId/follow` — Unfollow a store

**Auth:** Protected  
**Response:** `200 { ok: true }`

---

### `GET /listings/stores/:storeId/listings` — Get store listings

**Auth:** Public  
**Query:** `page?`  
**Response:** `{ data: Listing[] }`

---

### `GET /listings/stores/:storeId/stats` — Get store statistics

**Auth:** Protected (owner only)  
**Response:** `{ listings: number, orders: number, revenue: number, followers: number }`

---

### `GET /listings/stores/:storeId/settings` — Get store settings

**Auth:** Protected (owner only)  
**Response:** Full `StoreSettings` object (shipping, payout, returns, verification, operating hours)

---

### `PUT /listings/stores/:storeId/settings` — Update store settings

**Auth:** Protected (owner only)  
**Body:** Partial of StoreSettings fields  
**Response:** `200 { ok: true }`

---

### `GET /listings/stores/:storeId/analytics` — Get store analytics

**Auth:** Protected (owner only)  
**Query:** `period?` (`daily` | `weekly` | `monthly`)  
**Response:**
```typescript
{
  revenue: Array<{ date, revenue, orders }>
  orders_breakdown: Array<{ date, completed, pending, cancelled }>
  traffic_sources: Array<{ source, count }>
  top_listings: Array<{ listing_id, title, views, revenue }>
  geography: Array<{ city, orders }>
  sti_trend: Array<{ date, score }>
  totals: { views, orders, revenue, followers }
}
```

---

### `GET /listings/wholesale/analytics` — Get wholesale (bale-seller) analytics

**Auth:** Protected (bale_seller only; store resolved from the session, no id in the path)  
**Query:** `period?` (`daily` | `weekly` | `monthly`)  
**Response:**
```typescript
{
  revenue: Array<{ date, revenue, orders }>
  orders_breakdown: Array<{ date, completed, pending, cancelled }>
  top_bales: Array<{ bale_id, title, orders, revenue }>
  totals: { bales, orders, revenue }
}
```
**SDK:** `sdk.wholesale.getAnalytics(period?)`

---

## Reviews Module (`/listings/stores/:storeId/reviews`)

### `GET /listings/stores/:storeId/reviews` — List store reviews

**Auth:** Public  
**Query:** `page?`  
**Response:** `{ data: Review[], total: number, avg_rating: number, page: number }`

```typescript
interface Review {
  id: string
  store_id: string
  buyer_id: string
  order_id: string | null
  rating: number
  comment: string | null
  author_name: string | null
  created_at: string
}
```

---

### `POST /listings/stores/:storeId/reviews` — Create a review

**Auth:** Protected  
**Body:** `{ rating: number, comment?: string, order_id?: string }`  
**Response:** `201 { id: string }`

---

## Wishlists Module (`/listings/wishlists`)

### `GET /listings/wishlists` — List saved listings

**Auth:** Protected  
**Response:** `{ data: WishlistListing[] }`

---

### `POST /listings/wishlists/:listingId` — Save a listing

**Auth:** Protected  
**Response:** `200 { ok: true }`

---

### `DELETE /listings/wishlists/:listingId` — Remove from wishlist

**Auth:** Protected  
**Response:** `200 { ok: true }`

---

## Markets Module (`/markets`)

### `GET /markets` — List the platform's markets

The countries Mitumba operates in or plans to. Read it at runtime; do not hardcode a country, currency, calling code or region name.

**Auth:** Public  
**Cache:** Safe to cache for a few minutes (`Cache-Control: public, max-age=300`)  
**Response:** `MarketsResponse`

```typescript
interface MarketsResponse {
  version: 1
  markets: Market[]
  updated_at: string // ISO 8601
}

interface Market {
  code: string // UPPERCASE ISO 3166-1 alpha-2, e.g. "KE"
  slug: string // lowercase URL form, e.g. "ke"
  name: string
  status: 'active' | 'coming_soon' // only "active" markets can transact
  currency: { code: string; minor_unit: number; symbol: string; locale: string }
  locale: { default: string; timezone: string } // e.g. "en-KE", "Africa/Nairobi"
  phone: { calling_code: string; national_length: number[]; example: string }
  regions: { label: string; plural: string } // e.g. County / Counties
  payments: { method_types: string[] } // buyer-visible rails, never a provider name
  fulfilment_methods: string[]
}
```

Amounts across the API are whole major units (1850 is KES 1,850). Use the helpers exported from the package root with a `Market`: `formatMoney`, `formatAmount`, `formatMoneyCompact`, `normalizePhone`, `isValidPhone`, `formatPhone`, `maskPhone`, `findMarket`, `activeMarkets`.

### `GET /markets/:code/regions` — List a market's regions

The first-level administrative regions of one market, e.g. Kenya's 47 counties. Use it for every county or region picker and send the returned `name` back to the API (profile and onboarding `county`): it is the canonical spelling the platform stores, e.g. `"Trans-Nzoia"`.

**SDK:** `sdk.markets.regions(code)` — the code is trimmed and uppercased before sending  
**Auth:** Public  
**Cache:** Safe to cache for a few minutes (`Cache-Control: public, max-age=300`)  
**Response:** `MarketRegionsResponse`  
**Errors:** `404 { "error": "market_not_found" }` for a code that is not in the registry. A known market with no regions yet returns an empty `regions` list.

```typescript
interface MarketRegionsResponse {
  version: 1
  market_code: string // UPPERCASE ISO 3166-1 alpha-2, e.g. "KE"
  label: string // e.g. "County"
  plural: string // e.g. "Counties"
  regions: MarketRegion[] // display (alphabetical) order
  updated_at: string // ISO 8601
}

interface MarketRegion {
  id: string // stable lowercase slug, e.g. "trans-nzoia"
  name: string // canonical name, e.g. "Trans-Nzoia"
}
```

Helpers from the package root: `findRegion(regions, name)` matches the canonical name after trimming (otherwise exact, so nothing is guessed) and `regionById(regions, id)` matches the slug.

---

## Cart Module (`/listings/cart`)

### `GET /listings/cart` — List cart items

**Auth:** Protected  
**Response:** `{ data: CartItem[] }`

```typescript
interface CartItem {
  id: string
  listing_id: string
  store_id: string
  store_name: string
  title: string
  price: number
  condition: string
  image_keys: string | null
  added_at: string
}
```

---

### `POST /listings/cart/:listingId` — Add to cart

**Auth:** Protected  
**Response:** `200 { ok: true }`

---

### `DELETE /listings/cart/:listingId` — Remove from cart

**Auth:** Protected  
**Response:** `200 { ok: true }`

---

### `POST /orders/checkout` — Create a checkout

**Auth:** Protected  
**SDK:** `sdk.checkouts.create(input)` (`sdk.cart.checkout()` is deprecated: it sends no body)  
**Body:** `CreateCheckoutInput`  
**Response:** `201` created, `200` a retry of the same request: `{ checkout: Checkout, order_ids: string[], count: number }`

```typescript
interface CreateCheckoutInput {
  address_id: string
  idempotency_key: string // 8 to 128 chars; a retry with the same key returns the same checkout
  deliveries: Array<{ store_id: string; quote_id: string }> // exactly one per shop in the cart
}

interface Checkout {
  id: string
  invoice_number: string
  status: 'awaiting_payment' | 'paid' | 'expired' | 'cancelled'
  market_code: string
  items_total: CheckoutMoney
  delivery_total: CheckoutMoney
  bpf_total: CheckoutMoney // buyer protection fee (BPF) across every shop; zero when none
  total: CheckoutMoney     // items + delivery + BPF
  due_at: string
  created_at: string
  orders: Array<{
    order_id: string
    store_id: string
    items_total: CheckoutMoney
    delivery_fee: CheckoutMoney
    bpf: CheckoutMoney
    total: CheckoutMoney // items + delivery + BPF for this shop
  }>
}

interface CheckoutMoney { currency: string; minor_units: number }
```

**Errors:** `{ error, ...details }`. Read them with `checkoutRefusal(error)`.

| Status | `error` | Details |
|---|---|---|
| 400 | `invalid_input`, `empty_cart`, `cannot_buy_own`, `invalid_deliveries` | |
| 404 | `address_not_found` | |
| 409 | `idempotency_conflict` | |
| 409 | `listing_unavailable` | `listings: Array<{ listing_id, available }>` |
| 409 | `mixed_market_cart`, `market_not_active` | |
| 409 | `checkout_payment_in_progress` | `checkout_id` |
| 409 | `delivery_quote_rejected` | `store_id` (string or null), `reason` |
| 422 | `address_region_invalid` | |
| 422 | `delivery_required` | `store_ids: string[]` |
| 503 | `delivery_quotes_unavailable` | `Retry-After` header |

---

### `GET /orders/checkouts/:id` — Get a checkout

**Auth:** Protected (the checkout's buyer; anyone else gets `404 not_found`)  
**SDK:** `sdk.checkouts.get(checkoutId)`  
**Response:** `200 { checkout: Checkout }`

---

## Search Module (`/search`)

### `GET /search` — Full-text search

**Auth:** Public

**Query Parameters:**

| Param | Type | Default | Description |
|---|---|---|---|
| `q` | string | — | **Required.** Search query (1–100 chars) |
| `city_id` | string | — | Filter by city |
| `category_id` | string | — | Filter by category |
| `min_price` | int | — | Price floor (KES) |
| `max_price` | int | — | Price ceiling (KES) |
| `condition` | enum | — | `new`, `like_new`, `good`, `fair` |
| `sort` | enum | `relevance` | `relevance`, `recency`, `price_asc`, `price_desc`, `sti` |
| `page` | int | `1` | Page number |
| `page_size` | int | `20` | Items per page (max 50) |

**Response:** Paginated search results with relevance ranking.

---

### `GET /search/trending` — Trending search terms

**Auth:** Public  
**Query:** `city_id?`  
**Response:** `{ terms: Array<{ term, count }> }` (top 20)

---

### `GET /search/history` — Get search history

**Auth:** Protected  
**Response:** `{ data: SearchHistoryItem[] }`

```typescript
interface SearchHistoryItem {
  id: string
  query: string
  result_count: number
  first_listing_id: string | null
  first_image: string | null
  created_at: string
}
```

---

### `POST /search/history` — Save search to history

**Auth:** Protected  
**Body:** `{ query: string, result_count: number, first_listing_id?: string }`  
**Response:** `200 { ok: true }`

---

## Orders Module (`/orders`)

### `POST /orders` — Create an order

**Auth:** Protected  
**Body:** `{ listing_id: string }`  
**Response:** `201 { order_id, total, delivery_fee }`  
**Errors:** `not_found` (404), `invalid_input` (400)

---

### `GET /orders/:id` — Get order details

**Auth:** Protected (buyer or seller)  
**Response:** Full order with `events: OrderEvent[]` timeline.  
**Errors:** `not_found` (404)

---

### `POST /orders/:id/transition` — Transition order status

**Auth:** Protected  
**Body:** `{ status: OrderStatus, note?: string }`  
**Response:** `200 { ok: true, status }`  
**Errors:** `invalid_transition` (400), `not_found` (404)

---

### `GET /orders/history` — Order history

**Auth:** Protected  
**Query:** `role?` (`buyer` | `seller`), `page?`  
**Response:** `{ data: Order[], page, page_size }`

---

### `GET /orders/:id/document` — Order invoice or receipt (PDF)

**Auth:** Protected (the order's buyer)  
**SDK:** `sdk.orders.getDocument(id)` returns `{ kind: 'invoice' | 'receipt', filename, blob }`  
**Response:** `200 application/pdf`. The receipt once the order is paid, the invoice while it awaits payment. Every order of one checkout returns the same document. Headers: `X-Mitumba-Document: invoice | receipt`, `Content-Disposition: inline; filename="..."`, `Cache-Control: private, no-store`.  
**Errors:** `document_not_found` (404): not the caller's order, an order with no checkout, or a checkout that expired or was cancelled.

---

## Pay Module (`/pay`)

### `POST /pay/stk` — Initiate M-Pesa STK Push

**Auth:** Protected  
**Body:** `{ order_id, phone }` (format: `+254XXXXXXXXX`)  
**Response:** `201 { payment_id, provider }`  
**Errors:** `invalid_input` (400), `order_not_found` (404), `invalid_order_status` (400)

---

### `POST /pay/paystack/init` — Initiate Paystack payment

**Auth:** Protected  
**Body:** `{ order_id, email }`  
**Response:** `201 { access_code, authorization_url, reference }`

---

### `POST /pay/checkout/initiate` — Initiate provider-neutral checkout

> **Availability:** The route is deployed. Payment initiation can be temporarily paused and return `503 payment_initiation_paused`.

**Auth:** Protected

**SDK:** `pay.initiateCheckout(input, options?)`

The client selects a payment method only. The API selects the provider and returns the continuation action.

**Body:**

```typescript
type CheckoutPaymentMethod =
  | { type: 'mobile_money'; phone: string }
  | { type: 'card' }

interface InitiateCheckoutInput {
  order_id: string
  idempotency_key: string
  method: CheckoutPaymentMethod
}
```

**Response:**

```typescript
type KnownPaymentProvider = 'daraja' | 'intasend' | 'paystack' | 'airtel'
type ProviderId = KnownPaymentProvider | (string & {})

type CheckoutNextAction =
  | { type: 'await_confirmation' }
  | { type: 'redirect'; url: string; expires_at: string | null }

interface InitiateCheckoutResponse {
  version: 1
  order_id: string
  attempt: {
    id: string
    sequence: number
    provider: ProviderId
    status: 'initiated'
  }
  next_action: CheckoutNextAction
}
```

Use only `next_action` to continue checkout: wait for out-of-band confirmation or open the supplied absolute HTTPS redirect URL. Successful initiation does not mean the order is paid; follow it with `pay.getCheckoutStatus(orderId)`.

Repeating the same `idempotency_key` with semantically identical input returns the original result. Reusing a key with different input returns `idempotency_conflict`. `options.signal` cancels the client request only and does not imply server rollback; retry with the same key and input to recover the authoritative result.

**Errors:** `invalid_input` (400), `unauthorized` (401), `not_found` (404), `order_not_payable` (409), `idempotency_conflict` (409), `payment_method_unavailable` (422), `payment_initiation_paused` (503), `payment_provider_unavailable` (503)

---

### `GET /pay/status/:order_id` — Poll legacy payment status (deprecated)

**Auth:** Protected

**SDK:** `pay.getStatus(orderId)` is deprecated but retains this route, declaration, and passthrough behavior for compatibility. Use `pay.getCheckoutStatus(orderId)` for buyer-visible checkout state.

**Legacy SDK declaration:** `{ id, status: 'initiated' | 'funded' | 'failed' | 'refunded' | 'cancelled', total }`

**Runtime behavior:** The unchanged route currently returns a retail order projection. The SDK continues to pass that payload through without transformation in this minor release.

**Errors:** `not_found` (404)

---

### `GET /pay/checkout-status/:order_id` — Get checkout lifecycle

**Auth:** Protected (buyer-owned retail or bale order)

**SDK:** `pay.getCheckoutStatus(orderId, options?)`

**Response:**

```typescript
interface CheckoutStatusResponse {
  version: 1
  order_id: string
  order:
    | { type: 'retail'; status: OrderStatus }
    | { type: 'bale'; status: BaleOrderStatus }
  checkout_status: 'pending' | 'paid' | 'failed' | 'cancelled' | 'refunded'
  terminal: boolean
  retryable: boolean
  amount: {
    currency: 'KES'
    minor_units: number
  }
  latest_attempt: {
    id: string
    sequence: number
    provider: ProviderId
    status: 'initiated' | 'funded' | 'failed' | 'refunded' | 'cancelled'
    terminal: boolean
    created_at: string
    updated_at: string
  } | null
  attempt_count: number
  order_updated_at: string
  status_updated_at: string
  server_time: string
  poll_after_ms: number
}
```

All timestamps are RFC 3339 UTC strings. Monetary values use integer minor units; KES 1,250.00 is `125000`.

Checkout state is derived from the authoritative order lifecycle. A funded attempt remains `pending` until the order reaches `paid` or a later paid state. Failed or cancelled attempts on a still-payable order are nonterminal and retryable; a newer initiated retry returns to nonretryable `pending`. Refunds and order-level cancellations are terminal and not retryable. `latest_attempt.terminal` describes only the attempt, `sequence` is monotonic per order, and `status_updated_at` is the later order/attempt update time. Use `poll_after_ms` to avoid overlapping polls.

**Errors:** `unauthorized` (401), `not_found` (404)

---

## Vazi Module (`/vazi`)

### `GET /vazi/feed` — Browse outfit feed

**Auth:** Public  
**Query:** `limit?` (1–50, default 20), `offset?` (default 0)  
**Response:** `{ outfits: VAZIOutfit[], total, limit, offset }`

---

### `GET /vazi/complete/:listing_id` — Complete an outfit

**Auth:** Public  
**Response:** `{ outfits: [VAZIOutfit] }`  
**Errors:** `not_found` (404)

---

## Messages Module (`/notify`)

### Legacy 1.x compatibility

The partner-based methods remain source- and runtime-compatible until 2.0.0, but are deprecated:

```typescript
messages.list(storeId?, options?)
messages.getThread(partnerId, storeId?, options?)
messages.send(input, options?)
messages.markRead(partnerId, storeId?, options?)
messages.connectTyping(partnerId)
messages.connectInbox()
```

`receiver_id`, `store_id`, `listing_id`, `order_id`, and `from_store` are context hints, not authority. The server derives actor side and recipient and rejects mismatches. Use `connectInboxFresh()` when a legacy socket must hydrate or refresh its access token first.

Legacy declarations match the published 1.x runtime:

```typescript
interface Conversation {
  partner_id: string
  partner_name: string
  store_name?: string | null
  body: string
  created_at: string
  store_id?: string | null
  listing_id?: string | null
  listing_title?: string | null
  unread_count: number
}

interface Message {
  id: string
  sender_id: string
  receiver_id: string
  body: string
  listing_id: string | null
  store_id: string | null
  order_id?: string | null
  from_store?: number
  read_at: string | null
  created_at: string
}
```

### Moderation methods

```typescript
messages.createReport(input, options?)
messages.createBlock(input, options?)
messages.removeBlock(blockId, options?)
```

Reports target a message or conversation and use typed reasons including `off_platform_payment`. Blocks are buyer/store relationship scoped and idempotent. Existing Order support behavior is server policy.

### Messaging v2 hierarchy

Every v2 success response has `{ api_version: 2, data }`. Public methods unwrap `data` after validating the version and top-level resource shape.

```text
MessagingPerspective → ConversationSummary → ThreadCard → ThreadTimelineItem
```

Buyer and store paths are explicit:

```typescript
messages.listMessagingInboxes(options?)
messages.listConversations(params?, options?)
messages.listStoreConversations(storeId, params?, options?)
messages.getConversation(perspective, conversationId, options?)
messages.resolveThread(perspective, input, { idempotencyKey, ...options })
messages.listThreads(perspective, conversationId, params?, options?)
messages.getConversationThread(perspective, threadId, options?)
messages.updateThreadStatus(perspective, threadId, status, options?)
messages.updateThreadPreferences(perspective, threadId, preferences, options?)
messages.updateConversationPreferences(perspective, conversationId, preferences, options?)
```

Thread resolution accepts exhaustive General, Listing, and Order inputs. The stable idempotency key is sent as `Idempotency-Key` and must be reused for an exact retry.

### Thread messages and read cursors

```typescript
messages.listThreadMessages(perspective, threadId, params?, options?)
messages.sendThreadMessage(perspective, threadId, input, options?)
messages.advanceThreadReadCursor(perspective, threadId, timelineItemId, options?)
```

The initial message request returns the newest window, with items ordered by ascending server sequence for rendering. `before` requests older history and `after` catches up; they are mutually exclusive. Limits are integers from 1 through 100.

`client_message_id` is caller-owned and becomes the idempotency header. The SDK never replaces it during retry. A timed-out send is recovered by repeating the identical input and ID. Read cursors advance monotonically; equal or older retries return `changed: false`. Unread totals remain server-authoritative.

### Capabilities and private attachments

```typescript
messages.getMessagingCapabilities(options?)
messages.createThreadAttachmentUpload(perspective, threadId, input, options?)
messages.uploadThreadAttachment(authorization, body, options?)
messages.getThreadAttachmentUpload(perspective, threadId, uploadId, options?)
messages.createThreadAttachmentDownload(perspective, threadId, attachmentId, options?)
```

Hide Messaging v2 surfaces unless capabilities report `http.enabled`, and only start managed realtime when `realtime.enabled` is true and a supported `realtime.protocol_versions` value is present. Hide attachment controls unless capabilities report `attachments.enabled`. The full capability response also exposes `api_version`, rollout-state declarations (`dual_write`, `shadow_read`, and `require_thread`), and top-level `protocol_versions`. Upload accepts `Blob`, `ArrayBuffer`, or an `ArrayBufferView` whose exact byte length matches the authorization. Upload/download URLs contain short-lived application tickets, never access/refresh tokens or permanent storage credentials. Do not persist or log tickets.

### Managed realtime

```typescript
const connection = messages.createMessagesRealtimeConnection({
  perspective: { kind: 'buyer' },
  resumeCursor,
})

const off = connection.onEvent(async (event) => {
  // Reconcile validated typed events only.
})
connection.subscribeThread(threadId)
await connection.start()

// Later
connection.setTyping(threadId, true)
off()
connection.close()
```

`connectMessagesRealtime(options)` is the create-and-start convenience method. The managed state machine is `connecting | open | reconnecting | closed | failed`. It obtains a fresh one-use ticket on every reconnect, applies bounded exponential backoff with full jitter, resumes from the last acknowledged cursor, deduplicates stable event IDs, rejects malformed/unsupported frames, and ACKs only after listeners finish. `resync.required` tells the application to rebuild authoritative HTTP state. Close codes for invalid session, removed perspective authorization, and protocol mismatch are terminal.

A custom `webSocketFactory` may be supplied in `MitumbaClientConfig`; otherwise `globalThis.WebSocket` is used. No mandatory runtime dependency is added.

### Legacy link/archive compatibility

```typescript
messages.resolveLegacyLink(input, options?)
messages.listLegacyMessageArchives(params?, options?)
messages.listLegacyMessages(legacyThreadId, params?, options?)
```

Legacy archives are read-only. The resolver returns a canonical conversation/thread, an explicit store choice, an archive ID, or unavailable; it never guesses between stores.

### Messaging errors

Use `isMessagingAPIError(error, code?)` for documented codes. Retry network errors, `temporarily_unavailable`, and rate limits according to policy. Do not retry `session_expired`, removed perspective authorization, protocol mismatch, or an idempotency key reused with changed content. Native `AbortError` is preserved.

---

## Messaging v2 contract (`/notify/v2`) — methods not yet available

> **Contract-only:** The types below are exported for cross-client integration work. Runtime SDK methods and live endpoint availability land in later reviewed changes. Existing partner-based methods above remain unchanged throughout the 1.x compatibility period.

Every successful Messaging v2 operation uses a versioned envelope:

```typescript
interface ApiResponse<T> {
  api_version: 2
  data: T
}
```

Every resource request selects an explicit acting perspective. Store author projections expose the store only—never the human operator:

```typescript
type MessagingPerspective =
  | { kind: 'buyer' }
  | { kind: 'store'; store_id: string }

type MessageAuthor =
  | { side: 'buyer'; buyer: BuyerSummary }
  | { side: 'store'; store: StoreSummary }
```

The public hierarchy is one all-time Buyer/Store conversation containing isolated General, Listing, and Order thread cards. The conversation itself contains no loose messages. `ThreadCard` correlates `kind` with its matching `ThreadSubject`, so a Listing card cannot carry an Order subject.

```typescript
type ThreadSubject =
  | { kind: 'general' }
  | {
      kind: 'listing'
      listing_id: string
      title: string
      image_url: string | null
      availability: 'active' | 'sold' | 'inactive' | 'unknown'
    }
  | {
      kind: 'order'
      order_id: string
      short_id: string
      listing_title: string
      image_url: string | null
      order_status: string
    }

interface ConversationSummary {
  id: ConversationId
  buyer: BuyerSummary
  store: StoreSummary
  last_thread: ThreadCard | null
  unread_count: number
  last_activity_at: string
  preferences: { archived: boolean; muted: boolean }
  created_at: string
  updated_at: string
}
```

Thread timelines are ascending sequences of canonical human messages and typed server system events. Listing-to-Order and Order-to-Listing links correlate direction with the related subject at compile time.

```typescript
type ThreadTimelineItem =
  | { kind: 'message'; message: ThreadMessage }
  | { kind: 'system'; event: ThreadSystemEvent }

interface MessagePage {
  items: ThreadTimelineItem[]
  older_cursor: MessagingCursor | null
  newer_cursor: MessagingCursor | null
  has_older: boolean
  has_newer: boolean
}
```

Message sends require a caller-owned `client_message_id`. The eventual SDK method maps that value to `Idempotency-Key`, omits it from request JSON, and returns the canonical accepted/deduplicated result. Callers retain the same identifier after ambiguous failure. Message bodies remain required after trimming and are limited to 1–2,000 characters.

```typescript
interface SendThreadMessageInput {
  client_message_id: string
  body: string
  reply_to_message_id?: MessageId
  attachment_ids?: string[]
}

interface SendThreadMessageResult {
  message: ThreadMessage
  deduplicated: boolean
  policy: { body_modified: boolean; notices: string[] }
}
```

Message pagination accepts `before` or `after`, never both. Read state advances monotonically by a committed message or system-event ID. Optional attachment declarations remain capability-gated; clients hide controls until the server reports the capability enabled. Ambiguous historic partner messages use exported read-only Legacy archive types and cannot be sent to, marked unread, or used for typing.

Messaging-specific `APIError` values can be narrowed without parsing arbitrary error text:

```typescript
try {
  // Future perspective-scoped Messaging v2 method.
} catch (error) {
  if (isMessagingAPIError(error, 'cursor_expired')) {
    // Discard the expired cursor and perform an authoritative refetch.
  }
}
```

The exported error vocabulary covers validation, authorization, missing resources, context/idempotency/cursor conflicts, blocking, capability and upgrade gates, rate limits, temporary/internal failures, and `network_error`. `RealtimeProtocolError` and `RealtimeUnavailableError` provide stable messages without echoing untrusted realtime frames.

---

## Notifications Module (`/notify/notifications`)

### `GET /notify/notifications` — List notifications

**Auth:** Protected  
**Query:** `page?`  
**Response:** `{ data: Notification[], unread_count: number, page: number }`

```typescript
interface Notification {
  id: string
  user_id: string
  type: 'order' | 'message' | 'price_drop' | 'offer' | 'payout' | 'system'
  title: string
  body: string
  metadata: string | null
  read_at: string | null
  created_at: string
}
```

---

### `POST /notify/notifications/read` — Mark notifications as read

**Auth:** Protected  
**Body:** `{ ids?: string[] }` _(omit to mark all as read)_  
**Response:** `200 { ok: true }`

---

## Mailer Module (`/notify/email`)

### `POST /notify/email` — Send transactional email

**Auth:** Protected  
**Body:** `{ template: MailerTemplate, to: string, variables: Record<string, string> }`  
**Response:** `200 { ok: true }`

**Available templates (39):** `welcome`, `email-verification`, `password-reset`, `new-login`, `2fa-enabled`, `2fa-disabled`, `account-suspended`, `order-created`, `order-confirmed`, `order-shipped`, `order-delivered`, `order-cancelled`, `seller-new-order`, `seller-ship-reminder`, `payment-success`, `payment-failed`, `payout-complete`, `new-message`, `store-created`, `listing-sold`, `review-received`, `price-drop`, `weekly-digest`, `session-revoked`, `password-changed`, `linked-account-connected`, `seller-onboarding-complete`, `store-follower`, `listing-expired`, `vazi-outfit-match`, `seller-payout-failed`, `offer-received`, `offer-accepted`, `cart-abandoned`, `wishlist-back-in-stock`, `order-disputed`, `dispute-resolved`, `address-changed`, `payment-method-added`

---

## Share URLs (`go.mitumba.africa`)

Pure helpers, with no network call, for the canonical share links that open the Mitumba app when it's installed and otherwise show a rich preview. Use them for every share button, `navigator.share` call and clipboard fallback. Never hand-build these URLs.

```ts
import { listingShareUrl, storeShareUrl, baleShareUrl } from '@mitumba/sdk'

listingShareUrl('3f9c0d2e4b7a41e8a5c6d7e8f9a0b1c2') // https://go.mitumba.africa/l/3f9c0d2e4b7a41e8a5c6d7e8f9a0b1c2
storeShareUrl('Mama-Wanjiku')                       // https://go.mitumba.africa/s/mama-wanjiku
baleShareUrl(baleId, { origin: process.env.NEXT_PUBLIC_SHARE_ORIGIN }) // staging override
```

| Function | Input rule | Throws |
|---|---|---|
| `listingShareUrl(id, options?)` | 32 hex characters (case-insensitive) | `TypeError` for anything else |
| `storeShareUrl(slug, options?)` | `a-z0-9` words joined by single hyphens, ≤ 64 | `TypeError` |
| `baleShareUrl(id, options?)` | 32 hex characters | `TypeError` |

`options.origin` defaults to `DEFAULT_SHARE_ORIGIN` (`https://go.mitumba.africa`). It must be an `https://` origin, or `http://localhost` for development, with no path, query or credentials.

## Shared Types Quick Reference

### Enums

```typescript
type UserRole = 'buyer' | 'seller' | 'bale_seller' | 'admin'
type SellerType = 'individual' | 'bale'
type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected'
type Condition = 'new' | 'like_new' | 'good' | 'fair'
type ListingStatus = 'draft' | 'active' | 'sold' | 'removed'
type OrderStatus = 'created' | 'payment_pending' | 'paid' | 'seller_confirmed'
               | 'shipped' | 'delivered' | 'completed' | 'cancelled' | 'disputed'
type PaymentStatus = 'initiated' | 'funded' | 'failed' | 'refunded' | 'cancelled'
type GarmentType = 'top' | 'bottom' | 'shoes' | 'accessory' | 'dress' | 'outerwear' | 'bag' | 'kids'
type SubscriptionTier = 'free' | 'pro' | 'premium'
type NotificationType = 'order' | 'message' | 'price_drop' | 'offer' | 'payout' | 'system'
type PaymentMethodType = 'mpesa' | 'mpesa_till' | 'airtel' | 'telkom' | 'card'
type LinkedAccountProvider = 'google' | 'apple'
```

---

## IAM Module (`/auth/iam`, `/auth/orgs`)

IAM users are operator principals scoped to one organization. They are separate from consumer accounts. Root continues to use the ordinary Auth module.

### `POST /auth/iam/login` — Start IAM sign-in

**Auth:** Public  
**Body:** `{ org: string, email: string, password: string }` where `org` is a 12-digit organization ID (plain, spaced, or hyphenated) or an organization alias.  
**Response:** either:

```typescript
{ access_token, refresh_token, expires_in: 900, principal_type: 'iam', org_id, second_factor_enrolled: false }
```

or:

```typescript
{ requires_2fa: true, temp_token, methods: { id, type: 'totp' | 'passkey', label }[] }
```

**Errors:** `invalid_input` (400), `invalid_credentials` (401), `organization_suspended` (403), `principal_disabled` (403), `too_many_attempts` (429)

### `POST /auth/iam/login/2fa` — Finish IAM sign-in with TOTP or backup code

**Auth:** Public; temporary sign-in token  
**Body:** `{ temp_token: string, code: string, method_id?: string }`  
**Response:** IAM token response  
**Errors:** `invalid_input` (400), `invalid_code` (400), `expired` (401), `too_many_attempts` (429)

### `POST /auth/iam/login/passkey/start` — Start IAM passkey verification

**Auth:** Public; temporary sign-in token  
**Body:** `{ temp_token: string }`  
**Response:** `{ options: PublicKeyCredentialRequestOptionsJSON }`  
**Errors:** `invalid_input` (400), `not_found` (400), `expired` (401), `too_many_attempts` (429)

### `POST /auth/iam/login/passkey/finish` — Finish IAM passkey verification

**Auth:** Public; temporary sign-in token  
**Body:** `{ temp_token: string, credential: AuthenticationResponseJSON }`  
**Response:** IAM token response  
**Errors:** `invalid_input` (400), `invalid_code` (400), `expired` (400/401), `too_many_attempts` (429)

### `POST /auth/iam/activate` — Activate an invited IAM user

**Auth:** Public; one-time activation code  
**Body:** `{ org: string, email: string, code: string, password: string }`  
**Response:** `{ ok: true, next_step: string }`  
**Errors:** `invalid_input` (400), `invalid_activation` (400), `too_many_attempts` (429)

### `POST /auth/iam/refresh` — Rotate an IAM session

**Auth:** Public; refresh token  
**Body:** `{ refresh_token: string }`  
**Response:** IAM token response  
**Errors:** `invalid_input` (400), `invalid_token` (401), `token_expired` (401), `session_revoked` (401)

### `POST /auth/iam/logout` — End an IAM session

**Auth:** Public; refresh token  
**Body:** `{ refresh_token: string }`  
**Response:** `{ ok: true }`

### `GET /auth/iam/me` — Get the current IAM principal

**Auth:** IAM session  
**Response:**

```typescript
{
  id, email, display_name, status,
  organization: { id, display_id, alias, name, kind, status, parent_id, created_at, updated_at },
  permissions: AdminPermission[],
  two_factor_methods_count: number,
  backup_codes_remaining: number,
  admin_enrolment_required: boolean
}
```

### IAM second-factor management

- `GET /auth/iam/2fa/methods` → `{ methods: TwoFactorMethod[] }`
- `POST /auth/iam/2fa/methods` body `{ type: 'totp' | 'passkey', label?: string }`
  - TOTP response: `{ id, otpauth_uri, secret }`
  - Passkey response: `{ method_id, options }`
- `POST /auth/iam/2fa/methods/:id/verify` body `{ code }` → `{ ok: true, backup_codes? }`
- `POST /auth/iam/2fa/methods/:id/passkey/finish` body `RegistrationResponseJSON` → `{ ok: true, backup_codes? }`

**Auth:** IAM session. SMS and email are not supported as IAM factors.

### `GET /auth/orgs` — List organizations

**Auth:** Root/global operator with organization-management permission  
**Response:** `{ organizations: OrganizationSummary[], kinds: ('product' | 'department' | 'team')[] }`

### `POST /auth/orgs` — Create an organization

**Auth:** Root/global operator with organization-management permission  
**Body:** `{ alias, name, kind, parent_id? }`  
**Response:** `201 { organization }`  
**Errors:** `invalid_input` (400), `invalid_alias` (400), `invalid_kind` (400), `parent_not_found` (400), `alias_taken` (409)

### `PATCH /auth/orgs/:orgId` — Update an organization

**Auth:** Root/global operator with organization-management permission  
**Body:** `{ name?: string, status?: 'active' | 'suspended' }`  
**Response:** `{ organization }`  
**Errors:** `invalid_input` (400), `not_found` (404)

Suspending an organization immediately ends its IAM sessions.

### `GET /auth/orgs/:orgId/iam-users` — List IAM users

**Auth:** Root/global operator with organization-management permission  
**Response:** `{ organization, iam_users: IamUser[], grantable_permissions: AdminPermission[] }`

### `POST /auth/orgs/:orgId/iam-users` — Create an IAM user

**Auth:** Root/global operator with organization-management permission  
**Body:** `{ email, display_name?, permissions?: AdminPermission[] }`  
**Response:**

```typescript
{
  iam_user: IamUser,
  activation: { code, expires_at, org_id, org_alias, org_display_id }
}
```

The activation code is returned once.  
**Errors:** `invalid_input` (400), `permission_not_grantable` (400), `domain_not_permitted` (403), `not_found` (404), `email_taken` (409), `organization_suspended` (409)

### IAM-user administration

- `POST /auth/orgs/:orgId/iam-users/:id/permissions` body `{ permission }` → `{ ok, permissions }`
- `DELETE /auth/orgs/:orgId/iam-users/:id/permissions/:permission` → `{ ok, revoked, permissions }`
- `POST /auth/orgs/:orgId/iam-users/:id/status` body `{ status: 'active' | 'disabled' }` → `{ ok, status }`
- `POST /auth/orgs/:orgId/iam-users/:id/activation` → `{ activation }`

**Auth:** Root/global operator with organization-management permission. Disabling a user or revoking a permission immediately ends that principal's sessions.

## Identity provider (`/admin/clients`, `/auth/oidc/keys`)

These are operator endpoints for the OIDC provider. Relying parties discover the endpoints at `GET /auth/oauth/openid-configuration` and verify tokens against `GET /auth/oauth/jwks.json`. The issuer is `https://api.mitumba.africa`.

### Sign-in clients — `sdk.admin.*OAuthClient*`

**Auth:** an operator holding `clients:manage`

| Method | Endpoint | Response |
|---|---|---|
| `listOAuthClients()` | `GET /admin/clients` | `{ clients: OAuthClientSummary[] }` |
| `getOAuthClient(id)` | `GET /admin/clients/:clientId` | `OAuthClient` (adds `redirect_uris`, `scopes`) |
| `registerOAuthClient(input)` | `POST /admin/clients` | `201 RegisteredOAuthClient` |
| `deactivateOAuthClient(id)` | `POST /admin/clients/:clientId/deactivate` | `{ ok: true, is_active: false }` |
| `setOAuthClientRedirectUris(id, uris)` | `PUT /admin/clients/:clientId/redirect-uris` | `{ ok: true, redirect_uris }` |
| `setOAuthClientScopes(id, scopes)` | `PUT /admin/clients/:clientId/scopes` | `{ ok: true, scopes }` |

- **Registering:** a `confidential` client gets a `client_secret`. It appears **only** in the registration response, because only its hash is stored. A `public` client (SPA or mobile) has no secret and must use PKCE.
- **Redirect URIs** match exactly, with no wildcards or prefixes. Each `PUT` replaces the whole set atomically.
- **Deactivating:** clients are deactivated, never deleted.

**Errors:** `invalid_input` (400), `not_found` (404), `forbidden` (403)

### Signing keys — `sdk.admin.listOidcSigningKeys()`, `sdk.admin.rotateOidcSigningKey()`

**Auth:** an operator holding `oidc:rotate_keys`

- `GET /auth/oidc/keys` → `{ keys: OidcSigningKey[] }`
  - Ordered current, then previous, then retired.
  - Each entry has `kid`, `alg`, `status`, `created_at` and `rotated_at`. Key material is never returned.
- `POST /auth/oidc/keys/rotate` → `201 { ok: true, kid }`
  - The new key becomes `current`, the old current becomes `previous` (still published in JWKS), and the old previous is `retired`.
  - Every rotation is recorded on the admin audit trail.

Do not rotate twice within one id_token lifetime (1 hour). Doing so retires a key that signed tokens still in use.

**Errors:** `forbidden` (403), `not_configured` (503, the key-encryption secret is missing and nothing was written)
