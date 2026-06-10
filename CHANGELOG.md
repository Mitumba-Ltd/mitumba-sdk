# @mitumba/sdk

## 0.5.0

### Minor Changes

- dbcd56a: Add `sdk.auth.me()` method to fetch the current authenticated user's profile (GET /auth/me).

  New exported type: `UserProfile`

## 0.4.0

### Minor Changes

- 45f9211: Add password reset flow to auth module:

  - `forgotPassword({ email })` — sends a password reset link to the given email (POST /auth/forgot-password)
  - `resetPassword({ token, password })` — resets the password using the token from the reset email (POST /auth/reset-password)

  New exported types: `ForgotPasswordInput`, `ResetPasswordInput`

## 0.3.0

### Minor Changes

- 6bf553c: Align all module methods with the SDK contract:

  - **auth**: `refresh()` and `logout()` now accept `{ refresh_token }` object input
  - **listings**: `getById()` returns `Listing & { images: ListingImage[] }`, `updateStatus()` returns `{ ok, status }`, `PresignImageResponse` uses `r2_key`
  - **search**: Renamed `search()` → `query()`, `getTrending()` → `trending(params?)`
  - **orders**: `getById()` returns `Order & { events: OrderEvent[] }`, `transition()` returns `{ ok, status }`
  - **pay**: Renamed `initiateStkPush()` → `initiateStk()`
  - **vazi**: Renamed `completeOutfit()` → `getCompleteLook()`
  - **client**: Added `getToken()` utility method

## 0.2.0

### Minor Changes

- 096b260: Initial release of the fully isomorphic TypeScript SDK for the Mitumba marketplace platform!

  Includes:

  - Dual-mode Authentication (Email/Password & OTP)
  - Listings Management & Feeds
  - AI-powered Search
  - Orders and Checkout Flows
  - M-Pesa STK Push Integration
  - Vazi AI Outfit Engine
  - Automatic Token Rotation
  - Exponential Backoff & Request Cancellation
