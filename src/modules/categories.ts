import type { Category, CategorySection } from '../types'

/** The section a category belongs to; `fashion` when the response does not say. */
export function categorySection(category: Pick<Category, 'section'>): CategorySection {
  return category.section === 'home' ? 'home' : 'fashion'
}

/** Whether listings in this category must be `new`. */
export function isNewOnlyCategory(category: Pick<Category, 'new_only'>): boolean {
  return category.new_only === true
}

/** Whether a listing condition is allowed in this category. */
export function isConditionAllowed(
  category: Pick<Category, 'new_only'>,
  condition: 'new' | 'like_new' | 'good' | 'fair',
): boolean {
  return !isNewOnlyCategory(category) || condition === 'new'
}

export interface CategoriesBySection {
  fashion: Category[]
  home: Category[]
}

/** Categories split by section, each keeping the order it was given in. */
export function categoriesBySection(categories: readonly Category[]): CategoriesBySection {
  const grouped: CategoriesBySection = { fashion: [], home: [] }
  for (const category of categories) grouped[categorySection(category)].push(category)
  return grouped
}
