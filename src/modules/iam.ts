import { APIClient } from '../client'
import type {
  ActivateIamUserInput,
  ActivateIamUserResult,
  AddIamPasskeyResult,
  AddIamTotpResult,
  AddIamTwoFactorMethodInput,
  AdminPermission,
  CreateIamUserInput,
  CreateIamUserResult,
  CreateOrganizationInput,
  FinishIamPasskeyEnrollmentInput,
  FinishIamPasskeyLoginInput,
  IamActivation,
  IamMethodsResult,
  IamLoginInput,
  IamPasskeyLoginOptions,
  IamProfile,
  IamTokens,
  IamTwoFactorRequired,
  IamUserStatus,
  ListIamUsersResult,
  Organization,
  OrganizationKind,
  OrganizationSummary,
  RegenerateIamBackupCodesResult,
  RequestOptions,
  UpdateOrganizationInput,
  VerifyIamMethodResult,
  VerifyIamTwoFactorInput,
} from '../types'

function isIamTokens(result: IamTokens | IamTwoFactorRequired): result is IamTokens {
  return 'access_token' in result
}

/**
 * Organization-scoped operator identity and access.
 *
 * Root continues to use {@link AuthModule}. IAM users use this module for organization-aware sign-in,
 * activation, second factors and session lifecycle. Organization administration methods require a
 * root/global-operator session with the corresponding server-side permission.
 */
export class IamModule {
  constructor(private readonly client: APIClient) {}

  /** Start IAM sign-in with an organization ID or alias, email and password. */
  async login(input: IamLoginInput, options?: RequestOptions): Promise<IamTokens | IamTwoFactorRequired> {
    const result = await this.client.post<IamTokens | IamTwoFactorRequired>('/auth/iam/login', input, options)
    if (isIamTokens(result)) await this.client.setSession(result)
    return result
  }

  /** Finish IAM sign-in with a TOTP or one-time backup code. */
  async verifyTwoFactor(input: VerifyIamTwoFactorInput, options?: RequestOptions): Promise<IamTokens> {
    const result = await this.client.post<IamTokens>('/auth/iam/login/2fa', input, options)
    await this.client.setSession(result)
    return result
  }

  /** Get WebAuthn assertion options for a pending IAM sign-in. */
  async startPasskeyLogin(tempToken: string, options?: RequestOptions): Promise<IamPasskeyLoginOptions> {
    return this.client.post<IamPasskeyLoginOptions>('/auth/iam/login/passkey/start', { temp_token: tempToken }, options)
  }

  /** Finish IAM passkey sign-in and persist the returned IAM session. */
  async finishPasskeyLogin(input: FinishIamPasskeyLoginInput, options?: RequestOptions): Promise<IamTokens> {
    const result = await this.client.post<IamTokens>('/auth/iam/login/passkey/finish', input, options)
    await this.client.setSession(result)
    return result
  }

  /** Activate an invited IAM user and choose its password. */
  async activate(input: ActivateIamUserInput, options?: RequestOptions): Promise<ActivateIamUserResult> {
    return this.client.post<ActivateIamUserResult>('/auth/iam/activate', input, options)
  }

  /** Rotate an IAM refresh token and persist the returned session. */
  async refresh(refreshToken: string, options?: RequestOptions): Promise<IamTokens> {
    const result = await this.client.post<IamTokens>('/auth/iam/refresh', { refresh_token: refreshToken }, options)
    await this.client.setSession(result)
    return result
  }

  /** End the current IAM session and clear locally stored credentials. */
  async logout(options?: RequestOptions): Promise<{ ok: true }> {
    const refreshToken = await this.client.getStoredRefreshToken()
    if (!refreshToken) {
      await this.client.clearToken()
      return { ok: true }
    }
    const result = await this.client.post<{ ok: true }>('/auth/iam/logout', { refresh_token: refreshToken }, options)
    await this.client.clearToken()
    return result
  }

  /** Get the current IAM principal, organization and effective access state. */
  async me(options?: RequestOptions): Promise<IamProfile> {
    return this.client.get<IamProfile>('/auth/iam/me', undefined, options)
  }

  /** List this IAM principal's enrolled second-factor methods. */
  async listMethods(options?: RequestOptions): Promise<IamMethodsResult> {
    return this.client.get<IamMethodsResult>('/auth/iam/2fa/methods', undefined, options)
  }

  /** Begin adding an authenticator app or passkey. */
  async addMethod(input: AddIamTwoFactorMethodInput, options?: RequestOptions): Promise<AddIamTotpResult | AddIamPasskeyResult> {
    return this.client.post<AddIamTotpResult | AddIamPasskeyResult>('/auth/iam/2fa/methods', input, options)
  }

  /** Verify and enable a pending IAM authenticator method. */
  async verifyMethod(methodId: string, code: string, options?: RequestOptions): Promise<VerifyIamMethodResult> {
    return this.client.post<VerifyIamMethodResult>(`/auth/iam/2fa/methods/${encodeURIComponent(methodId)}/verify`, { code }, options)
  }

