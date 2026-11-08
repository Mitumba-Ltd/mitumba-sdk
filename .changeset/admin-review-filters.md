---
"@mitumba/sdk": minor
---

Admin list filters and wholesale review: `sdk.admin.listStores({ seller_id })` lists one seller's stores; `sdk.disputes.list({ status: 'all', q })` lists every status and searches by dispute, order, buyer or seller ID; `sdk.admin.listWholesaleApplications({ status: 'pending' | 'rejected' })` and `sdk.admin.rejectWholesaleStore(storeId, reason)` give wholesale applications a real rejection; `AdminWholesalePendingStore` gains its review fields.
