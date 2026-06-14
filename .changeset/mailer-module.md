---
"@mitumba/sdk": minor
---

Add `sdk.mailer` module for sending transactional emails via the notifications worker:

- `send(template, input)` — POST /notify/email

39 strongly-typed template names: `welcome`, `email-verification`, `password-reset`, `new-login`, `2fa-enabled`, `2fa-disabled`, `account-suspended`, `order-created`, `order-confirmed`, `order-shipped`, `order-delivered`, `order-cancelled`, `seller-new-order`, `seller-ship-reminder`, `payment-success`, `payment-failed`, `payout-complete`, `new-message`, `store-created`, `listing-sold`, `review-received`, `price-drop`, `weekly-digest`, `session-revoked`, `password-changed`, `linked-account-connected`, `seller-onboarding-complete`, `store-follower`, `listing-expired`, `vazi-outfit-match`, `seller-payout-failed`, `offer-received`, `offer-accepted`, `cart-abandoned`, `wishlist-back-in-stock`, `order-disputed`, `dispute-resolved`, `address-changed`, `payment-method-added`

New exported types: `MailerTemplate`, `SendEmailInput`
