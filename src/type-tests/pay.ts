import type {
  BaleOrderStatus,
  CheckoutOrder,
  CheckoutStatus,
  CheckoutStatusResponse,
  OrderStatus,
  PaymentAttemptStatus,
  PaymentProvider,
} from '../index'

type Equal<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends
  (<Value>() => Value extends Right ? 1 : 2)
    ? true
    : false

type Assert<Condition extends true> = Condition

type RetailCheckoutOrder = Extract<CheckoutOrder, { type: 'retail' }>
type BaleCheckoutOrder = Extract<CheckoutOrder, { type: 'bale' }>

export type CheckoutStatusDeclarationAssertions = [
  Assert<Equal<RetailCheckoutOrder['status'], OrderStatus>>,
  Assert<Equal<BaleCheckoutOrder['status'], BaleOrderStatus>>,
  Assert<Equal<CheckoutStatusResponse['checkout_status'], CheckoutStatus>>,
  Assert<Equal<NonNullable<CheckoutStatusResponse['latest_attempt']>['provider'], PaymentProvider>>,
  Assert<Equal<NonNullable<CheckoutStatusResponse['latest_attempt']>['status'], PaymentAttemptStatus>>,
]

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
