---
"@mitumba/sdk": minor
---

Add IAM self-service: `sdk.iam.regenerateBackupCodes(password)` replaces an IAM user's recovery codes, and `sdk.iam.deleteMethod(methodId, password)` removes one of their own second factors (refused with `last_factor` when it is the only verified one).
