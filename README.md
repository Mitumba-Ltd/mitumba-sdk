<p align="center">
  <img src="https://cloud.stanlink.online/mitumba/assets/images/brand/mitumba-textmark-processed.png" alt="Mitumba SDK" height="48" />
</p>

<p align="center">
  <strong>@mitumba/sdk</strong><br/>
  The official TypeScript SDK for the Mitumba marketplace platform.
</p>

---

## What this is

This repository contains the strongly-typed API client (`@mitumba/sdk`) for the Mitumba platform. It acts as the bridge between any frontend consumer (Next.js web marketplace, Admin dashboard, React Native mobile apps) and our Cloudflare Workers backend.

By extracting the API logic into this SDK, we ensure:
1.  **Type Safety:** End-to-end type safety from the database to the UI.
2.  **Decoupled UX:** Frontend apps focus entirely on UX and state, not fetch headers, JWT persistence, or base URLs.
3.  **Extensibility:** A public-facing contract that allows third parties (or future internal tools) to interact with the Mitumba ecosystem seamlessly.

---

## Architecture

The SDK is organized by domain modules, matching our backend worker architecture:

-   `sdk.auth` — Login, registration, OTP verification.
-   `sdk.listings` — Search, CRUD operations for inventory.
-   `sdk.stores` — Tenant storefront data, seller dashboard analytics.
-   `sdk.vazi` — Outfit generation and garment classification logic.
-   `sdk.orders` — Cart management, STK Push checkout, and escrow.

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
const trending = await mitumba.listings.getTrending('nbi');
```

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full guide on how to build and expand this SDK.

Built by [StaNLink Inc.](https://stanlink.online) — Kisii & Nairobi, Kenya.
