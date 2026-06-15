---
"@mitumba/sdk": minor
---

Add store settings to `sdk.stores`:

- `getSettings(storeId)` — get full store settings (GET /listings/stores/:storeId/settings)
- `updateSettings(storeId, input)` — partial update settings (PUT /listings/stores/:storeId/settings)

New exported type: `StoreSettings`

Also fixes duplicate type definitions in stores types file.
