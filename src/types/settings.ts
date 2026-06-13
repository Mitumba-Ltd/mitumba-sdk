export interface UpdateProfileInput {
  display_name?: string
  phone?: string
  county?: string
  bio?: string
  avatar_url?: string
}

export interface ChangePasswordInput {
  current_password: string
  new_password: string
}

export interface Session {
  id: string
  device: string
  location: string
  last_active: string
  is_current: boolean
}

export interface NotificationPref {
  channel: string
  enabled: boolean
}

export interface Address {
  id: string
  label: string
  name: string
  phone: string
  line1: string
  line2: string | null
  city: string
  county: string
  is_default: boolean
  created_at: string
}

export type AddAddressInput = Omit<Address, 'id' | 'is_default' | 'created_at'>

export type PaymentMethodType = 'mpesa' | 'mpesa_till' | 'airtel' | 'telkom' | 'card'

export interface PaymentMethod {
  id: string
  type: PaymentMethodType
  label: string
  detail: string
  is_default: boolean
  created_at: string
}

export interface AddPaymentMethodInput {
  type: PaymentMethodType
  label: string
  detail: string
}

export type LinkedAccountProvider = 'google' | 'apple'

export interface LinkedAccount {
  provider: LinkedAccountProvider
  email: string | null
  connected_at: string
}
