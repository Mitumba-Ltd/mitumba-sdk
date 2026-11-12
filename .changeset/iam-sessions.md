---
"@mitumba/sdk": minor
---

- New self-service methods for IAM users:
  - `iam.listSessions()` returns this user's live sessions. The one making the request is marked `current`.
  - `iam.endSession(id)` ends one of those sessions.
  - `iam.listSignIns({ limit? })` returns recent sign-in attempts, both successful and refused.
- New administration methods (require `roles:grant`):
  - `iam.listUserSessions(orgId, userId)`
  - `iam.endUserSession(orgId, userId, sessionId)`
  - `iam.endAllUserSessions(orgId, userId)` signs the user out of every device now without disabling them.
  - `iam.listUserSignIns(orgId, userId, { limit? })`
- New types: `IamSession`, `IamSessionsResult`, `IamSignIn`, `IamSignInsResult`, `IamSignInFailureReason`.
