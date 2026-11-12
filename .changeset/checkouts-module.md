---
'@mitumba/sdk': minor
---

Add `sdk.checkouts.create` and `sdk.checkouts.get` with typed `Checkout` totals, including the buyer protection fee (`bpf`, `bpf_total`), and `checkoutRefusal(error)` to read a refusal's details. `APIError` gains `body`, the decoded error body. `cart.checkout()` is deprecated.
