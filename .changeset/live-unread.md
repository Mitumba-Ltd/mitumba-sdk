---
'@mitumba/sdk': minor
---

`notifications.liveUnread(options?)` returns a `LiveUnread`: a bell's unread count kept current without a reload.
- It reads the count once, then follows the live notification stream.
- While the stream is not open (connecting, refused, failed), it polls on resume (window focus or document visibility by default) and every minute.
- After a refusal or failure it asks for a new stream at most every ten minutes.
- Create one per page and share it between bells. The first subscriber starts it; the last one to leave stops it and closes the socket.
- Options: `surface` (default `web`) and `onResume`.
