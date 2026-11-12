---
"@mitumba/sdk": minor
---

- `admin.listSettings()` returns every platform setting with its current value, who last changed it and why, and whether it can be changed from the console.
- `admin.getSetting(key)` returns one setting and its change history.
- `admin.changeSetting(key, { value, reason })` changes an editable setting. It requires `roles:grant` and a recent passkey. It refuses payment and messaging settings (`not_editable`), and refuses a change that would remove the caller's own operator domain (`would_lock_you_out`).
- New types:
  - `PlatformSetting`
  - `PlatformSettingDetail`
  - `PlatformSettingChange`
  - `PlatformSettingKind`
  - `PlatformSettingGroup`
  - `ChangePlatformSettingInput`
  - `ChangePlatformSettingResult`
