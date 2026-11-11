---
"@mitumba/sdk": minor
---

- New methods for the messaging safety queue:
  - `admin.listMessageReports({ status?, page? })` returns `AdminMessageReportList`: reported conversations and messages, oldest first. Each carries the reported side's recent risk signals and a `priority`.
  - `admin.getMessageReport(id)` returns `AdminMessageReportDetail`: the report, its thread as delivered, and the unmasked original when it may be released. It requires `audit:read` and a recent passkey. Opening a report is audited.
  - `admin.resolveMessageReport(id, { status, outcome, note? })` returns `ResolveMessageReportResult`. A repeat of the same resolution is a safe retry; a conflicting one is 409.
- `AdminPayoutItem` gains `needs_correlation`, and `admin.listPayouts()` accepts `needs_correlation: 0 | 1`. This finds Daraja payouts whose provider reference must be repaired with `admin.repairPayoutCorrelation()`.
- New types:
  - `AdminMessageReport`
  - `AdminMessageReportList`
  - `AdminMessageReportDetail`
  - `AdminMessageReportThreadMessage`
  - `MessageReportStatus`
  - `MessageReportOutcome`
  - `MessagingSide`
  - `ResolveMessageReportInput`
  - `ResolveMessageReportResult`
