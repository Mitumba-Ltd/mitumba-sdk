import type {
  BaleOrderStatus,
  CheckoutNextAction,
  CheckoutOrder,
  CheckoutPaymentMethod,
  CheckoutStatus,
  CheckoutStatusResponse,
  InitiateCheckoutInput,
  InitiateCheckoutResponse,
  KnownPaymentProvider,
  OrderStatus,
  PaymentAttemptStatus,
  PaymentProvider,
  PayModule,
  ProviderId,
  RequestOptions,
} from '../index'

type Equal<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends
  (<Value>() => Value extends Right ? 1 : 2)
    ? true
    : false

type Assert<Condition extends true> = Condition

type RetailCheckoutOrder = Extract<CheckoutOrder, { type: 'retail' }>
type BaleCheckoutOrder = Extract<CheckoutOrder, { type: 'bale' }>
type MobileMoneyCheckoutMethod = Extract<CheckoutPaymentMethod, { type: 'mobile_money' }>
type CardCheckoutMethod = Extract<CheckoutPaymentMethod, { type: 'card' }>
type AwaitConfirmationAction = Extract<CheckoutNextAction, { type: 'await_confirmation' }>
type RedirectAction = Extract<CheckoutNextAction, { type: 'redirect' }>

export type CheckoutStatusDeclarationAssertions = [
  Assert<Equal<RetailCheckoutOrder['status'], OrderStatus>>,
  Assert<Equal<BaleCheckoutOrder['status'], BaleOrderStatus>>,
  Assert<Equal<CheckoutStatusResponse['checkout_status'], CheckoutStatus>>,
  Assert<Equal<NonNullable<CheckoutStatusResponse['latest_attempt']>['provider'], PaymentProvider>>,
  Assert<Equal<NonNullable<CheckoutStatusResponse['latest_attempt']>['status'], PaymentAttemptStatus>>,
]

export type InitiateCheckoutDeclarationAssertions = [
  Assert<Equal<PaymentProvider, ProviderId>>,
  Assert<Equal<KnownPaymentProvider, 'daraja' | 'intasend' | 'paystack' | 'airtel'>>,
  Assert<Equal<InitiateCheckoutInput['order_id'], string>>,
  Assert<Equal<InitiateCheckoutInput['idempotency_key'], string>>,
  Assert<Equal<InitiateCheckoutInput['method'], CheckoutPaymentMethod>>,
  Assert<Equal<MobileMoneyCheckoutMethod, { type: 'mobile_money'; phone: string }>>,
  Assert<Equal<CardCheckoutMethod, { type: 'card' }>>,
  Assert<Equal<AwaitConfirmationAction, { type: 'await_confirmation' }>>,
  Assert<Equal<RedirectAction, { type: 'redirect'; url: string; expires_at: string | null }>>,
  Assert<Equal<InitiateCheckoutResponse['version'], 1>>,
  Assert<Equal<InitiateCheckoutResponse['attempt']['provider'], ProviderId>>,
  Assert<Equal<InitiateCheckoutResponse['attempt']['status'], 'initiated'>>,
  Assert<Equal<InitiateCheckoutResponse['next_action'], CheckoutNextAction>>,
  Assert<Equal<
    PayModule['initiateCheckout'],
    (
      input: InitiateCheckoutInput,
      options?: RequestOptions,
    ) => Promise<InitiateCheckoutResponse>
  >>,
]

export function assertFuturePaymentProvider(): void {
  const providerId: ProviderId = 'future-provider'
  const paymentProvider: PaymentProvider = 'future-provider'
  void providerId
  void paymentProvider
}

export function assertCheckoutPaymentMethodNarrowing(method: CheckoutPaymentMethod): void {
  if (method.type === 'mobile_money') {
    const mobileMoneyMethod: MobileMoneyCheckoutMethod = method
    const phone: string = method.phone
    // @ts-expect-error Mobile-money methods must not narrow to card methods.
    const cardMethod: CardCheckoutMethod = method
    void mobileMoneyMethod
    void phone
    void cardMethod
    return
  }

  const cardMethod: CardCheckoutMethod = method
  // @ts-expect-error Card methods do not have a phone field.
  const phone: string = method.phone
  // @ts-expect-error Card methods must not narrow to mobile-money methods.
  const mobileMoneyMethod: MobileMoneyCheckoutMethod = method
  void cardMethod
  void phone
  void mobileMoneyMethod
}

export function assertCheckoutNextActionNarrowing(action: CheckoutNextAction): void {
  if (action.type === 'await_confirmation') {
    const awaitConfirmationAction: AwaitConfirmationAction = action
    // @ts-expect-error Await-confirmation actions must not narrow to redirects.
    const redirectAction: RedirectAction = action
    void awaitConfirmationAction
    void redirectAction
    return
  }

  const redirectAction: RedirectAction = action
  const url: string = action.url
  const expiresAt: string | null = action.expires_at
  // @ts-expect-error Redirect actions must not narrow to await-confirmation actions.
  const awaitConfirmationAction: AwaitConfirmationAction = action
  void redirectAction
  void url
  void expiresAt
  void awaitConfirmationAction
}

export function assertCheckoutOrderNarrowing(response: CheckoutStatusResponse): void {
  if (response.order.type === 'retail') {
    const retailStatus: OrderStatus = response.order.status
    // @ts-expect-error Retail order status must not widen to the bale status union.
    const baleStatus: BaleOrderStatus = response.order.status
    void retailStatus
    void baleStatus
    return
  }

  const baleStatus: BaleOrderStatus = response.order.status
  // @ts-expect-error Bale order status must not widen to the retail status union.
  const retailStatus: OrderStatus = response.order.status
  void baleStatus
  void retailStatus
}
