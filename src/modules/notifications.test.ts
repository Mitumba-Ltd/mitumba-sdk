import { describe, it, expect, vi, beforeEach } from 'vitest'
import { APIClient } from '../client'
import { NotificationsModule } from './notifications'

describe('NotificationsModule', () => {
  let apiClient: APIClient
  let notificationsModule: NotificationsModule

  beforeEach(() => {
    apiClient = new APIClient({ baseUrl: 'https://api.mitumba.test' })
    notificationsModule = new NotificationsModule(apiClient)
  })

  describe('list', () => {
    it('calls GET /notify/notifications without page', async () => {
      vi.spyOn(apiClient, 'get').mockResolvedValue({ data: [], unread_count: 0, page: 1 })

      await notificationsModule.list()

      expect(apiClient.get).toHaveBeenCalledWith('/notify/notifications', undefined, undefined)
    })

    it('calls GET /notify/notifications with page', async () => {
      vi.spyOn(apiClient, 'get').mockResolvedValue({ data: [], unread_count: 0, page: 2 })

      await notificationsModule.list(2)

      expect(apiClient.get).toHaveBeenCalledWith('/notify/notifications', { page: 2 }, undefined)
    })
  })

  describe('markRead', () => {
    it('calls POST /notify/notifications/read with ids', async () => {
      vi.spyOn(apiClient, 'post').mockResolvedValue({ ok: true })

      const ids = ['notif_1', 'notif_2']
      await notificationsModule.markRead(ids)

      expect(apiClient.post).toHaveBeenCalledWith('/notify/notifications/read', { ids }, undefined)
    })

    it('calls POST /notify/notifications/read without ids to mark all', async () => {
      vi.spyOn(apiClient, 'post').mockResolvedValue({ ok: true })

      await notificationsModule.markRead()

      expect(apiClient.post).toHaveBeenCalledWith('/notify/notifications/read', {}, undefined)
    })
  })
})
