import { APIClient, APIError } from '../client'
import { RealtimeProtocolError } from '../types/messages-v2'
import type {
  ApiResponse,
  AttachmentDownloadAuthorization,
  AttachmentUploadAuthorization,
  AttachmentUploadBody,
  AttachmentUploadStatus,
  BuyerResolveThreadInput,
  Conversation,
  ConversationSummary,
  CreateAttachmentUploadInput,
  CreateMessageBlockInput,
  CreateMessageBlockResult,
  CreateMessageReportInput,
  CreateMessageReportResult,
  CursorPage,
  LegacyLinkResolution,
  LegacyMessageArchiveSummary,
  LegacyMessageRecord,
  ListConversationsParams,
  ListThreadMessagesParams,
  ListThreadsParams,
  Message,
  MessagePage,
  MessagingCapabilities,
  MessagingIdempotentRequestOptions,
  MessagingInboxes,
  MessagingPerspective,
  MessagesRealtimeConnection,
  MessagesRealtimeOptions,
  ReadCursorResult,
  RequestOptions,
  ResolveThreadResult,
  SendMessageInput,
  SendThreadMessageInput,
  SendThreadMessageResult,
  StoreResolveThreadInput,
  ThreadCard,
  ThreadId,
  UpdateConversationPreferencesInput,
  UpdateThreadPreferencesInput,
  WebSocketLike,
} from '../types'
import { ManagedMessagesRealtimeConnection } from '../realtime/messages-realtime'

