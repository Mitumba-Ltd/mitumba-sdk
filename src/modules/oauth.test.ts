import { describe, it, expect, vi, beforeEach } from 'vitest'

import { APIClient, APIError } from '../client'
import { OAuthModule, isConsentRequired } from './oauth'

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

  describe('authorize consent-required branch', () => {
    const input = {
      client_id: 'vuma',
      redirect_uri: 'https://vuma.africa/callback',
      scope: 'openid profile',
      state: 's',
      code_challenge: 'c',
    }

    it('returns the consent_required signal (no code) for a consent-requiring client', async () => {
      const signal = { consent_required: true, client_id: 'vuma', client_name: 'Vuma', scopes: ['openid', 'profile'] }
      vi.spyOn(apiClient, 'post').mockResolvedValueOnce(signal)

      const result = await oauth.authorize(input)

      expect(isConsentRequired(result)).toBe(true)
      expect(result).toEqual(signal)
    })

    it('narrows to the code result when a code is minted', async () => {
      vi.spyOn(apiClient, 'post').mockResolvedValueOnce({ code: 'the-code', state: 's' })

      const result = await oauth.authorize(input)

      expect(isConsentRequired(result)).toBe(false)
      if (!isConsentRequired(result)) expect(result.code).toBe('the-code')
    })
  })

  describe('grantConsent', () => {
    it('POSTs the client + scope to /auth/oauth/consent', async () => {
      vi.spyOn(apiClient, 'post').mockResolvedValueOnce({ ok: true })

      const result = await oauth.grantConsent({ client_id: 'vuma', scope: 'openid profile' })

      expect(apiClient.post).toHaveBeenCalledWith('/auth/oauth/consent', { client_id: 'vuma', scope: 'openid profile' }, undefined)
      expect(result).toEqual({ ok: true })
    })

    it('surfaces an APIError on 401 without a session', async () => {
      vi.spyOn(apiClient, 'post').mockRejectedValueOnce(
        new APIError(401, { error: 'unauthorized', message: 'Missing user context.' }),
      )
      await expect(oauth.grantConsent({ client_id: 'vuma', scope: 'openid' })).rejects.toMatchObject({ status: 401 })
    })
  })

  describe('revokeConsent', () => {
    it('DELETEs /auth/oauth/consent/:clientId (url-encoded) and returns the revoked flag', async () => {
      vi.spyOn(apiClient, 'delete').mockResolvedValueOnce({ ok: true, revoked: true })

      const result = await oauth.revokeConsent('vuma')

      expect(apiClient.delete).toHaveBeenCalledWith('/auth/oauth/consent/vuma', undefined, undefined)
      expect(result).toEqual({ ok: true, revoked: true })
    })
  })

  describe('listConsents', () => {
    it('GETs /auth/oauth/consents and returns the live consents', async () => {
      const payload = { consents: [{ client_id: 'vuma', client_name: 'Vuma', scopes: ['openid'], granted_at: '2026-11-06T00:00:00.000Z' }] }
      vi.spyOn(apiClient, 'get').mockResolvedValueOnce(payload)

      const result = await oauth.listConsents()

      expect(apiClient.get).toHaveBeenCalledWith('/auth/oauth/consents', undefined, undefined)
      expect(result).toEqual(payload)
    })
  })

  describe('silentAuthorize', () => {
    const input = {
      client_id: 'marketplace',
      redirect_uri: 'https://app.mitumba.africa/callback',
      scope: 'openid profile',
      state: 's',
      code_challenge: 'c',
    }

    it('posts prompt=none + S256 and returns the code on a silent success', async () => {
      vi.spyOn(apiClient, 'post').mockResolvedValueOnce({ code: 'silent-code', state: 's' })

      const result = await oauth.silentAuthorize(input)

      expect(apiClient.post).toHaveBeenCalledWith(
        '/auth/oauth/authorize',
        { ...input, code_challenge_method: 'S256', prompt: 'none' },
        undefined,
      )
      expect(result).toEqual({ ok: true, code: 'silent-code', state: 's' })
    })

    it('returns login_required (not throw) when the client is not authorized for silent auth', async () => {
      vi.spyOn(apiClient, 'post').mockRejectedValueOnce(
        new APIError(403, { error: 'login_required', message: 'Not authorized for silent authentication.' }),
      )
      await expect(oauth.silentAuthorize(input)).resolves.toEqual({ ok: false, reason: 'login_required' })
    })

    it('returns interaction_required (not throw) when consent cannot be collected silently', async () => {
      vi.spyOn(apiClient, 'post').mockRejectedValueOnce(
        new APIError(403, { error: 'interaction_required', message: 'Consent required.' }),
      )
      await expect(oauth.silentAuthorize(input)).resolves.toEqual({ ok: false, reason: 'interaction_required' })
    })

    it('returns unauthenticated (not throw) on a 401 (no session)', async () => {
      vi.spyOn(apiClient, 'post').mockRejectedValueOnce(
        new APIError(401, { error: 'unauthorized', message: 'Missing user context.' }),
      )
      await expect(oauth.silentAuthorize(input)).resolves.toEqual({ ok: false, reason: 'unauthenticated' })
    })

    it('maps an unexpected consent_required 200 to interaction_required', async () => {
      vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
        consent_required: true, client_id: 'marketplace', client_name: 'M', scopes: ['openid'],
      })
      await expect(oauth.silentAuthorize(input)).resolves.toEqual({ ok: false, reason: 'interaction_required' })
    })

    it('rethrows genuinely unexpected errors (5xx)', async () => {
      vi.spyOn(apiClient, 'post').mockRejectedValueOnce(
        new APIError(503, { error: 'service_unavailable', message: 'down' }),
      )
      await expect(oauth.silentAuthorize(input)).rejects.toMatchObject({ status: 503 })
    })
  })
})
