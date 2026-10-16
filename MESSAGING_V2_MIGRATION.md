# Messaging v2 Migration Guide

Messaging v2 is additive in SDK 1.x. Partner methods remain available until 2.0.0; new code should use explicit buyer/store perspectives, stable conversation/thread IDs, caller-owned idempotency IDs, monotonic reads, and managed realtime.

## Compatibility

| SDK | Backend capability | Behavior |
|---|---|---|
| 1.31 and earlier | v1 | Partner methods only |
| Messaging-v2 minor | v1 | Existing partner methods continue unchanged |
| Messaging-v2 minor | `http.enabled` | Conversation/thread HTTP methods available |
| Messaging-v2 minor | `realtime.enabled` | Managed ticketed realtime available |
| Messaging-v2 minor | `attachments.enabled` | Private attachment controls may be shown |
| 2.0.0 | v2 required | Partner methods may be removed |

Always call `getMessagingCapabilities()` before enabling optional UI. A missing/false capability is a normal fallback state.

## Conversation and thread resolution

```typescript
import { MitumbaClient } from '@mitumba/sdk'

const sdk = new MitumbaClient({ baseUrl: 'https://api.mitumba.stanl.ink' })
const buyer = { kind: 'buyer' } as const
const store = { kind: 'store', store_id: 'store_123' } as const

const general = await sdk.messages.resolveThread(
  buyer,
  { kind: 'general', store_id: 'store_123' },
  { idempotencyKey: 'resolve-general-store-123' },
)

const listing = await sdk.messages.resolveThread(
  buyer,
  { kind: 'listing', store_id: 'store_123', listing_id: 'listing_456' },
  { idempotencyKey: 'resolve-listing-456' },
)

const order = await sdk.messages.resolveThread(
  store,
  { kind: 'order', order_id: 'order_789' },
  { idempotencyKey: 'resolve-order-789-store-123' },
)
```

Do not infer a thread from names or partner IDs. Reuse the same resolution key for an exact retry.

## Newest, older, and catch-up pages

```typescript
const newest = await sdk.messages.listThreadMessages(buyer, listing.thread.id, { limit: 30 })

const older = newest.older_cursor
  ? await sdk.messages.listThreadMessages(buyer, listing.thread.id, {
      before: newest.older_cursor,
      limit: 30,
    })
  : null

const catchUp = newest.newer_cursor
  ? await sdk.messages.listThreadMessages(buyer, listing.thread.id, {
      after: newest.newer_cursor,
      limit: 100,
    })
  : null
```

Every returned page is ascending by server sequence. `before` and `after` are mutually exclusive at compile time.

## Retry-safe send

```typescript
const clientMessageId = crypto.randomUUID()
const input = {
  client_message_id: clientMessageId,
  body: 'Is this still available?',
}

try {
  await sdk.messages.sendThreadMessage(buyer, listing.thread.id, input)
} catch (error) {
  // On an ambiguous network outcome, retry the identical input and ID.
  await sdk.messages.sendThreadMessage(buyer, listing.thread.id, input)
}
```

A reused ID with changed content returns `idempotency_conflict`. The SDK never generates a replacement ID during retry.

## Monotonic read state

```typescript
const last = newest.items.at(-1)
if (last) {
  const itemId = last.kind === 'message' ? last.message.id : last.event.id
  await sdk.messages.advanceThreadReadCursor(buyer, listing.thread.id, itemId)
}
```

Do not maintain canonical unread totals with client-side increment/decrement arithmetic. Refetch server projections after reconnect or `resync.required`.

## Managed realtime

```typescript
let resumeCursor: string | null = null
const connection = sdk.messages.createMessagesRealtimeConnection({
  perspective: buyer,
  resumeCursor,
})

const stopEvents = connection.onEvent(async (event) => {
  if ('resume_cursor' in event) resumeCursor = event.resume_cursor
  if (event.type === 'resync.required') {
    await sdk.messages.listConversations()
    await sdk.messages.listThreadMessages(buyer, listing.thread.id, { limit: 100 })
  }
})

connection.subscribeThread(listing.thread.id)
await connection.start()

// Cleanup on sign-out/unmount.
stopEvents()
connection.close()
```

The SDK requests a fresh one-use ticket for every connection/reconnect. Access and refresh tokens never enter a WebSocket URL. Transient closes reconnect with bounded full jitter. Invalid sessions, removed store authorization, and protocol mismatch are terminal.

## Abort and authentication behavior

All HTTP and ticket methods forward `AbortSignal`. Native `AbortError` and ordinary network errors propagate unchanged. A transient refresh failure preserves stored tokens. Only definitive refresh credential rejection clears the session and invokes `onAuthExpired`.

## Private attachments

```typescript
const capabilities = await sdk.messages.getMessagingCapabilities()
if (capabilities.attachments.enabled) {
  const upload = await sdk.messages.createThreadAttachmentUpload(
    buyer,
    listing.thread.id,
    {
      file_name: 'condition.jpg',
      content_type: 'image/jpeg',
      size_bytes: bytes.byteLength,
      sha256: digest,
    },
  )
  await sdk.messages.uploadThreadAttachment(upload, bytes)
}
```

Never persist or log upload/download tickets. Pending, rejected, and expired uploads are not valid send attachments.

## Error handling

```typescript
import { isMessagingAPIError } from '@mitumba/sdk'

try {
  await sdk.messages.listConversations()
} catch (error) {
  if (isMessagingAPIError(error, 'cursor_expired')) {
    await sdk.messages.listConversations()
  } else if (isMessagingAPIError(error, 'session_expired')) {
    // Start the application sign-in flow.
  }
}
```

| Category | Typical action |
|---|---|
| `invalid_input`, `context_mismatch` | Correct input; do not retry unchanged |
| `idempotency_conflict` | Reconcile the original operation |
| `cursor_invalid`, `cursor_expired` | Restart the relevant page/refetch |
| `rate_limited` | Wait for the server retry window |
| `temporarily_unavailable`, `network_error` | Retry with backoff |
| `session_expired` | Reauthenticate |
| `forbidden`, resource not found | Remove inaccessible local state |
| `invalid_response` | Fail safely and report SDK/backend version |

## Legacy mapping

| Legacy | Messaging v2 |
|---|---|
| `list()` | `listConversations()` / `listStoreConversations()` |
| `getThread(partnerId)` | `resolveThread()` then `listThreadMessages()` |
| `send({ receiver_id, ... })` | `sendThreadMessage(perspective, threadId, input)` |
| `markRead(partnerId)` | `advanceThreadReadCursor()` |
| `connectTyping()` / `connectInbox()` | managed realtime connection |

Legacy context fields are non-authoritative hints validated by the server. Do not build new behavior around partner-wide identity.
