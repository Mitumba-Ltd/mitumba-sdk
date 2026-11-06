import { describe, it, expect, vi, beforeEach } from 'vitest'

import { APIClient, APIError } from '../client'
import { OAuthModule } from './oauth'

import type { OAuthAuthorizeInput, OAuthTokenExchangeInput } from '../types'

describe('OAuthModule', () => {
  let apiClient: APIClient
  let oauth: OAuthModule

  beforeEach(() => {
    apiClient = new APIClient({ baseUrl: 'https://api.mitumba.test' })
    oauth = new OAuthModule(apiClient)
    vi.clearAllMocks()
  })

  describe('authorize', () => {
    const input: OAuthAuthorizeInput = {
      client_id: 'rp_abc',
      redirect_uri: 'https://app.example.com/callback',
      scope: 'profile email',
      state: 'state-xyz',
      code_challenge: 'challenge-123',
    }

    it('posts to /auth/oauth/authorize with code_challenge_method S256 injected and returns the code + state', async () => {
      const mockResponse = { code: 'one-time-code', state: 'state-xyz' }
      vi.spyOn(apiClient, 'post').mockResolvedValueOnce(mockResponse)

      const result = await oauth.authorize(input)

      expect(apiClient.post).toHaveBeenCalledWith(
        '/auth/oauth/authorize',
        { ...input, code_challenge_method: 'S256' },
        undefined,
      )
      expect(result).toEqual(mockResponse)
    })

    it('does not persist a session (the code is not a session)', async () => {
      vi.spyOn(apiClient, 'post').mockResolvedValueOnce({ code: 'one-time-code', state: 'state-xyz' })
      const setSession = vi.spyOn(apiClient, 'setSession')

      await oauth.authorize(input)

      expect(setSession).not.toHaveBeenCalled()
    })

    it('surfaces an APIError on 400 invalid_redirect_uri', async () => {
      vi.spyOn(apiClient, 'post').mockRejectedValueOnce(
        new APIError(400, { error: 'invalid_redirect_uri', message: 'Redirect URI not registered.' }),
      )

      await expect(oauth.authorize(input)).rejects.toMatchObject({ status: 400, code: 'invalid_redirect_uri' })
    })

    it('surfaces an APIError on 400 invalid_client', async () => {
      vi.spyOn(apiClient, 'post').mockRejectedValueOnce(
        new APIError(400, { error: 'invalid_client', message: 'Unknown client.' }),
      )

      await expect(oauth.authorize(input)).rejects.toMatchObject({ status: 400, code: 'invalid_client' })
    })

    it('surfaces an APIError on 400 invalid_scope', async () => {
      vi.spyOn(apiClient, 'post').mockRejectedValueOnce(
        new APIError(400, { error: 'invalid_scope', message: 'Requested scope is not allowed.' }),
      )

      await expect(oauth.authorize(input)).rejects.toMatchObject({ status: 400, code: 'invalid_scope' })
    })
  })

  describe('exchangeCode', () => {
    const input: OAuthTokenExchangeInput = {
      code: 'one-time-code',
      redirect_uri: 'https://app.example.com/callback',
      client_id: 'rp_abc',
      code_verifier: 'verifier-123',
    }

    const tokenResult = {
      access_token: 'access-token',
      refresh_token: 'refresh-token',
      expires_in: 900,
      token_type: 'Bearer' as const,
      scope: 'profile email',
    }

    it('posts grant_type authorization_code and the PKCE verifier, returning the token result', async () => {
      vi.spyOn(apiClient, 'post').mockResolvedValueOnce(tokenResult)
      vi.spyOn(apiClient, 'setSession').mockResolvedValueOnce(undefined)

      const result = await oauth.exchangeCode(input)

      expect(apiClient.post).toHaveBeenCalledWith(
        '/auth/oauth/token',
        { ...input, grant_type: 'authorization_code' },
        undefined,
      )
      expect(result).toEqual(tokenResult)
    })

    it('persists the returned tokens into the client session', async () => {
      vi.spyOn(apiClient, 'post').mockResolvedValueOnce(tokenResult)
      const setSession = vi.spyOn(apiClient, 'setSession').mockResolvedValueOnce(undefined)

      await oauth.exchangeCode(input)

      expect(setSession).toHaveBeenCalledWith({
        access_token: 'access-token',
        refresh_token: 'refresh-token',
      })
    })

    it('forwards a confidential client_secret when provided', async () => {
      vi.spyOn(apiClient, 'post').mockResolvedValueOnce(tokenResult)
      vi.spyOn(apiClient, 'setSession').mockResolvedValueOnce(undefined)

      const confidentialInput: OAuthTokenExchangeInput = { ...input, client_secret: 'rp-secret' }
      await oauth.exchangeCode(confidentialInput)

      expect(apiClient.post).toHaveBeenCalledWith(
        '/auth/oauth/token',
        { ...confidentialInput, grant_type: 'authorization_code' },
        undefined,
      )
    })

    it('surfaces an APIError on 400 invalid_grant and does not persist a session', async () => {
      vi.spyOn(apiClient, 'post').mockRejectedValueOnce(
        new APIError(400, { error: 'invalid_grant', message: 'Code is invalid, expired, or already used.' }),
      )
      const setSession = vi.spyOn(apiClient, 'setSession')

      await expect(oauth.exchangeCode(input)).rejects.toMatchObject({ status: 400, code: 'invalid_grant' })
      expect(setSession).not.toHaveBeenCalled()
    })

    it('surfaces an APIError on 401 invalid_client and does not persist a session', async () => {
      vi.spyOn(apiClient, 'post').mockRejectedValueOnce(
        new APIError(401, { error: 'invalid_client', message: 'Client authentication failed.' }),
      )
      const setSession = vi.spyOn(apiClient, 'setSession')

      await expect(oauth.exchangeCode(input)).rejects.toMatchObject({ status: 401, code: 'invalid_client' })
      expect(setSession).not.toHaveBeenCalled()
    })
  })

  describe('discover', () => {
    it('GETs the discovery document', async () => {
      const doc = {
        issuer: 'https://api.mitumba.test',
        authorization_endpoint: 'https://api.mitumba.test/auth/oauth/authorize',
        token_endpoint: 'https://api.mitumba.test/auth/oauth/token',
        userinfo_endpoint: 'https://api.mitumba.test/auth/oauth/userinfo',
        jwks_uri: 'https://api.mitumba.test/auth/oauth/jwks.json',
        response_types_supported: ['code'],
        grant_types_supported: ['authorization_code'],
        code_challenge_methods_supported: ['S256'],
        id_token_signing_alg_values_supported: ['ES256'],
        scopes_supported: ['openid', 'profile', 'email', 'phone'],
        subject_types_supported: ['public'],
        token_endpoint_auth_methods_supported: ['none', 'client_secret_post'],
      }
      vi.spyOn(apiClient, 'get').mockResolvedValueOnce(doc)

      const result = await oauth.discover()

      expect(apiClient.get).toHaveBeenCalledWith('/auth/oauth/openid-configuration', undefined, undefined)
      expect(result).toEqual(doc)
    })
  })

  describe('getJwks', () => {
    it('GETs the JWKS document', async () => {
      const jwks = { keys: [{ kty: 'EC', use: 'sig', alg: 'ES256', kid: 'k1', crv: 'P-256', x: 'X', y: 'Y' }] }
      vi.spyOn(apiClient, 'get').mockResolvedValueOnce(jwks)

      const result = await oauth.getJwks()

      expect(apiClient.get).toHaveBeenCalledWith('/auth/oauth/jwks.json', undefined, undefined)
      expect(result).toEqual(jwks)
    })
  })

  describe('userinfo', () => {
    it('GETs the userinfo claim set for the current session', async () => {
      const claims = { sub: 'user_1', email: 'a@example.com', email_verified: true, name: 'A' }
      vi.spyOn(apiClient, 'get').mockResolvedValueOnce(claims)

      const result = await oauth.userinfo()

      expect(apiClient.get).toHaveBeenCalledWith('/auth/oauth/userinfo', undefined, undefined)
      expect(result).toEqual(claims)
    })

    it('surfaces an APIError on 401 when there is no session', async () => {
      vi.spyOn(apiClient, 'get').mockRejectedValueOnce(
        new APIError(401, { error: 'unauthorized', message: 'Missing user context.' }),
      )

      await expect(oauth.userinfo()).rejects.toMatchObject({ status: 401, code: 'unauthorized' })
    })
  })
})
