---
"@mitumba/sdk": minor
---

Add `sdk.settings` module covering all user account settings:

- **Profile**: `getProfile()`, `updateProfile(input)`
- **Security**: `changePassword(input)`, `getSessions()`, `revokeSession(id)`
- **Notification Prefs**: `getNotificationPrefs()`, `updateNotificationPref(channel, enabled)`
- **Preferences**: `getPreferences()`, `updatePreferences(prefs)`
- **Addresses**: `getAddresses()`, `addAddress(input)`, `updateAddress(id, input)`, `deleteAddress(id)`, `setDefaultAddress(id)`
- **Payment Methods**: `getPaymentMethods()`, `addPaymentMethod(input)`, `deletePaymentMethod(id)`, `setDefaultPaymentMethod(id)`
- **Linked Accounts**: `getLinkedAccounts()`, `linkAccount(provider, token)`, `unlinkAccount(provider)`

Also adds optional `device` param to `EmailLoginInput` and `EmailRegisterInput` for session tracking.

New exported types: `UpdateProfileInput`, `ChangePasswordInput`, `Session`, `NotificationPref`, `Address`, `AddAddressInput`, `PaymentMethod`, `AddPaymentMethodInput`, `PaymentMethodType`, `LinkedAccount`, `LinkedAccountProvider`