  /** Finish and enable a pending IAM passkey method. */
  async finishPasskeyEnrollment(methodId: string, credential: FinishIamPasskeyEnrollmentInput, options?: RequestOptions): Promise<VerifyIamMethodResult> {
    return this.client.post<VerifyIamMethodResult>(`/auth/iam/2fa/methods/${encodeURIComponent(methodId)}/passkey/finish`, credential, options)
  }

  /**
   * Replace this IAM principal's recovery codes after re-proving the password. The previous set
   * stops working immediately; the returned codes are shown once and never retrievable again.
   */
  async regenerateBackupCodes(password: string, options?: RequestOptions): Promise<RegenerateIamBackupCodesResult> {
    return this.client.post<RegenerateIamBackupCodesResult>('/auth/iam/2fa/backup-codes/regenerate', { password }, options)
  }

  /**
   * Remove one of this principal's own second-factor methods after re-proving the password.
   * Refused with `last_factor` (409) when it is the only verified factor left.
   */
  async deleteMethod(methodId: string, password: string, options?: RequestOptions): Promise<{ ok: true }> {
    return this.client.delete<{ ok: true }>(`/auth/iam/2fa/methods/${encodeURIComponent(methodId)}`, { password }, options)
  }

  /** List organizations the current root/global operator may administer. */
  async listOrganizations(options?: RequestOptions): Promise<{ organizations: OrganizationSummary[]; kinds: OrganizationKind[] }> {
    return this.client.get<{ organizations: OrganizationSummary[]; kinds: OrganizationKind[] }>('/auth/orgs', undefined, options)
  }

  /** Create an organization. */
  async createOrganization(input: CreateOrganizationInput, options?: RequestOptions): Promise<{ organization: Organization }> {
    return this.client.post<{ organization: Organization }>('/auth/orgs', input, options)
  }

  /** Update an organization's name or lifecycle state. */
  async updateOrganization(orgId: string, input: UpdateOrganizationInput, options?: RequestOptions): Promise<{ organization: Organization }> {
    return this.client.patch<{ organization: Organization }>(`/auth/orgs/${encodeURIComponent(orgId)}`, input, options)
  }

  /** List IAM users and grantable permissions in one organization. */
  async listUsers(orgId: string, options?: RequestOptions): Promise<ListIamUsersResult> {
    return this.client.get<ListIamUsersResult>(`/auth/orgs/${encodeURIComponent(orgId)}/iam-users`, undefined, options)
  }

  /** Provision an IAM user. The activation code is returned once. */
  async createUser(orgId: string, input: CreateIamUserInput, options?: RequestOptions): Promise<CreateIamUserResult> {
    return this.client.post<CreateIamUserResult>(`/auth/orgs/${encodeURIComponent(orgId)}/iam-users`, input, options)
  }

  /** Grant one organization-scoped permission to an IAM user. */
  async grantPermission(orgId: string, iamUserId: string, permission: AdminPermission, options?: RequestOptions): Promise<{ ok: true; permissions: AdminPermission[] }> {
    return this.client.post<{ ok: true; permissions: AdminPermission[] }>(
      `/auth/orgs/${encodeURIComponent(orgId)}/iam-users/${encodeURIComponent(iamUserId)}/permissions`,
      { permission },
      options,
    )
  }

  /** Revoke one permission and immediately end the IAM user's sessions. */
  async revokePermission(orgId: string, iamUserId: string, permission: AdminPermission, options?: RequestOptions): Promise<{ ok: true; revoked: boolean; permissions: AdminPermission[] }> {
    return this.client.delete<{ ok: true; revoked: boolean; permissions: AdminPermission[] }>(
      `/auth/orgs/${encodeURIComponent(orgId)}/iam-users/${encodeURIComponent(iamUserId)}/permissions/${encodeURIComponent(permission)}`,
      undefined,
      options,
    )
  }

  /** Enable or disable an IAM user. Disabling immediately ends its sessions. */
  async setUserStatus(orgId: string, iamUserId: string, status: IamUserStatus, options?: RequestOptions): Promise<{ ok: true; status: IamUserStatus }> {
    return this.client.post<{ ok: true; status: IamUserStatus }>(
      `/auth/orgs/${encodeURIComponent(orgId)}/iam-users/${encodeURIComponent(iamUserId)}/status`,
      { status },
      options,
    )
  }

  /** Reissue the one-time activation credential for an unactivated IAM user. */
  async reissueActivation(orgId: string, iamUserId: string, options?: RequestOptions): Promise<{ activation: IamActivation }> {
    return this.client.post<{ activation: IamActivation }>(
      `/auth/orgs/${encodeURIComponent(orgId)}/iam-users/${encodeURIComponent(iamUserId)}/activation`,
      undefined,
      options,
    )
  }
}
