# @mitumba/sdk

The official isomorphic TypeScript SDK for the Mitumba marketplace platform.

[![CI](https://github.com/Mitumba-Ltd/mitumba-sdk/actions/workflows/ci.yml/badge.svg)](https://github.com/Mitumba-Ltd/mitumba-sdk/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@mitumba/sdk.svg)](https://www.npmjs.com/package/@mitumba/sdk)

## Features

- **Perfectly Typed**: 100% written in strict TypeScript. Zero `any` types.
- **Isomorphic**: Runs natively in Node.js, Cloudflare Workers, Next.js, and the Browser using the native `fetch` API.
- **Zero Dependencies**: Lightweight and extremely fast.
- **Auto-Token Rotation**: Automatically handles refresh tokens under the hood.

## Installation

```bash
npm install @mitumba/sdk
# or
yarn add @mitumba/sdk
# or
pnpm add @mitumba/sdk
```

## Quick Start

Initialize the client with the environment's base URL:

```typescript
import { MitumbaClient } from '@mitumba/sdk'

const mitumba = new MitumbaClient({
  baseUrl: 'https://api.mitumba.stanl.ink'
})
```

If you already have a token (e.g. from local storage), pass it to the client:

```typescript
mitumba.setToken('eyJhbGciOiJIUzI1...', 'my-refresh-token-hex')
```

## API Overview

The SDK is split into 5 core modules representing the marketplace domains.

### 1. Auth Module (`mitumba.auth`)

Mitumba supports dual-mode authentication: Email + Password, or Phone OTP (SMS). The SDK strongly types both inputs.

```typescript
// Email Login
const tokens = await mitumba.auth.login({ 
  email: 'user@example.com', 
  password: 'password123' 
})

// OTP Login
const { message } = await mitumba.auth.login({ phone: '+254700000000' })
const tokens = await mitumba.auth.verifyOtp({ phone: '+254700000000', code: '123456' })

// Provide the tokens to the client to authenticate future requests
mitumba.setToken(tokens.access_token, tokens.refresh_token)
```

### 2. Listings Module (`mitumba.listings`)

Browse, search, and manage inventory.

```typescript
// Fetch the marketplace feed with filters
const feed = await mitumba.listings.getFeed({
  city_id: 'nbi_01',
  condition: 'like_new',
  sort: 'recency'
})

// Create a new listing (requires seller role)
const listing = await mitumba.listings.create({
  title: 'Vintage Denim Jacket',
  category_id: 'cat_outerwear',
  city_id: 'nbi_01',
  price: 2500,
  condition: 'good'
})
```

### 3. Search Module (`mitumba.search`)

AI-powered full-text search.

```typescript
// Search with ranking
const results = await mitumba.search.search({
  q: 'vintage jacket',
  sort: 'relevance'
})

// Get trending search terms
const trending = await mitumba.search.getTrending('nbi_01')
```

### 4. Orders & Pay Modules (`mitumba.orders`, `mitumba.pay`)

End-to-end checkout with provider-neutral payment initiation.

> `pay.initiateCheckout()` targets the documented backend route pending deployment. Confirm backend availability before using it in production.

```typescript
// 1. Create an order
const { order_id, total } = await mitumba.orders.create({ listing_id: 'lst_123' })

// 2. Select a payment method; the API selects the provider
const initiation = await mitumba.pay.initiateCheckout({
  order_id,
  idempotency_key: 'checkout-attempt-123',
  method: { type: 'mobile_money', phone: '+254700000000' }
})

// 3. Continue only through the returned action
if (initiation.next_action.type === 'redirect') {
  const { url, expires_at } = initiation.next_action
  // Open the absolute HTTPS URL in your app's navigation layer.
} else {
  // Wait for out-of-band confirmation on the buyer's device.
}

// 4. Initiation is not payment success; poll the checkout lifecycle
const checkout = await mitumba.pay.getCheckoutStatus(order_id)

if (!checkout.terminal) {
  console.log(`Poll again after ${checkout.poll_after_ms}ms`)
}

if (checkout.checkout_status === 'paid') {
  console.log(`Order ${checkout.order_id} is paid`)
}
```

If an initiation request is cancelled or its result is lost, retry the identical input with the same `idempotency_key` to recover the authoritative result. Reusing the key with different input returns `idempotency_conflict`.

`pay.initMpesa()`, `pay.initPaystack()`, and `pay.initiateStk()` remain source- and runtime-compatible while the provider-neutral endpoint is introduced. `pay.getStatus(orderId)` also remains available, but is deprecated because its legacy response does not represent the aggregate retail/bale checkout lifecycle. New integrations should use `getCheckoutStatus()` and follow `terminal`, `retryable`, and `poll_after_ms` rather than interpreting an individual payment attempt as order success.

### 5. Vazi Module (`mitumba.vazi`)

AI-assembled outfit feeds.

```typescript
// Browse the curated outfits feed
const feed = await mitumba.vazi.getFeed({ limit: 10, offset: 0 })

// Get a full outfit built around a specific seed item
const { outfits } = await mitumba.vazi.completeOutfit('lst_123')
```

## Error Handling

All API errors are wrapped in a standard `APIError` object.

```typescript
import { APIError } from '@mitumba/sdk'

try {
  await mitumba.auth.login({ email: 'bad', password: 'bad' })
} catch (error) {
  if (error instanceof APIError) {
    console.error(error.code)    // e.g. "invalid_credentials"
    console.error(error.status)  // e.g. 401
    console.error(error.message) // "Wrong email or password"
  }
}
```

## License

MIT

---

## Contributing & Releasing

We use [Changesets](https://github.com/changesets/changesets) for automated versioning and changelog generation.

When submitting a PR that requires a package version bump, run:

```bash
npx changeset
```

Select the appropriate version bump (`patch`, `minor`, `major`) and provide a description of your changes. Commit the generated markdown file along with your PR. 

When your PR is merged, the automated workflow will handle updating the version, aggregating the changelog, and publishing to NPM.
