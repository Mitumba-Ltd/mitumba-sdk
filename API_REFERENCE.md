# @mitumba/sdk — API Reference

Complete reference for every endpoint the SDK wraps. All paths are relative to the base URL.

**Base URL:** `https://api.mitumba.stanl.ink`

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

### `POST /orders/checkout` — Checkout cart

**Auth:** Protected  
**Response:** `200 { order_ids: string[], count: number }`

> Creates orders grouped by store and clears the cart.

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

### `GET /pay/status/:order_id` — Poll payment status

**Auth:** Protected  
**Response:** `{ id, status: 'initiated' | 'funded' | 'failed' | 'refunded' | 'cancelled', total }`  
**Errors:** `not_found` (404)

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

## Messages Module (`/notify/messages`)

### `GET /notify/messages` — List conversations

**Auth:** Protected  
**Query:** `store_id?` (filter by store inbox)  
**Response:** `{ data: Conversation[] }`

```typescript
interface Conversation {
  id: string
  sender_id: string
  receiver_id: string
  partner_id: string
  partner_name: string | null
  body: string
  listing_id: string | null
  listing_title: string | null
  store_id: string | null
  read_at: string | null
  created_at: string
}
```

---

### `GET /notify/messages/:partnerId` — Get message thread

**Auth:** Protected  
**Query:** `store_id?`  
**Response:** `{ data: Message[] }`

```typescript
interface Message {
  id: string
  sender_id: string
  receiver_id: string
  body: string
  listing_id: string | null
  store_id: string | null
  read_at: string | null
  created_at: string
}
```

---

### `POST /notify/messages` — Send a message

**Auth:** Protected  
**Body:** `{ receiver_id, body, listing_id?, store_id? }`  
**Response:** `201 { id: string }`

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
