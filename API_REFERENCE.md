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

**Dual-mode** — behavior depends on server-side config:

| Mode | Request Body | Response (Success) |
|---|---|---|
| Email + Password | `{ email: string, password: string (min 8), display_name?: string }` | `201 { access_token, refresh_token, expires_in: 900 }` |
| Phone OTP | `{ phone: string }` _(format: `+254XXXXXXXXX`)_ | `200 { message: "OTP sent. Verify with POST /auth/otp/verify" }` |

**Errors:**

| Code | Status | Reason |
|---|---|---|
| `invalid_input` | 400 | Validation failure |
| `email_taken` | 409 | Email already registered |
| `otp_rate_limited` | 429 | Too many OTP requests (max 3/hour) |
| `otp_send_failed` | 502 | SMS delivery failure |

---

### `POST /auth/login` — Log in to existing account

**Auth:** Public

| Mode | Request Body | Response (Success) |
|---|---|---|
| Email + Password | `{ email: string, password: string }` | `200 { access_token, refresh_token, expires_in: 900 }` |
| Phone OTP | `{ phone: string }` | `200 { message: "OTP sent. Verify with POST /auth/otp/verify" }` |

**Errors:**

| Code | Status | Reason |
|---|---|---|
| `invalid_input` | 400 | Validation failure |
| `invalid_credentials` | 401 | Wrong email or password |
| `account_suspended` | 403 | Account frozen |

---

### `POST /auth/otp/send` — Send OTP code

**Auth:** Public

**Body:** `{ phone: string }` _(format: `+254XXXXXXXXX`)_

**Response:** `200 { message: "OTP sent." }`

**Errors:**

| Code | Status | Reason |
|---|---|---|
| `sms_otp_disabled` | 400 | SMS OTP not enabled on platform |
| `invalid_input` | 400 | Invalid phone format |
| `otp_rate_limited` | 429 | Max 3 sends per phone per hour |
| `otp_send_failed` | 502 | SMS provider failure |

---

### `POST /auth/otp/verify` — Verify OTP code

**Auth:** Public

**Body:** `{ phone: string, code: string }` _(code is 6 digits)_

**Response:** `200 { access_token: string, refresh_token: string, expires_in: 900 }`

> If the phone is new, an account is auto-created with the `buyer` role.

**Errors:**

| Code | Status | Reason |
|---|---|---|
| `sms_otp_disabled` | 400 | SMS OTP not enabled |
| `invalid_input` | 400 | Validation failure |
| `otp_expired` | 400 | OTP expired (10min TTL) |
| `otp_max_attempts` | 400 | Too many wrong attempts (max 5) |
| `otp_invalid` | 400 | Wrong code |
| `account_suspended` | 403 | Account frozen |

---

### `POST /auth/refresh` — Refresh token pair

**Auth:** Public

**Body:** `{ refresh_token: string }` _(64-char hex)_

**Response:** `200 { access_token: string, refresh_token: string, expires_in: 900 }`

> Old refresh token is revoked (rotation). Store the new pair.

**Errors:**

| Code | Status | Reason |
|---|---|---|
| `invalid_input` | 400 | Validation failure |
| `invalid_token` | 401 | Token revoked or not found |
| `token_expired` | 401 | Refresh token expired (30-day TTL) |

---

### `POST /auth/logout` — Revoke refresh token

**Auth:** Protected (JWT required)

**Body:** `{ refresh_token: string }`

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

**Response:** Paginated listings with seller profile data:

```typescript
{
  data: Array<{
    id: string
    seller_id: string
    title: string
    description: string | null
    category_id: string
    city_id: string
    price: number              // KES integer
    condition: 'new' | 'like_new' | 'good' | 'fair'
    status: 'active'
    photo_verified: boolean
    vazi_eligible: boolean
    created_at: string
    updated_at: string
    // Seller profile (joined)
    sti_score: number
    verification_status: string
    seller_type: 'individual' | 'bale'
  }>
  total: number
  page: number
  page_size: number
  has_more: boolean
}
```

---

### `GET /listings/:id` — Get listing details

**Auth:** Public

**Response:** Single listing with images and seller profile:

