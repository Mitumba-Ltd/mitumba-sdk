import { APIClient } from '../client'
import type { Conversation, Message, SendMessageInput, RequestOptions } from '../types'

export class MessagesModule {
  constructor(private readonly client: APIClient) {}

  /**
   * List all conversations for the authenticated user.
   */
  async list(storeId?: string, options?: RequestOptions): Promise<{ data: Conversation[] }> {
    return this.client.get<{ data: Conversation[] }>(
      '/notify/messages',
      storeId ? { store_id: storeId } : undefined,
      options
    )
  }

  /**
   * Get the message thread with a specific partner.
   */
  async getThread(partnerId: string, storeId?: string, options?: RequestOptions): Promise<{ data: Message[] }> {
    return this.client.get<{ data: Message[] }>(
      `/notify/messages/${partnerId}`,
      storeId ? { store_id: storeId } : undefined,
      options
    )
  }

  /**
   * Send a message to another user.
   */
  async send(input: SendMessageInput, options?: RequestOptions): Promise<{ id: string }> {
    return this.client.post<{ id: string }>('/notify/messages', input, options)
  }

  /**
   * Mark all messages from a partner as read.
   */
  async markRead(partnerId: string, storeId?: string, options?: RequestOptions): Promise<{ ok: true }> {
    const path = storeId
      ? `/notify/messages/${partnerId}/read?store_id=${storeId}`
      : `/notify/messages/${partnerId}/read`
    return this.client.post<{ ok: true }>(path, undefined, options)
  }

  /**
   * Connect to the typing indicator WebSocket for a conversation.
   * Token is passed via query param since WebSocket can't set headers.
   */
  connectTyping(partnerId: string): WebSocket {
    const token = this.client.getToken()
    const wsUrl = this.client.getBaseUrl().replace(/^http/, 'ws') + `/notify/messages/${partnerId}/ws?token=${token}`
    return new WebSocket(wsUrl)
  }
}
