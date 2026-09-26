---
"@mitumba/sdk": minor
---

Add the contracts the standalone admin console needs:

- public auth capabilities and backup-code regeneration
- assisted recovery request, status, cancellation, completion, review queue and audit events
- operator permission and role management, audit trail, payout approval queue, approve/hold, correlation repair, and wholesale moderation
- typed admin permissions, authentication strength, role presets, operators, pending payouts and recovery records
- one-time root setup using a protocol header rather than placing the bootstrap secret in a JSON body
- custom request headers that cannot override the SDK-managed Authorization header

Also makes the three previously dead IP-blocking methods real by matching the backend endpoints, while preserving their published call signature as a deprecated overload.