```typescript
{
  // ... all listing fields
  sti_score: number
  verification_status: string
  seller_type: string
  images: Array<{
    id: string
    listing_id: string
    url: string
    position: number
    created_at: string
  }>
}
```

**Errors:** `not_found` (404)

---

### `POST /listings` — Create a new listing

**Auth:** Protected (seller only)

**Body:**

```typescript
{
  title: string           // 3–120 chars
  description?: string    // max 1000 chars
  category_id: string
  city_id: string
  price: number           // integer, min 50 KES
  condition: 'new' | 'like_new' | 'good' | 'fair'
}
```

**Response:** `201` — Created listing (status: `draft`)

**Errors:**

| Code | Status | Reason |
|---|---|---|
| `not_a_seller` | 403 | User doesn't have seller role |
| `invalid_category` | 400 | Category ID not found |
| `invalid_city` | 400 | City ID not found |
| `invalid_input` | 400 | Validation failure |

---

### `PUT /listings/:id` — Update listing

**Auth:** Protected (owner only)

**Body:** Partial of create fields (all optional)

**Errors:**

| Code | Status | Reason |
|---|---|---|
| `not_found` | 404 | Listing not found |
| `listing_immutable` | 400 | Can't edit sold or removed listings |

---

### `PATCH /listings/:id/status` — Change listing status

**Auth:** Protected (owner only)

**Body:** `{ status: 'active' | 'sold' | 'removed' }`

**State Machine:**

```
draft  → active, removed
active → sold, removed
sold   → (terminal)
removed → (terminal)
```

**Errors:** `invalid_transition` (400), `not_found` (404)

---

### `DELETE /listings/:id` — Soft delete listing

**Auth:** Protected (owner only)

Sets status to `removed`. Does not permanently delete.

**Response:** `200 { ok: true }`

---

### `GET /listings/seller/:seller_id` — Seller storefront

**Auth:** Public

**Query:** `page?`, `page_size?` (max 50)

**Response:**

```typescript
{
  seller: {
    id: string
    sti_score: number
    verification_status: string
    seller_type: string
  }
  listings: Listing[]
  total: number
  page: number
  page_size: number
  has_more: boolean
}
```

**Errors:** `not_found` (404) if seller profile doesn't exist

---

### `GET /listings/categories` — List categories

**Auth:** Public

**Response:** Array of `{ id: string, name: string, slug: string }`

---

### `GET /listings/cities` — List supported cities

**Auth:** Public

**Response:** Array of `{ id: string, name: string, delivery_fee: number }`

---

### `POST /listings/:id/images/presign` — Get image upload slot

**Auth:** Protected (owner only)

**Body:** `{ index: number }` _(0–9, max 10 images per listing)_

**Response:** `201 { upload_url: string, image_id: string }`

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

**Response:** Paginated search results with relevance ranking:

```typescript
{
  data: Array<{
    // ... listing fields
    rank: number                // FTS relevance score
    sti_score: number
    verification_status: string
    seller_type: string
  }>
  total: number
  page: number
  page_size: number
  has_more: boolean
}
```

---

### `GET /search/trending` — Trending search terms

**Auth:** Public

**Query:** `city_id?` _(defaults to `'all'`)_

**Response:**

```typescript
{
  terms: Array<{ term: string, count: number }>  // top 20
}
```

---

## Orders Module (`/orders`)

### `POST /orders` — Create an order

**Auth:** Protected

**Body:** `{ listing_id: string }`

**Response:** `201`

```typescript
{
  order_id: string
  total: number          // listing price + delivery fee (KES)
  delivery_fee: number   // KES
}
```

**Errors:**

| Code | Status | Reason |
|---|---|---|
| `not_found` | 404 | Listing not found |
| `invalid_input` | 400 | Can't buy your own listing |

---

### `GET /orders/:id` — Get order details

**Auth:** Protected (buyer or seller of the order)

**Response:** Full order with event timeline:

```typescript
{
  id: string
  buyer_id: string
  seller_id: string
  listing_id: string
  amount: number
  delivery_fee: number
  total: number
  status: OrderStatus
  city_id: string
  created_at: string
  updated_at: string
  events: Array<{
    id: string
    order_id: string
    actor: string            // user ID or 'system'
    old_status: string
    new_status: string
    note: string | null
    created_at: string
  }>
}
```

