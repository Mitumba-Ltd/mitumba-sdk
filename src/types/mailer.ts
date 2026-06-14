export interface SendEmailInput {
  to: string
  variables: Record<string, string>
}

export type MailerTemplate =
  // Auth
  | 'welcome'
  | 'email-verification'
  | 'password-reset'
  | 'new-login'
  | '2fa-enabled'
  | '2fa-disabled'
  | 'account-suspended'
  // Orders (Buyer)
  | 'order-created'
  | 'order-confirmed'
  | 'order-shipped'
  | 'order-delivered'
  | 'order-cancelled'
  // Orders (Seller)
  | 'seller-new-order'
  | 'seller-ship-reminder'
  // Payments
  | 'payment-success'
  | 'payment-failed'
  | 'payout-complete'
  // Messaging
  | 'new-message'
  // Store
  | 'store-created'
  | 'listing-sold'
  | 'review-received'
  // Deals
  | 'price-drop'
  | 'weekly-digest'
  // Security
  | 'session-revoked'
  | 'password-changed'
  | 'linked-account-connected'
  // Seller Lifecycle
  | 'seller-onboarding-complete'
  | 'store-follower'
  | 'listing-expired'
  | 'vazi-outfit-match'
  | 'seller-payout-failed'
  // Offers
  | 'offer-received'
  | 'offer-accepted'
  // Cart
  | 'cart-abandoned'
  | 'wishlist-back-in-stock'
  // Disputes
  | 'order-disputed'
  | 'dispute-resolved'
  // Settings
  | 'address-changed'
  | 'payment-method-added'
