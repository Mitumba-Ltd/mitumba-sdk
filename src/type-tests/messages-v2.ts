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
  ThreadPreferences,
  ThreadStatus,
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
  Assert<Equal<ThreadCard['status'], ThreadStatus>>,
  Assert<Equal<ThreadCard['preferences'], ThreadPreferences>>,
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
  Assert<Equal<MessagingCapabilities['attachments']['enabled'], boolean>>,
  Assert<Equal<LegacyMessageArchiveSummary['other_user'], BuyerSummary>>,
  Assert<Equal<LegacyMessageRecord['sender'], BuyerSummary>>,
  Assert<Equal<LegacyLinkResolution['result'],
    'resolved' | 'choose_store' | 'legacy_archive' | 'unavailable'
  >>,
]

export type MessagingV2InputAssertions = [
  Assert<Equal<BuyerResolveThreadInput['kind'], 'general' | 'listing' | 'order'>>,
  Assert<Equal<StoreResolveThreadInput['kind'], 'general' | 'order'>>,
  Assert<Equal<SendThreadMessageInput['client_message_id'], string>>,
  Assert<Equal<SendThreadMessageInput['reply_to_message_id'], MessageId | undefined>>,
  Assert<Equal<SendThreadMessageInput['attachment_ids'], string[] | undefined>>,
]

export type MessagingV2ErrorAssertions = [
  Assert<Equal<Extract<MessagingErrorCode, 'network_error'>, 'network_error'>>,
  Assert<Equal<Extract<MessagingErrorCode, 'idempotency_conflict'>, 'idempotency_conflict'>>,
  Assert<Equal<Extract<MessagingErrorCode, 'cursor_expired'>, 'cursor_expired'>>,
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