**Errors:** `not_found` (404)

---

### `POST /orders/:id/transition` — Transition order status

**Auth:** Protected (buyer or seller, depending on transition)

**Body:** `{ status: OrderStatus, note?: string }`

**Order State Machine:**

```
created → payment_pending → paid → seller_confirmed → shipped → delivered → completed
                                                                      ↗ (auto after 48h)
Any early stage → cancelled
paid / shipped  → disputed
```

**Role-based transitions:**
- **System:** `created → payment_pending` (automatic on order creation)
- **System:** `payment_pending → paid` (automatic after payment confirmation)
- **Seller:** `paid → seller_confirmed → shipped`
- **Buyer:** `delivered → completed`
- **Buyer:** `pending → cancelled`
- **Either:** `→ disputed` (from `paid` or `shipped`)
- **System:** `shipped → completed` (auto-completed after 48h if buyer doesn't confirm delivery)

**Errors:** `invalid_transition` (400), `not_found` (404)

---

### `GET /orders/history` — Order history

**Auth:** Protected

**Query Parameters:**

| Param | Type | Default | Description |
|---|---|---|---|
| `role` | enum | `buyer` | `buyer` or `seller` perspective |
| `page` | int | `1` | Page number |

**Response:** `{ data: Order[], page: number, page_size: 20 }`

---

## Pay Module (`/pay`)

### `POST /pay/stk` — Initiate M-Pesa STK Push

**Auth:** Protected (buyer)

**Body:**

```typescript
{
  order_id: string
  phone: string          // +254XXXXXXXXX
}
```

**Response:** `201`

```typescript
{
  payment_id: string
  provider: string
}
```

**Errors:**

| Code | Status | Reason |
|---|---|---|
| `invalid_input` | 400 | Validation failure |
| `order_not_found` | 404 | Order doesn't exist |
| `invalid_order_status` | 400 | Order not in `payment_pending` status |

---

### `GET /pay/status/:order_id` — Poll payment status

**Auth:** Protected (buyer)

**Response:**

```typescript
{
  id: string
  status: 'initiated' | 'funded' | 'failed' | 'refunded' | 'cancelled'
  total: number
}
```

**Errors:** `not_found` (404)

> **Note:** Payment confirmation happens asynchronously via server-to-server callbacks. Use `getStatus()` to poll for payment completion.

---

## Vazi Module (`/vazi`)

VAZI (Swahili for "garment") provides AI-powered outfit assembly from the listings catalog.

### `GET /vazi/feed` — Browse outfit feed

**Auth:** Public

**Query Parameters:**

| Param | Type | Default | Description |
|---|---|---|---|
| `limit` | int | `20` | Items per page (1–50) |
| `offset` | int | `0` | Offset for pagination |

**Response:**

```typescript
{
  outfits: VAZIOutfit[]
  total: number
  limit: number
  offset: number
}
```

**`VAZIOutfit` shape:**

```typescript
{
  id: string
  name: string                    // e.g., "Nairobi Drip"
  items: VAZIOutfitItem[]
  total_price_kes: number
  sellers_count: number
  is_multi_city: boolean
  assembled_at: string            // ISO timestamp
}
```

**`VAZIOutfitItem` shape:**

```typescript
{
  listing_id: string
  garment_type: 'top' | 'bottom' | 'shoes' | 'accessory' | 'dress' | 'outerwear'
  price_kes: number
  seller_id: string
  seller_sti: number
  seller_city: string
  image_url: string | null
  is_seed: boolean                // true = the "anchor" item of the outfit
  final_score: number             // 0–1 relevance score
}
```

---

### `GET /vazi/complete/:listing_id` — Complete an outfit

**Auth:** Public

Given a listing, returns a complete outfit built around it.

**Response:** `{ outfits: [VAZIOutfit] }`

**Errors:** `not_found` (404) if listing not found or not VAZI-eligible

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
type StyleTier = 'casual' | 'smart_casual' | 'streetwear' | 'formal' | 'vintage' | 'sportswear' | 'traditional'
```
