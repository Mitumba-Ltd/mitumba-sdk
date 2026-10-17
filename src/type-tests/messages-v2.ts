import type {
  ApiResponse,
  AttachmentUploadAuthorization,
  AttachmentUploadState,
  AttachmentUploadStatus,
  BuyerResolveThreadInput,
  BuyerSummary,
  Conversation,
  ConversationId,
  ConversationSummary,
  CursorPage,
  InboxRealtimeEvent,
  LegacyLinkResolution,
  LegacyMessageArchiveSummary,
  LegacyMessageRecord,
  ListThreadMessagesParams,
  Message,
  MessageAttachment,
  MessageAuthor,
  MessageId,
  MessagePage,
  MessagesModule,
  MessagingCapabilities,
  MessagingCursor,
  MessagingErrorCode,
  MessagingPerspective,
  ReadCursorResult,
  RequestOptions,
  ResolveThreadResult,
  SendMessageInput,
  SendThreadMessageInput,
  SendThreadMessageResult,
  StoreResolveThreadInput,
  StoreSummary,
  ThreadCard,
  ThreadId,
  ThreadMessage,
  ThreadSubject,
  ThreadSystemEvent,
  ThreadTimelineItem,
  ThreadTimelineItemId,
} from '../index'

type Equal<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends
  (<Value>() => Value extends Right ? 1 : 2)
    ? true
    : false

type Assert<Condition extends true> = Condition

type GeneralSubject = Extract<ThreadSubject, { kind: 'general' }>
type ListingSubject = Extract<ThreadSubject, { kind: 'listing' }>
type OrderSubject = Extract<ThreadSubject, { kind: 'order' }>
type BuyerAuthor = Extract<MessageAuthor, { side: 'buyer' }>
type StoreAuthor = Extract<MessageAuthor, { side: 'store' }>
type GeneralCard = Extract<ThreadCard, { kind: 'general' }>
type ListingCard = Extract<ThreadCard, { kind: 'listing' }>
type OrderCard = Extract<ThreadCard, { kind: 'order' }>
type MessageItem = Extract<ThreadTimelineItem, { kind: 'message' }>
type SystemItem = Extract<ThreadTimelineItem, { kind: 'system' }>
type ListingToOrderLink = Extract<ThreadSystemEvent['link'], { direction: 'listing_to_order' }>
type OrderToListingLink = Extract<ThreadSystemEvent['link'], { direction: 'order_to_listing' }>
type ResolvedLegacyLink = Extract<LegacyLinkResolution, { result: 'resolved' }>
type ChooseStoreLegacyLink = Extract<LegacyLinkResolution, { result: 'choose_store' }>
type ArchiveLegacyLink = Extract<LegacyLinkResolution, { result: 'legacy_archive' }>
type UnavailableLegacyLink = Extract<LegacyLinkResolution, { result: 'unavailable' }>
type RootSDKExports = typeof import('../index')

export type MessagingV2RuntimeExportAssertions = [
  Assert<Equal<
    RootSDKExports['isMessagingAPIError'],
    {
      (value: unknown): value is import('../client').APIError & { code: MessagingErrorCode }
      <Code extends MessagingErrorCode>(
        value: unknown,
        code: Code,
      ): value is import('../client').APIError & { code: Code }
    }
  >>,
  Assert<Equal<ConstructorParameters<RootSDKExports['RealtimeProtocolError']>, []>>,
  Assert<Equal<InstanceType<RootSDKExports['RealtimeProtocolError']>, import('../index').RealtimeProtocolError>>,
  Assert<Equal<ConstructorParameters<RootSDKExports['RealtimeUnavailableError']>, []>>,
  Assert<Equal<InstanceType<RootSDKExports['RealtimeUnavailableError']>, import('../index').RealtimeUnavailableError>>,
]

export type MessagingV2IdentifierAssertions = [
  Assert<Equal<ConversationId, string>>,
  Assert<Equal<ThreadId, string>>,
  Assert<Equal<MessageId, string>>,
  Assert<Equal<ThreadTimelineItemId, string>>,
  Assert<Equal<MessagingCursor, string>>,
]

