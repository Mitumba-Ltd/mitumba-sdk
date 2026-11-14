---
'@mitumba/sdk': minor
---

Categories carry an optional `section` (`'fashion' | 'home'`) and `new_only` flag. New helpers:
- `categorySection` reads the section, defaulting to fashion;
- `isNewOnlyCategory` and `isConditionAllowed` check the condition rule;
- `categoriesBySection` splits a category list by section.

Creating or editing a listing as used in a new-only category is `409 new_only_category`.
