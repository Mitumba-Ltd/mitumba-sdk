import { APIClient } from '../client'
import type { MailerTemplate, SendEmailInput, RequestOptions } from '../types'

export class MailerModule {
  constructor(private readonly client: APIClient) {}

  /**
   * Send a transactional email via the notifications worker.
   */
  async send(template: MailerTemplate, input: SendEmailInput, options?: RequestOptions): Promise<{ ok: true }> {
    return this.client.post<{ ok: true }>('/notify/email', { template, ...input }, options)
  }
}
