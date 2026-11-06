import { APIClient } from '../client'
import type {
  OAuthAuthorizeInput,
  OAuthAuthorizeResult,
  OAuthTokenExchangeInput,
  OAuthTokenResult,
  OpenIdConfiguration,
  Jwks,
  UserInfo,
  RequestOptions,
} from '../types'

/**
 * Relying-party OAuth session hand-off.
 *
 * Wraps the authorization-code + PKCE flow: the accounts app mints a one-time code with
 * {@link OAuthModule.authorize}, redirects it back to the relying party, and the relying party
 * exchanges it for a token pair with {@link OAuthModule.exchangeCode}.
 */
export class OAuthModule {
  constructor(private readonly client: APIClient) {}

  /**
   * Mint a one-time authorization code for the relying party.
   *
   * This is the authenticated mint step the accounts app calls after the user is signed in. It
   * returns a one-time code (plus the echoed `state`) that the app then redirects back to the
   * relying party's `redirect_uri`. The PKCE method is fixed to `'S256'` by the SDK, so callers
   * cannot supply a weaker value. The returned code is not a session — this method does not
   * persist anything.
   *
   * @param input - The authorize request (client, redirect URI, state, PKCE challenge, scope)
   * @param options - Optional per-request options (abort signal, extra headers)
   * @returns The one-time authorization code and the echoed `state`
   * @throws {APIError} On `400` (`invalid_redirect_uri`, `invalid_client`, `invalid_scope`) or other errors
   *
   * @example
   * ```typescript
   * const { code, state } = await sdk.oauth.authorize({
   *   client_id: 'rp_abc',
   *   redirect_uri: 'https://app.example.com/callback',
   *   scope: 'profile email',
   *   state: csrfState,
   *   code_challenge: challenge,
   * })
   * ```
   */
  async authorize(input: OAuthAuthorizeInput, options?: RequestOptions): Promise<OAuthAuthorizeResult> {
    return this.client.post<OAuthAuthorizeResult>(
      '/auth/oauth/authorize',
      { ...input, code_challenge_method: 'S256' },
      options,
    )
  }

  /**
   * Exchange a one-time authorization code for a token pair.
   *
   * The relying party calls this server-to-server (or from its own origin) with the PKCE verifier
   * that matches the earlier challenge. The authorization code is single-use — a reused, expired,
   * or tampered code is rejected with `400 invalid_grant`. On success the returned tokens are
   * persisted into the client session via `setSession`, so the relying party is logged in
   * immediately after the exchange. `grant_type` is set to `'authorization_code'` by the SDK.
   *
   * @param input - The token exchange request (code, redirect URI, client, PKCE verifier, optional secret)
   * @param options - Optional per-request options (abort signal, extra headers)
   * @returns The access/refresh token pair and granted scope
   * @throws {APIError} On `400 invalid_grant` (bad/expired/replayed code) or `401 invalid_client` (wrong secret)
   *
   * @example
   * ```typescript
   * const tokens = await sdk.oauth.exchangeCode({
   *   code,
   *   redirect_uri: 'https://app.example.com/callback',
   *   client_id: 'rp_abc',
   *   code_verifier: verifier,
   * })
   * // sdk is now authenticated as the exchanged session
   * ```
   */
  async exchangeCode(input: OAuthTokenExchangeInput, options?: RequestOptions): Promise<OAuthTokenResult> {
    const result = await this.client.post<OAuthTokenResult>(
      '/auth/oauth/token',
      { ...input, grant_type: 'authorization_code' },
      options,
    )
    await this.client.setSession({
      access_token: result.access_token,
      refresh_token: result.refresh_token,
    })
    return result
  }

  /**
   * Fetch the OpenID Connect discovery document.
   *
   * A relying party reads this to learn the provider's endpoints and capabilities (issuer, the
   * authorize/token/userinfo/jwks URLs, supported scopes, signing algorithms) rather than hard-
   * coding them. Public — no session required.
   *
   * @param options - Optional per-request options (abort signal, extra headers)
   * @returns The discovery metadata
   */
  async discover(options?: RequestOptions): Promise<OpenIdConfiguration> {
    return this.client.get<OpenIdConfiguration>('/auth/oauth/openid-configuration', undefined, options)
  }

  /**
   * Fetch the JWKS — the public keys that verify provider-issued id_token signatures.
   *
   * A relying party uses these (matched by the id_token header `kid`) to verify an id_token without
   * a shared secret. Public — no session required. Serves public key parameters only.
   *
   * @param options - Optional per-request options (abort signal, extra headers)
   * @returns The JWKS document
   */
  async getJwks(options?: RequestOptions): Promise<Jwks> {
    return this.client.get<Jwks>('/auth/oauth/jwks.json', undefined, options)
  }

  /**
   * Fetch the userinfo claim set for the current session.
   *
   * Returns `sub` plus the identity claims the session's granted scopes allow. Requires an
   * authenticated session — the SDK attaches the bearer token automatically.
   *
   * @param options - Optional per-request options (abort signal, extra headers)
   * @returns The userinfo claims
   */
  async userinfo(options?: RequestOptions): Promise<UserInfo> {
    return this.client.get<UserInfo>('/auth/oauth/userinfo', undefined, options)
  }
}
