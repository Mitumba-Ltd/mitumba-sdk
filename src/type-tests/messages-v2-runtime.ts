import type {
  AttachmentDownloadAuthorization,
  AttachmentUploadAuthorization,
  AttachmentUploadStatus,
  ConversationSummary,
  CreateMessageBlockResult,
  CreateMessageReportResult,
  CursorPage,
  MessagePage,
  MessagesModule,
  MessagesRealtimeConnection,
  MessagesRealtimeOptions,
  MessagingCapabilities,
  MessagingInboxes,
  ReadCursorResult,
  ResolveThreadResult,
  ThreadCard,
  WebSocketFactory,
  WebSocketLike,
} from '../index'

type Equal<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends
  (<Value>() => Value extends Right ? 1 : 2)
    ? true
    : false

type Assert<Condition extends true> = Condition

export type MessagingRuntimeMethodAssertions = [
  Assert<Equal<ReturnType<MessagesModule['listMessagingInboxes']>, Promise<MessagingInboxes>>>,
  Assert<Equal<ReturnType<MessagesModule['listConversations']>, Promise<CursorPage<ConversationSummary>>>>,
  Assert<Equal<ReturnType<MessagesModule['listStoreConversations']>, Promise<CursorPage<ConversationSummary>>>>,
  Assert<Equal<ReturnType<MessagesModule['resolveThread']>, Promise<ResolveThreadResult>>>,
  Assert<Equal<ReturnType<MessagesModule['listThreads']>, Promise<CursorPage<ThreadCard>>>>,
  Assert<Equal<ReturnType<MessagesModule['listThreadMessages']>, Promise<MessagePage>>>,
  Assert<Equal<ReturnType<MessagesModule['advanceThreadReadCursor']>, Promise<ReadCursorResult>>>,
  Assert<Equal<ReturnType<MessagesModule['getMessagingCapabilities']>, Promise<MessagingCapabilities>>>,
  Assert<Equal<ReturnType<MessagesModule['createReport']>, Promise<CreateMessageReportResult>>>,
  Assert<Equal<ReturnType<MessagesModule['createBlock']>, Promise<CreateMessageBlockResult>>>,
  Assert<Equal<ReturnType<MessagesModule['createThreadAttachmentUpload']>, Promise<AttachmentUploadAuthorization>>>,
  Assert<Equal<ReturnType<MessagesModule['uploadThreadAttachment']>, Promise<AttachmentUploadStatus>>>,
  Assert<Equal<ReturnType<MessagesModule['createThreadAttachmentDownload']>, Promise<AttachmentDownloadAuthorization>>>,
  Assert<Equal<ReturnType<MessagesModule['createMessagesRealtimeConnection']>, MessagesRealtimeConnection>>,
  Assert<Equal<ReturnType<MessagesModule['connectMessagesRealtime']>, Promise<MessagesRealtimeConnection>>>,
]

export type MessagingWebSocketAssertions = [
  Assert<Equal<Parameters<WebSocketFactory>, [url: string, protocols: string | string[]]>>,
  Assert<Equal<ReturnType<WebSocketFactory>, WebSocketLike>>,
  Assert<Equal<MessagesRealtimeOptions['perspective']['kind'], 'buyer' | 'store'>>,
]

export async function compileMessagingV2Usage(messages: MessagesModule, bytes: Uint8Array): Promise<void> {
  const perspective = { kind: 'buyer' } as const
  const resolved = await messages.resolveThread(
    perspective,
    { kind: 'listing', store_id: 'store', listing_id: 'listing' },
    { idempotencyKey: 'resolve-listing' },
  )
  const newest = await messages.listThreadMessages(perspective, resolved.thread.id, { limit: 30 })
  if (newest.older_cursor) {
    await messages.listThreadMessages(perspective, resolved.thread.id, { before: newest.older_cursor })
  }
  await messages.sendThreadMessage(perspective, resolved.thread.id, {
    client_message_id: 'stable-client-message-id',
    body: 'Hello',
  })
  const upload = await messages.createThreadAttachmentUpload(perspective, resolved.thread.id, {
    file_name: 'photo.jpg',
    content_type: 'image/jpeg',
    size_bytes: bytes.byteLength,
    sha256: 'a'.repeat(64),
  })
  await messages.uploadThreadAttachment(upload, bytes)
  const realtime = messages.createMessagesRealtimeConnection({ perspective })
  realtime.subscribeThread(resolved.thread.id)
  const unsubscribe = realtime.onEvent(async () => undefined)
  await realtime.start()
  unsubscribe()
  realtime.close()
}
