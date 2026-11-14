import { describe, it, expect } from 'vitest'
import { categoriesBySection, categorySection, isConditionAllowed, isNewOnlyCategory } from './categories'
import type { Category } from '../types'

const top: Category = { id: 'top', name: 'Tops', slug: 'tops', section: 'fashion', new_only: false }
const towels: Category = { id: 'towels', name: 'Towels', slug: 'towels', section: 'home', new_only: true }
const rugs: Category = { id: 'rugs', name: 'Rugs', slug: 'rugs', section: 'home', new_only: false }
const legacy: Category = { id: 'bag', name: 'Bags', slug: 'bags' }

describe('categorySection', () => {
  it('reads the section, defaulting to fashion', () => {
    expect(categorySection(towels)).toBe('home')
    expect(categorySection(top)).toBe('fashion')
    expect(categorySection(legacy)).toBe('fashion')
  })
})

describe('isNewOnlyCategory / isConditionAllowed', () => {
  it('allows only new items in a new-only category', () => {
    expect(isNewOnlyCategory(towels)).toBe(true)
    expect(isConditionAllowed(towels, 'new')).toBe(true)
    expect(isConditionAllowed(towels, 'good')).toBe(false)
  })

  it('allows every condition elsewhere, including when the response does not say', () => {
    expect(isNewOnlyCategory(rugs)).toBe(false)
    expect(isNewOnlyCategory(legacy)).toBe(false)
    expect(isConditionAllowed(rugs, 'fair')).toBe(true)
    expect(isConditionAllowed(legacy, 'like_new')).toBe(true)
  })
})

describe('categoriesBySection', () => {
  it('splits by section and keeps the given order', () => {
    expect(categoriesBySection([towels, top, legacy, rugs])).toEqual({ fashion: [top, legacy], home: [towels, rugs] })
  })

  it('returns empty sections for no categories', () => {
    expect(categoriesBySection([])).toEqual({ fashion: [], home: [] })
  })
})
