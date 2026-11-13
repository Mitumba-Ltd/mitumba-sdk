---
'@mitumba/sdk': minor
---

Bale orders carry the buyer protection fee: `BaleOrder` gains `bpf_kes` and `amount_due_kes` (the bales' price plus the BPF, what the buyer pays), and `wholesale.createBaleOrder` returns `CreatedBaleOrder` with both.
