import { APIClient } from './client'
import { MitumbaClientConfig } from './types'
import { AuthModule } from './modules/auth'
import { ListingsModule } from './modules/listings'
import { SearchModule } from './modules/search'
import { OrdersModule } from './modules/orders'
import { PayModule } from './modules/pay'
import { VaziModule } from './modules/vazi'
import { MessagesModule } from './modules/messages'

export class MitumbaClient {
  public readonly api: APIClient
  public readonly auth: AuthModule
  public readonly listings: ListingsModule
  public readonly search: SearchModule
  public readonly orders: OrdersModule
  public readonly pay: PayModule
  public readonly vazi: VaziModule
  public readonly messages: MessagesModule

  constructor(config: MitumbaClientConfig) {
    this.api = new APIClient(config)
    this.auth = new AuthModule(this.api)
    this.listings = new ListingsModule(this.api)
    this.search = new SearchModule(this.api)
    this.orders = new OrdersModule(this.api)
    this.pay = new PayModule(this.api)
    this.vazi = new VaziModule(this.api)
    this.messages = new MessagesModule(this.api)
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
