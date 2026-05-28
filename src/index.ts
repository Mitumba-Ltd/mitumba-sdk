import { APIClient } from './client'
import { MitumbaClientConfig } from './types'
import { AuthModule } from './modules/auth'
import { ListingsModule } from './modules/listings'
import { SearchModule } from './modules/search'

export class MitumbaClient {
  public readonly api: APIClient
  public readonly auth: AuthModule
  public readonly listings: ListingsModule
  public readonly search: SearchModule

  constructor(config: MitumbaClientConfig) {
    this.api = new APIClient(config)
    this.auth = new AuthModule(this.api)
    this.listings = new ListingsModule(this.api)
    this.search = new SearchModule(this.api)
  }

  /**
   * Set the access token for authenticated requests.
   * Optionally pass a refresh token to enable automatic token rotation.
   */
  public setToken(token: string, refreshToken?: string) {
    this.api.setToken(token, refreshToken)
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
