import type { AdminPermission } from './admin'
import type {
  AuthenticationResponseJSON,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  RegistrationResponseJSON,
  TwoFactorMethod,
} from './auth'

/** IAM principal lifecycle state. */
export type IamUserStatus = 'active' | 'disabled'

/** Organization lifecycle state. */
export type OrganizationStatus = 'active' | 'suspended'

/** Organization category. */
export type OrganizationKind = 'product' | 'department' | 'team'

/** Organization returned by organization-management and IAM profile endpoints. */
export interface Organization {
  id: string
  display_id: string
  alias: string
  name: string
  kind: OrganizationKind
  status: OrganizationStatus
  parent_id: string | null
  created_at: string
  updated_at: string
}

/** Organization list row, including its IAM-user count. */
export interface OrganizationSummary extends Organization {
  iam_user_count: number
}

/** Tokens issued for an IAM principal. */
export interface IamTokens {
  access_token: string
  refresh_token: string
  expires_in: number
  principal_type: 'iam'
  org_id: string
  second_factor_enrolled: boolean
}

/** Start IAM sign-in with an organization ID or alias. */
export interface IamLoginInput {
  org: string
  email: string
  password: string
}

/** Second-factor method offered during IAM sign-in. */
export interface IamLoginMethod {
  id: string
  type: 'totp' | 'passkey'
  label: string | null
}

/** Password accepted; finish sign-in with one of the returned methods. */
export interface IamTwoFactorRequired {
  requires_2fa: true
  temp_token: string
  methods: IamLoginMethod[]
}

/** Finish IAM sign-in with an authenticator or backup code. */
export interface VerifyIamTwoFactorInput {
  temp_token: string
  code: string
  method_id?: string
}

/** Activate an invited IAM principal and choose its password. */
export interface ActivateIamUserInput {
  org: string
  email: string
  code: string
  password: string
}

/** Result of activating an IAM principal. */
export interface ActivateIamUserResult {
  ok: true
  next_step: string
}

/** Current IAM principal and its organization-scoped access. */
export interface IamProfile {
  id: string
  email: string
  display_name: string | null
  status: IamUserStatus
  organization: Organization
  permissions: AdminPermission[]
  two_factor_methods_count: number
  backup_codes_remaining: number
  admin_enrolment_required: boolean
}

/** Add an IAM authenticator or passkey. */
export interface AddIamTwoFactorMethodInput {
  type: 'totp' | 'passkey'
  label?: string
}

/** TOTP enrollment response. */
export interface AddIamTotpResult {
  id: string
  otpauth_uri: string
  secret: string
}

/** Passkey enrollment response. */
export interface AddIamPasskeyResult {
  method_id: string
  options: PublicKeyCredentialCreationOptionsJSON
}

/** IAM factor verification response. Backup codes appear only for the first factor. */
export interface VerifyIamMethodResult {
  ok: true
  backup_codes?: string[]
}

/** Create an organization. */
export interface CreateOrganizationInput {
  alias: string
  name: string
  kind: OrganizationKind
  parent_id?: string
}

/** Update mutable organization fields. */
export interface UpdateOrganizationInput {
  name?: string
  status?: OrganizationStatus
}

/** IAM user shown in an organization's operator list. */
export interface IamUser {
  id: string
  org_id?: string
  email: string
  display_name: string | null
  status: IamUserStatus
  activated: boolean
  second_factor_enrolled?: boolean
  permissions: AdminPermission[]
  last_active_at?: string | null
  created_at?: string
}

/** Create an IAM principal in an organization. */
export interface CreateIamUserInput {
  email: string
  display_name?: string
  permissions?: AdminPermission[]
}

/** One-time IAM activation credential returned to the provisioning administrator. */
export interface IamActivation {
  code: string
  expires_at: string
  org_id: string
  org_alias: string | null
  org_display_id: string
}

/** Result of provisioning an IAM principal. */
export interface CreateIamUserResult {
  iam_user: IamUser
  activation: IamActivation
}

/** Result of listing one organization's IAM principals. */
export interface ListIamUsersResult {
  organization: Organization
  iam_users: IamUser[]
  grantable_permissions: AdminPermission[]
}

/** Input to finish IAM passkey sign-in. */
export interface FinishIamPasskeyLoginInput {
  temp_token: string
  credential: AuthenticationResponseJSON
}

/** Input to finish IAM passkey enrollment. */
export type FinishIamPasskeyEnrollmentInput = RegistrationResponseJSON

/** IAM passkey assertion options. */
export interface IamPasskeyLoginOptions {
  options: PublicKeyCredentialRequestOptionsJSON
}

/** IAM second-factor methods response. */
export interface IamMethodsResult {
  methods: TwoFactorMethod[]
}
