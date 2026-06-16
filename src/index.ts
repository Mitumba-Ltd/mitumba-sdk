import { APIClient } from './client'
import { MitumbaClientConfig } from './types'
import { AuthModule } from './modules/auth'
import { ListingsModule } from './modules/listings'
import { SearchModule } from './modules/search'
import { OrdersModule } from './modules/orders'
import { PayModule } from './modules/pay'
import { VaziModule } from './modules/vazi'
import { MessagesModule } from './modules/messages'
import { NotificationsModule } from './modules/notifications'
import { StoresModule } from './modules/stores'
import { ReviewsModule } from './modules/reviews'
import { WishlistsModule } from './modules/wishlists'
import { CartModule } from './modules/cart'
import { SettingsModule } from './modules/settings'
import { MailerModule } from './modules/mailer'
import { BusinessesModule } from './modules/businesses'

export class MitumbaClient {
  public readonly api: APIClient
  public readonly auth: AuthModule
  public readonly listings: ListingsModule
  public readonly search: SearchModule
  public readonly orders: OrdersModule
  public readonly pay: PayModule
  public readonly vazi: VaziModule
  public readonly messages: MessagesModule
  public readonly notifications: NotificationsModule
  public readonly stores: StoresModule
  public readonly reviews: ReviewsModule
  public readonly wishlists: WishlistsModule
  public readonly cart: CartModule
  public readonly settings: SettingsModule
  public readonly mailer: MailerModule
  public readonly businesses: BusinessesModule

  constructor(config: MitumbaClientConfig) {
    this.api = new APIClient(config)
    this.auth = new AuthModule(this.api)
    this.listings = new ListingsModule(this.api)
    this.search = new SearchModule(this.api)
    this.orders = new OrdersModule(this.api)
    this.pay = new PayModule(this.api)
    this.vazi = new VaziModule(this.api)
    this.messages = new MessagesModule(this.api)
    this.notifications = new NotificationsModule(this.api)
    this.stores = new StoresModule(this.api)
    this.reviews = new ReviewsModule(this.api)
    this.wishlists = new WishlistsModule(this.api)
    this.cart = new CartModule(this.api)
    this.settings = new SettingsModule(this.api)
    this.mailer = new MailerModule(this.api)
    this.businesses = new BusinessesModule(this.api)
  }

  /**
   * Set the access token for authenticated requests.
   * Optionally pass a refresh token to enable automatic token rotation.
   */
  public setToken(token: string, refreshToken?: string) {
    this.api.setToken(token, refreshToken)
  }

  /**
   * Get the current access token.
   */
  public getToken(): string | undefined {
    return this.api.getToken()
  }

  /**
   * Clear the current tokens.
   */
  public clearToken() {
    this.api.clearToken()
  }
}

export * from './types'
export { APIClient, APIError } from './client'
export { AuthModule } from './modules/auth'
export { ListingsModule } from './modules/listings'
export { SearchModule } from './modules/search'
export { OrdersModule } from './modules/orders'
export { PayModule } from './modules/pay'
export { VaziModule } from './modules/vazi'
export { MessagesModule } from './modules/messages'
export { NotificationsModule } from './modules/notifications'
export { StoresModule } from './modules/stores'
export { ReviewsModule } from './modules/reviews'
export { WishlistsModule } from './modules/wishlists'
export { CartModule } from './modules/cart'
export { SettingsModule } from './modules/settings'
export { MailerModule } from './modules/mailer'
export { BusinessesModule } from './modules/businesses'