function encode(value: string): string {
  return encodeURIComponent(value)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function unwrap<T>(value: unknown, valid: (data: unknown) => boolean = () => true): T {
  if (!isRecord(value) || value.api_version !== 2 || !('data' in value) || !valid(value.data)) {
    throw new APIError(502, { error: 'invalid_response', message: 'Messaging returned an invalid response.' })
  }
  return value.data as T
}

function isPage(value: unknown): boolean {
  return isRecord(value) && Array.isArray(value.items)
}

function isIdentified(value: unknown): boolean {
  return isRecord(value) && typeof value.id === 'string'
}

function perspectiveBase(perspective: MessagingPerspective): string {
  return perspective.kind === 'buyer'
    ? '/notify/v2/inboxes/buyer'
    : `/notify/v2/inboxes/stores/${encode(perspective.store_id)}`
}

function query(params: object): Record<string, string | number | boolean | undefined> | undefined {
  const entries = Object.entries(params) as Array<[string, string | number | boolean | undefined]>
  return entries.some(([, value]) => value !== undefined) ? Object.fromEntries(entries) : undefined
}

function idempotentOptions(options: MessagingIdempotentRequestOptions): RequestOptions {
  if (!options.idempotencyKey.trim()) throw new TypeError('idempotencyKey is required.')
  return {
    signal: options.signal,
    headers: { ...options.headers, 'Idempotency-Key': options.idempotencyKey },
  }
}

function validateLimit(params: { limit?: number }): void {
  if (params.limit !== undefined && (!Number.isInteger(params.limit) || params.limit < 1 || params.limit > 100)) {
    throw new RangeError('Messaging limit must be an integer from 1 through 100.')
  }
}

function validateSendInput(input: SendThreadMessageInput): void {
  if (!input.client_message_id.trim()) throw new TypeError('client_message_id is required.')
  const length = input.body.trim().length
  if (length < 1 || length > 2_000) throw new RangeError('Message body must contain 1 to 2,000 characters after trimming.')
}

function validateAttachmentInput(input: CreateAttachmentUploadInput): void {
  if (!input.file_name.trim() || !input.content_type.trim()) throw new TypeError('Attachment file name and content type are required.')
  if (!Number.isSafeInteger(input.size_bytes) || input.size_bytes < 1) throw new RangeError('Attachment size must be a positive integer.')
  if (!/^[a-f0-9]{64}$/u.test(input.sha256)) throw new TypeError('Attachment SHA-256 must be lowercase hexadecimal.')
}

function uploadBodySize(body: AttachmentUploadBody): number {
  if ('size' in body) return body.size
  return body.byteLength
}

async function parseDirectResponse<T>(response: Response): Promise<T> {
  let decoded: unknown
  try {
    decoded = await response.json()
  } catch {
    throw new APIError(response.status || 502, { error: 'invalid_response', message: 'Messaging returned an invalid response.' })
  }
  if (!response.ok) {
    const error = isRecord(decoded) && isRecord(decoded.error)
      ? decoded.error
      : decoded
    throw new APIError(response.status, {
      error: isRecord(error) && typeof error.code === 'string'
        ? error.code
        : isRecord(error) && typeof error.error === 'string'
          ? error.error
          : 'unknown_error',
      message: isRecord(error) && typeof error.message === 'string' ? error.message : response.statusText,
      details: isRecord(error) ? error.details : undefined,
    })
  }
  return unwrap<T>(decoded)
}

export class MessagesModule {
  constructor(private readonly client: APIClient) {}

  /** @deprecated Use listConversations or listStoreConversations. Context fields are non-authoritative server-validated hints. */
  async list(storeId?: string, options?: RequestOptions): Promise<{ data: Conversation[] }> {
    return this.client.get<{ data: Conversation[] }>(
      '/notify/messages',
      storeId ? { store_id: storeId } : undefined,
      options,
    )
  }

  /** @deprecated Resolve a v2 thread and call listThreadMessages. */
  async getThread(partnerId: string, storeId?: string, options?: RequestOptions): Promise<{ data: Message[] }> {
    return this.client.get<{ data: Message[] }>(
      `/notify/messages/${partnerId}`,
      storeId ? { store_id: storeId } : undefined,
      options,
    )
  }

  /** @deprecated Use sendThreadMessage. Receiver and context fields are hints validated by the server. */
  async send(input: SendMessageInput, options?: RequestOptions): Promise<{ id: string }> {
    return this.client.post<{ id: string }>('/notify/messages', input, options)
  }

  /** @deprecated Use advanceThreadReadCursor for precise monotonic state. */
  async markRead(partnerId: string, storeId?: string, options?: RequestOptions): Promise<{ ok: true }> {
    const path = storeId
      ? `/notify/messages/${partnerId}/read?store_id=${storeId}`
      : `/notify/messages/${partnerId}/read`
    return this.client.post<{ ok: true }>(path, undefined, options)
  }

  /** @deprecated Use managed messaging realtime. */
  connectTyping(partnerId: string): WebSocket {
    const token = this.client.getToken()
    const wsUrl = this.client.getBaseUrl().replace(/^http/, 'ws') + `/notify/messages/${partnerId}/ws?token=${token}`
    return new WebSocket(wsUrl)
  }

  /** @deprecated Use managed messaging realtime. */
  connectInbox(): WebSocket {
    const token = this.client.getToken()
    const wsUrl = this.client.getBaseUrl().replace(/^http/, 'ws') + `/notify/messages/inbox?token=${token}`
    return new WebSocket(wsUrl)
  }

  /** Create a legacy inbox socket only after hydrating/refreshing the access token. */
  async connectInboxFresh(options?: RequestOptions): Promise<WebSocketLike> {
    await this.client.ensureFreshToken(options)
    const token = this.client.getToken() ?? ''
    const wsUrl = this.client.getBaseUrl().replace(/^http/, 'ws') + `/notify/messages/inbox?token=${encode(token)}`
    return this.client.createWebSocket(wsUrl, [])
  }

  /** Create a report for a message or conversation. */
  async createReport(input: CreateMessageReportInput, options?: RequestOptions): Promise<CreateMessageReportResult> {
    return this.client.post<CreateMessageReportResult>('/notify/messages/reports', input, options)
  }

  /** Create an idempotent bilateral buyer/store relationship block. */
  async createBlock(input: CreateMessageBlockInput, options?: RequestOptions): Promise<CreateMessageBlockResult> {
    return this.client.post<CreateMessageBlockResult>('/notify/messages/blocks', input, options)
  }

  /** Remove a block created by the current perspective. */
  async removeBlock(blockId: string, options?: RequestOptions): Promise<{ ok: true; active: false }> {
    return this.client.delete<{ ok: true; active: false }>(`/notify/messages/blocks/${encode(blockId)}`, undefined, options)
  }

  /** Discover server messaging capabilities. */
  async getMessagingCapabilities(options?: RequestOptions): Promise<MessagingCapabilities> {
    const value = await this.client.get<unknown>('/notify/v2/capabilities', undefined, options)
    return unwrap<MessagingCapabilities>(value, isRecord)
  }

  /** List buyer and represented-store inbox perspectives. */
  async listMessagingInboxes(options?: RequestOptions): Promise<MessagingInboxes> {
    const value = await this.client.get<unknown>('/notify/v2/inboxes', undefined, options)
    return unwrap<MessagingInboxes>(value, isRecord)
  }

  /** List personal buyer conversations. */
  async listConversations(params: ListConversationsParams = {}, options?: RequestOptions): Promise<CursorPage<ConversationSummary>> {
    validateLimit(params)
    const value = await this.client.get<unknown>('/notify/v2/inboxes/buyer/conversations', query(params), options)
    return unwrap<CursorPage<ConversationSummary>>(value, isPage)
  }

  /** List conversations for one represented store. */
  async listStoreConversations(storeId: string, params: ListConversationsParams = {}, options?: RequestOptions): Promise<CursorPage<ConversationSummary>> {
    validateLimit(params)
    const value = await this.client.get<unknown>(`/notify/v2/inboxes/stores/${encode(storeId)}/conversations`, query(params), options)
    return unwrap<CursorPage<ConversationSummary>>(value, isPage)
  }

  /** Get one authorized buyer/store conversation. */
  async getConversation(perspective: MessagingPerspective, conversationId: string, options?: RequestOptions): Promise<ConversationSummary> {
    const value = await this.client.get<unknown>(`${perspectiveBase(perspective)}/conversations/${encode(conversationId)}`, undefined, options)
    const data = unwrap<{ conversation: ConversationSummary }>(value, isRecord)
    if (!isIdentified(data.conversation)) throw new APIError(502, { error: 'invalid_response' })
    return data.conversation
  }

  /** Resolve a General, Listing, or Order thread idempotently. */
  async resolveThread(
    perspective: MessagingPerspective,
    input: BuyerResolveThreadInput | StoreResolveThreadInput,
    options: MessagingIdempotentRequestOptions,
  ): Promise<ResolveThreadResult> {
    const value = await this.client.post<unknown>(`${perspectiveBase(perspective)}/threads/resolve`, input, idempotentOptions(options))
    return unwrap<ResolveThreadResult>(value, (data) => isRecord(data) && isIdentified(data.thread) && isIdentified(data.conversation))
  }

  /** List contextual thread cards for one conversation. */
  async listThreads(
    perspective: MessagingPerspective,
    conversationId: string,
    params: ListThreadsParams = {},
    options?: RequestOptions,
  ): Promise<CursorPage<ThreadCard>> {
    validateLimit(params)
    const value = await this.client.get<unknown>(
      `${perspectiveBase(perspective)}/conversations/${encode(conversationId)}/threads`,
      query(params),
      options,
    )
    return unwrap<CursorPage<ThreadCard>>(value, isPage)
  }

  /** Get one contextual thread card and its conversation. */
  async getConversationThread(
    perspective: MessagingPerspective,
    threadId: ThreadId,
    options?: RequestOptions,
  ): Promise<{ conversation: ConversationSummary; thread: ThreadCard }> {
    const value = await this.client.get<unknown>(`${perspectiveBase(perspective)}/threads/${encode(threadId)}`, undefined, options)
    return unwrap(value, (data) => isRecord(data) && isIdentified(data.thread) && isIdentified(data.conversation))
  }

  /** Update shared support status for a Listing or Order thread. */
  async updateThreadStatus(
    perspective: MessagingPerspective,
    threadId: ThreadId,
    status: 'open' | 'resolved',
    options?: RequestOptions,
  ): Promise<ThreadCard> {
    const value = await this.client.patch<unknown>(`${perspectiveBase(perspective)}/threads/${encode(threadId)}/status`, { status }, options)
    const data = unwrap<{ thread: ThreadCard }>(value, isRecord)
    if (!isIdentified(data.thread)) throw new APIError(502, { error: 'invalid_response' })
    return data.thread
  }

  /** Update perspective-private thread preferences. */
  async updateThreadPreferences(
    perspective: MessagingPerspective,
    threadId: ThreadId,
    preferences: UpdateThreadPreferencesInput,
    options?: RequestOptions,
  ): Promise<ThreadCard> {
    const value = await this.client.patch<unknown>(`${perspectiveBase(perspective)}/threads/${encode(threadId)}/preferences`, preferences, options)
    const data = unwrap<{ thread: ThreadCard }>(value, isRecord)
    if (!isIdentified(data.thread)) throw new APIError(502, { error: 'invalid_response' })
    return data.thread
  }

  /** Update perspective-private conversation preferences. */
  async updateConversationPreferences(
    perspective: MessagingPerspective,
    conversationId: string,
    preferences: UpdateConversationPreferencesInput,
    options?: RequestOptions,
  ): Promise<ConversationSummary> {
    const value = await this.client.patch<unknown>(`${perspectiveBase(perspective)}/conversations/${encode(conversationId)}/preferences`, preferences, options)
    const data = unwrap<{ conversation: ConversationSummary }>(value, isRecord)
    if (!isIdentified(data.conversation)) throw new APIError(502, { error: 'invalid_response' })
    return data.conversation
  }

  /** List the newest, older, or catch-up timeline window for one thread. */
  async listThreadMessages(
    perspective: MessagingPerspective,
    threadId: ThreadId,
    params: ListThreadMessagesParams = {},
    options?: RequestOptions,
  ): Promise<MessagePage> {
    validateLimit(params)
    const value = await this.client.get<unknown>(`${perspectiveBase(perspective)}/threads/${encode(threadId)}/messages`, query(params), options)
    return unwrap<MessagePage>(value, isPage)
  }

  /** Send one idempotent message without ever replacing the caller-owned ID. */
  async sendThreadMessage(
    perspective: MessagingPerspective,
    threadId: ThreadId,
    input: SendThreadMessageInput,
    options?: RequestOptions,
  ): Promise<SendThreadMessageResult> {
    validateSendInput(input)
    const { client_message_id, ...body } = input
    const value = await this.client.post<unknown>(
      `${perspectiveBase(perspective)}/threads/${encode(threadId)}/messages`,
      body,
      { ...options, headers: { ...options?.headers, 'Idempotency-Key': client_message_id } },
    )
    return unwrap<SendThreadMessageResult>(value, (data) => isRecord(data) && isIdentified(data.message))
  }

  /** Advance the selected perspective read cursor to one visible timeline item. */
  async advanceThreadReadCursor(
    perspective: MessagingPerspective,
    threadId: ThreadId,
    timelineItemId: string,
    options?: RequestOptions,
  ): Promise<ReadCursorResult> {
    const value = await this.client.put<unknown>(
      `${perspectiveBase(perspective)}/threads/${encode(threadId)}/read-cursor`,
      { timeline_item_id: timelineItemId },
      options,
    )
    return unwrap<ReadCursorResult>(value, (data) => isRecord(data) && typeof data.last_read_sequence === 'number')
  }

  /** List read-only exact-participant legacy archives. */
  async listLegacyMessageArchives(params: ListConversationsParams = {}, options?: RequestOptions): Promise<CursorPage<LegacyMessageArchiveSummary>> {
    validateLimit(params)
    const value = await this.client.get<unknown>('/notify/v2/legacy-messages', query(params), options)
    return unwrap<CursorPage<LegacyMessageArchiveSummary>>(value, isPage)
  }

  /** List messages in one read-only legacy archive. */
  async listLegacyMessages(legacyThreadId: string, params: ListThreadMessagesParams = {}, options?: RequestOptions): Promise<MessagePage | { items: LegacyMessageRecord[]; older_cursor: string | null; has_older: boolean }> {
    validateLimit(params)
    const value = await this.client.get<unknown>(`/notify/v2/legacy-messages/${encode(legacyThreadId)}`, query(params), options)
    return unwrap(value, isPage)
  }

  /** Resolve a temporary partner/order link without guessing between stores. */
  async resolveLegacyLink(
    input: { partner_id: string; store_id: string | null; order_id: string | null },
    options?: RequestOptions,
  ): Promise<LegacyLinkResolution> {
    const value = await this.client.post<unknown>('/notify/v2/inboxes/buyer/legacy-links/resolve', input, options)
    return unwrap<LegacyLinkResolution>(value, (data) => isRecord(data) && typeof data.result === 'string')
  }

  /** Authorize a private attachment upload for one thread. */
  async createThreadAttachmentUpload(
    perspective: MessagingPerspective,
    threadId: ThreadId,
    input: CreateAttachmentUploadInput,
    options?: RequestOptions,
  ): Promise<AttachmentUploadAuthorization> {
    validateAttachmentInput(input)
    const value = await this.client.post<unknown>(`${perspectiveBase(perspective)}/threads/${encode(threadId)}/attachment-uploads`, input, options)
    return unwrap<AttachmentUploadAuthorization>(value, (data) => isRecord(data) && data.state === 'authorized' && typeof data.upload_url === 'string')
  }

  /** Upload exact bytes through a one-use application ticket. */
  async uploadThreadAttachment(
    authorization: AttachmentUploadAuthorization,
    body: AttachmentUploadBody,
    options?: RequestOptions,
  ): Promise<AttachmentUploadStatus> {
    if (uploadBodySize(body) !== authorization.accepted.size_bytes) {
      throw new RangeError('Attachment body size does not match its authorization.')
    }
    const response = await fetch(authorization.upload_url, {
      method: 'PUT',
      headers: { ...options?.headers, 'Content-Type': authorization.accepted.content_type },
      body: body as BodyInit,
      signal: options?.signal,
    })
    return parseDirectResponse<AttachmentUploadStatus>(response)
  }

  /** Get current status for an upload created by the same perspective. */
  async getThreadAttachmentUpload(
    perspective: MessagingPerspective,
    threadId: ThreadId,
    uploadId: string,
    options?: RequestOptions,
  ): Promise<AttachmentUploadStatus> {
    const value = await this.client.get<unknown>(
      `${perspectiveBase(perspective)}/threads/${encode(threadId)}/attachment-uploads/${encode(uploadId)}`,
      undefined,
      options,
    )
    return unwrap<AttachmentUploadStatus>(value, (data) => isRecord(data) && typeof data.state === 'string')
  }

  /** Create a short-lived mediated download for one committed attachment. */
  async createThreadAttachmentDownload(
    perspective: MessagingPerspective,
    threadId: ThreadId,
    attachmentId: string,
    options?: RequestOptions,
  ): Promise<AttachmentDownloadAuthorization> {
    const value = await this.client.post<unknown>(
      `${perspectiveBase(perspective)}/threads/${encode(threadId)}/attachments/${encode(attachmentId)}/download`,
      undefined,
      options,
    )
    return unwrap<AttachmentDownloadAuthorization>(value, (data) => isRecord(data) && typeof data.url === 'string')
  }

  /** Create an inert managed realtime connection. Register listeners before start(). */
  createMessagesRealtimeConnection(options: MessagesRealtimeOptions): MessagesRealtimeConnection {
    return new ManagedMessagesRealtimeConnection(this.client, options)
  }

  /** Create and start a managed realtime connection. */
  async connectMessagesRealtime(options: MessagesRealtimeOptions): Promise<MessagesRealtimeConnection> {
    const connection = this.createMessagesRealtimeConnection(options)
    await connection.start()
    return connection
  }
}
