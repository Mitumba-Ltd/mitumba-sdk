<p align="center">
  <img src="https://cloud.stanlink.online/mitumba/assets/images/brand/mitumba-textmark-processed.png" alt="Mitumba SDK" height="48" />
</p>

<p align="center">
  <strong>@mitumba/sdk</strong><br/>
  The official TypeScript SDK for the Mitumba marketplace platform.
</p>

---

## What this is

This repository contains the strongly-typed API client (`@mitumba/sdk`) for the Mitumba platform. It acts as the bridge between any frontend consumer (Next.js web marketplace, Admin dashboard, React Native mobile apps) and the Mitumba API.

By extracting the API logic into this SDK, we ensure:
1.  **Type Safety:** End-to-end type safety from the API to the UI.
2.  **Decoupled UX:** Frontend apps focus entirely on UX and state, not fetch headers, JWT persistence, or base URLs.
3.  **Extensibility:** A public-facing contract that allows third parties (or future internal tools) to interact with the Mitumba ecosystem seamlessly.

---

## Architecture

The SDK is organized by domain modules, matching our API architecture:

-   `sdk.auth` — Login, registration, OTP verification, token management.
-   `sdk.listings` — Browse feed, CRUD operations for listings, seller storefronts.
-   `sdk.search` — Full-text search with filters, trending terms.
-   `sdk.orders` — Order creation, lifecycle management, order history.
-   `sdk.pay` — M-Pesa payments, payment status polling.
-   `sdk.vazi` — AI-powered outfit feed and outfit completion.

---

## Quick Start (For Consumers)

*Note: The SDK is currently under active development. Installation instructions will be updated once published to npm.*

```bash
npm install @mitumba/sdk
```

```typescript
import { MitumbaClient } from '@mitumba/sdk';

const mitumba = new MitumbaClient({
  baseUrl: 'https://api.mitumba.stanl.ink',
  token: localStorage.getItem('mitumba_token')
});

// Example Usage
const feed = await mitumba.listings.getFeed({ city_id: 'nairobi' });
```

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full guide on how to build and expand this SDK.

Built by [StaNLink Inc.](https://stanlink.online) — Kisii & Nairobi, Kenya.
