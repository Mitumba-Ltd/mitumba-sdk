import { APIClient } from '../client'
import type { Conversation, Message, SendMessageInput, RequestOptions } from '../types'

export class MessagesModule {
  constructor(private readonly client: APIClient) {}

  /**
   * List all conversations for the authenticated user.
   */
  async list(options?: RequestOptions): Promise<{ data: Conversation[] }> {
    return this.client.get<{ data: Conversation[] }>('/notify/messages', undefined, options)
  }

  /**
   * Get the message thread with a specific partner.
   */
  async getThread(partnerId: string, options?: RequestOptions): Promise<{ data: Message[] }> {
    return this.client.get<{ data: Message[] }>(`/notify/messages/${partnerId}`, undefined, options)
  }

  /**
   * Send a message to another user.
   */
  async send(input: SendMessageInput, options?: RequestOptions): Promise<{ id: string }> {
    return this.client.post<{ id: string }>('/notify/messages', input, options)
  }
}