export type MessagingV2EnvelopeAssertions = [
  Assert<Equal<ApiResponse<BuyerSummary>['api_version'], 2>>,
  Assert<Equal<ApiResponse<BuyerSummary>['data'], BuyerSummary>>,
  Assert<Equal<CursorPage<StoreSummary>['items'], StoreSummary[]>>,
  Assert<Equal<CursorPage<StoreSummary>['next_cursor'], MessagingCursor | null>>,
]

export type MessagingV2UnionAssertions = [
  Assert<Equal<MessagingPerspective['kind'], 'buyer' | 'store'>>,
  Assert<Equal<GeneralSubject, { kind: 'general' }>>,
  Assert<Equal<ListingSubject['availability'], 'active' | 'sold' | 'inactive' | 'unknown'>>,
  Assert<Equal<OrderSubject['order_id'], string>>,
  Assert<Equal<BuyerAuthor['buyer'], BuyerSummary>>,
  Assert<Equal<StoreAuthor['store'], StoreSummary>>,
  Assert<Equal<GeneralCard['subject'], GeneralSubject>>,
  Assert<Equal<ListingCard['subject'], ListingSubject>>,
  Assert<Equal<OrderCard['subject'], OrderSubject>>,
  Assert<Equal<MessageItem['message'], ThreadMessage>>,
  Assert<Equal<SystemItem['event'], ThreadSystemEvent>>,
  Assert<Equal<ListingToOrderLink['related_thread']['subject'], OrderSubject>>,
  Assert<Equal<OrderToListingLink['related_thread']['subject'], ListingSubject>>,
]

export type MessagingV2ResourceAssertions = [
  Assert<Equal<ConversationSummary['id'], ConversationId>>,
  Assert<Equal<ConversationSummary['last_thread'], ThreadCard | null>>,
  Assert<Equal<ConversationSummary['unread_count'], number>>,
  Assert<Equal<ThreadCard['status'], 'open' | 'resolved'>>,
  Assert<Equal<ThreadCard['preferences'], {
    archived: boolean
    pinned: boolean
    muted: boolean
  }>>,
  Assert<Equal<ThreadCard['unread_count'], number>>,
  Assert<Equal<ThreadMessage['id'], MessageId>>,
  Assert<Equal<ThreadMessage['thread_id'], ThreadId>>,
  Assert<Equal<ThreadMessage['author'], MessageAuthor>>,
  Assert<Equal<ThreadMessage['attachments'], MessageAttachment[]>>,
  Assert<Equal<MessagePage['items'], ThreadTimelineItem[]>>,
  Assert<Equal<ReadCursorResult['last_read_item_id'], ThreadTimelineItemId>>,
  Assert<Equal<ResolveThreadResult['thread'], ThreadCard>>,
  Assert<Equal<SendThreadMessageResult['message'], ThreadMessage>>,
]

export type MessagingV2CapabilityAndLegacyAssertions = [
  Assert<Equal<AttachmentUploadState,
    'authorized' | 'uploaded' | 'pending_scan' | 'safe' | 'rejected' | 'expired' | 'claimed'
  >>,
  Assert<Equal<AttachmentUploadAuthorization['state'], 'authorized'>>,
  Assert<Equal<AttachmentUploadStatus['attachment'], MessageAttachment | null>>,
  Assert<Equal<MessagingCapabilities['api_version'], 2>>,
  Assert<Equal<MessagingCapabilities['http']['enabled'], boolean>>,
  Assert<Equal<MessagingCapabilities['realtime']['enabled'], boolean>>,
  Assert<Equal<MessagingCapabilities['realtime']['protocol_versions'], number[]>>,
  Assert<Equal<MessagingCapabilities['attachments']['enabled'], boolean>>,
  Assert<Equal<LegacyMessageArchiveSummary['other_user'], BuyerSummary>>,
  Assert<Equal<LegacyMessageRecord['sender'], BuyerSummary>>,
  Assert<Equal<LegacyLinkResolution['result'],
    'resolved' | 'choose_store' | 'legacy_archive' | 'unavailable'
  >>,
  Assert<Equal<ResolvedLegacyLink, {
    result: 'resolved'
    conversation_id: ConversationId
    thread_id: ThreadId
  }>>,
  Assert<Equal<ChooseStoreLegacyLink, { result: 'choose_store'; stores: StoreSummary[] }>>,
  Assert<Equal<ArchiveLegacyLink, { result: 'legacy_archive'; legacy_thread_id: string }>>,
  Assert<Equal<UnavailableLegacyLink, { result: 'unavailable' }>>,
]

