import { APIClient } from './client'
import { MitumbaClientConfig } from './types'
import { AuthModule } from './modules/auth'

export class MitumbaClient {
  public readonly api: APIClient
  public readonly auth: AuthModule

  constructor(config: MitumbaClientConfig) {
    this.api = new APIClient(config)
    this.auth = new AuthModule(this.api)
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
