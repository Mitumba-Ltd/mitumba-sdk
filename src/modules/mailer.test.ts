import { describe, it, expect, vi, beforeEach } from 'vitest'
import { APIClient } from '../client'
import { MailerModule } from './mailer'

describe('MailerModule', () => {
  let apiClient: APIClient
  let mailerModule: MailerModule

  beforeEach(() => {
    apiClient = new APIClient({ baseUrl: 'https://api.mitumba.test' })
    mailerModule = new MailerModule(apiClient)
  })

  describe('send', () => {
    it('calls POST /notify/email with template and input', async () => {
      vi.spyOn(apiClient, 'post').mockResolvedValue({ ok: true })
      const input = { to: 'user@example.com', variables: { username: 'Jane' } }
      await mailerModule.send('welcome', input)
      expect(apiClient.post).toHaveBeenCalledWith('/notify/email', { template: 'welcome', ...input }, undefined)
    })
  })
})