export type MessagingV2InputAssertions = [
  Assert<Equal<BuyerResolveThreadInput['kind'], 'general' | 'listing' | 'order'>>,
  Assert<Equal<StoreResolveThreadInput['kind'], 'general' | 'order'>>,
  Assert<Equal<SendThreadMessageInput['client_message_id'], string>>,
  Assert<Equal<SendThreadMessageInput['reply_to_message_id'], MessageId | undefined>>,
  Assert<Equal<SendThreadMessageInput['attachment_ids'], string[] | undefined>>,
]

export type MessagingV2ErrorAssertions = [
  Assert<Equal<MessagingErrorCode,
    | 'invalid_input'
    | 'unauthorized'
    | 'session_expired'
    | 'forbidden'
    | 'conversation_not_found'
    | 'thread_not_found'
    | 'message_not_found'
    | 'timeline_item_not_found'
    | 'context_mismatch'
    | 'idempotency_conflict'
    | 'cursor_invalid'
    | 'cursor_expired'
    | 'attachment_not_ready'
    | 'blocked'
    | 'legacy_context_required'
    | 'client_upgrade_required'
    | 'rate_limited'
    | 'temporarily_unavailable'
    | 'internal_error'
    | 'invalid_response'
    | 'network_error'
  >>,
]

export type LegacyMessageDeclarationAssertions = [
  Assert<Equal<Conversation, {
    partner_id: string
    partner_name: string
    store_name?: string | null
    body: string
    created_at: string
    store_id?: string | null
    listing_id?: string | null
    listing_title?: string | null
    unread_count: number
  }>>,
  Assert<Equal<Message, {
    id: string
    sender_id: string
    receiver_id: string
    body: string
    listing_id: string | null
    store_id: string | null
    order_id?: string | null
    from_store?: number
    read_at: string | null
    created_at: string
  }>>,
  Assert<Equal<SendMessageInput, {
    receiver_id: string
    body: string
    listing_id?: string
    store_id?: string
    order_id?: string
    from_store?: boolean
  }>>,
  Assert<Equal<InboxRealtimeEvent, {
    type: 'message'
    conversation_key: string
    partner_id: string
    store_id?: string | null
    from_store?: boolean
    preview: string
    created_at: string
    unread_count?: number
  }>>,
]

export type LegacyMessagesMethodAssertions = [
  Assert<Equal<
    MessagesModule['list'],
    (storeId?: string, options?: RequestOptions) => Promise<{ data: Conversation[] }>
  >>,
  Assert<Equal<
    MessagesModule['getThread'],
    (partnerId: string, storeId?: string, options?: RequestOptions) => Promise<{ data: Message[] }>
  >>,
  Assert<Equal<
    MessagesModule['send'],
    (input: SendMessageInput, options?: RequestOptions) => Promise<{ id: string }>
  >>,
  Assert<Equal<
    MessagesModule['markRead'],
    (partnerId: string, storeId?: string, options?: RequestOptions) => Promise<{ ok: true }>
  >>,
  Assert<Equal<MessagesModule['connectTyping'], (partnerId: string) => WebSocket>>,
  Assert<Equal<MessagesModule['connectInbox'], () => WebSocket>>,
  Assert<Equal<InboxRealtimeEvent['type'], 'message'>>,
]

