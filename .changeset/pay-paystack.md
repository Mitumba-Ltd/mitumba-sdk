---
"@mitumba/sdk": minor
---

Add Paystack support to `sdk.pay`:

- `initMpesa(input)` — M-Pesa STK Push (alias for initiateStk)
- `initPaystack(input)` — Paystack inline payment (POST /pay/paystack/init)

New exported types: `MpesaInput`, `PaystackInput`, `PaystackInitResponse`
