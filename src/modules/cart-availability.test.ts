import { describe, expect, it } from 'vitest'
import { cartLineAvailability, isCartLineBuyable, partitionCart } from './cart-availability'

const line = (status: string, quantity: number, available: number, id = 'l1') =>
  ({ listing_id: id, status, quantity, available_quantity: available }) as never

describe('cartLineAvailability', () => {
  it.each([
    ['available', line('active', 2, 2)],
    ['available', line('active', 1, 5)],
    ['limited', line('active', 3, 1)],
    ['reserved', line('active', 1, 0)],
    ['sold', line('sold', 1, 0)],
    ['unavailable', line('removed', 1, 0)],
    ['unavailable', line('draft', 1, 3)],
  ])('reads %s', (expected, item) => {
    expect(cartLineAvailability(item)).toBe(expected)
  })

  it('treats available and limited lines as buyable', () => {
    expect(isCartLineBuyable(line('active', 1, 1))).toBe(true)
    expect(isCartLineBuyable(line('active', 3, 1))).toBe(true)
    expect(isCartLineBuyable(line('active', 1, 0))).toBe(false)
    expect(isCartLineBuyable(line('sold', 1, 0))).toBe(false)
  })
})

describe('partitionCart', () => {
  it('splits lines by what checkout needs done to them', () => {
    const a = line('active', 1, 1, 'a')
    const b = line('active', 4, 2, 'b')
    const c = line('sold', 1, 0, 'c')
    const d = line('active', 1, 0, 'd')
    expect(partitionCart([a, b, c, d])).toEqual({ buyable: [a], limited: [b], unavailable: [c, d] })
  })
})