export function assertMessagingPerspectiveNarrowing(perspective: MessagingPerspective): void {
  if (perspective.kind === 'buyer') {
    // @ts-expect-error Buyer perspectives never expose a store identifier.
    const storeId: string = perspective.store_id
    void storeId
    return
  }

  const storeId: string = perspective.store_id
  void storeId
}

export function assertMessageAuthorNarrowing(author: MessageAuthor): void {
  if (author.side === 'buyer') {
    const buyer: BuyerSummary = author.buyer
    // @ts-expect-error Buyer authors never expose store identity.
    const store: StoreSummary = author.store
    void buyer
    void store
    return
  }

  const store: StoreSummary = author.store
  // @ts-expect-error Store authors never expose buyer or human operator identity.
  const buyer: BuyerSummary = author.buyer
  void store
  void buyer
}

export function assertThreadTimelineNarrowing(item: ThreadTimelineItem): void {
  if (item.kind === 'message') {
    const message: ThreadMessage = item.message
    // @ts-expect-error Message timeline items never contain a system event.
    const event: ThreadSystemEvent = item.event
    void message
    void event
    return
  }

  const event: ThreadSystemEvent = item.event
  // @ts-expect-error System timeline items never contain a human message.
  const message: ThreadMessage = item.message
  void event
  void message
}

export function assertAcceptedCursorForms(): void {
  const newest: ListThreadMessagesParams = {}
  const older: ListThreadMessagesParams = { before: 'older', limit: 30 }
  const catchUp: ListThreadMessagesParams = { after: 'newer', limit: 100 }
  void newest
  void older
  void catchUp
}

export function assertLegacyResolutionNarrowing(resolution: LegacyLinkResolution): void {
  if (resolution.result === 'resolved') {
    const conversationId: ConversationId = resolution.conversation_id
    const threadId: ThreadId = resolution.thread_id
    // @ts-expect-error Resolved links do not expose store choices.
    const stores: StoreSummary[] = resolution.stores
    void conversationId
    void threadId
    void stores
    return
  }

  if (resolution.result === 'choose_store') {
    const stores: StoreSummary[] = resolution.stores
    // @ts-expect-error Store-choice results do not expose a canonical thread yet.
    const threadId: ThreadId = resolution.thread_id
    void stores
    void threadId
    return
  }

  if (resolution.result === 'legacy_archive') {
    const archiveId: string = resolution.legacy_thread_id
    // @ts-expect-error Legacy archive results do not expose a v2 conversation.
    const conversationId: ConversationId = resolution.conversation_id
    void archiveId
    void conversationId
    return
  }

  // @ts-expect-error Unavailable results deliberately expose no resource identifier.
  const threadId: ThreadId = resolution.thread_id
  void threadId
}

export function rejectInvalidCursorCombination(): void {
  // @ts-expect-error Older and catch-up cursors are mutually exclusive.
  const params: ListThreadMessagesParams = { before: 'older', after: 'newer', limit: 30 }
  void params
}

export function rejectStoreListingResolution(): void {
  // @ts-expect-error Stores cannot create Listing inquiry threads.
  const input: StoreResolveThreadInput = { kind: 'listing', listing_id: 'listing_1' }
  void input
}

export function rejectInvalidThreadCardCorrelation(): void {
  const invalid: ListingCard['subject'] = {
    // @ts-expect-error Listing cards cannot carry Order subjects.
    kind: 'order',
    order_id: 'order_1',
    short_id: '#1',
    listing_title: 'Listing',
    image_url: null,
    order_status: 'paid',
  }
  void invalid
}

export function rejectInvalidSystemLinkCorrelation(): void {
  const invalid: ListingToOrderLink['related_thread'] = {
    id: 'thread_1',
    kind: 'order',
    subject: {
      // @ts-expect-error Listing-to-Order links cannot carry Listing subjects.
      kind: 'listing',
      listing_id: 'listing_1',
      title: 'Listing',
      image_url: null,
      availability: 'active',
    },
  }
  void invalid
}
