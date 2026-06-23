---
"@mitumba/sdk": minor
---

Add `sdk.admin` module for platform administration (requires admin role):

- `blockIp(ip, durationHours?)` — block an IP address (POST /admin/block-ip)
- `unblockIp(ip)` — remove IP block (POST /admin/unblock-ip)
- `getBlockedIps()` — list blocked IPs (GET /admin/blocked-ips)
- `getSystemStats()` — platform statistics (GET /admin/stats)
- `suspendUser(userId, reason)` — suspend account (POST /admin/users/:id/suspend)
- `unsuspendUser(userId)` — reactivate account (POST /admin/users/:id/unsuspend)
- `verifyStore(storeId)` — grant verified badge (POST /admin/stores/:id/verify)
- `unverifyStore(storeId)` — revoke verified badge (POST /admin/stores/:id/unverify)

New exported types: `BlockedIp`, `SystemStats`
