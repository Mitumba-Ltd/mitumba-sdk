---
"@mitumba/sdk": minor
---

Add `sdk.businesses` module for managing seller business entities:

- `getMine()` — get all businesses owned by the current user (GET /listings/businesses/mine)
- `getById(id)` — get a business by ID (GET /listings/businesses/:id)
- `update(id, input)` — update a business (PUT /listings/businesses/:id)

New exported types: `Business`, `UpdateBusinessInput`
