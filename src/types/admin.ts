export interface BlockedIp {
  ip: string
  blocked_at: string
  expires_at: string
}

export interface SystemStats {
  total_users: number
  total_sellers: number
  total_listings: number
  total_orders: number
  total_revenue: number
  active_today: number
}
