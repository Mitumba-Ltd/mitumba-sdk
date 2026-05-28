import { APIClient } from './client'
import { MitumbaClientConfig } from './types'

export class MitumbaClient {
  public readonly api: APIClient

  constructor(config: MitumbaClientConfig) {
    this.api = new APIClient(config)
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
