import { describe, expect, it } from 'vitest'

import {
  APIError,
  isMessagingAPIError,
  RealtimeProtocolError,
  RealtimeUnavailableError,
} from '../index'

import type { MessagingErrorCode } from '../index'

const MESSAGING_ERROR_CODES: MessagingErrorCode[] = [
  'invalid_input',
  'unauthorized',
  'session_expired',
  'forbidden',
  'conversation_not_found',
  'thread_not_found',
  'message_not_found',
  'timeline_item_not_found',
  'context_mismatch',
  'idempotency_conflict',
  'cursor_invalid',
  'cursor_expired',
  'attachment_not_ready',
  'blocked',
  'legacy_context_required',
  'client_upgrade_required',
  'rate_limited',
  'temporarily_unavailable',
  'internal_error',
  'network_error',
]

describe('isMessagingAPIError', () => {
  it('accepts every documented messaging error code', () => {
    for (const code of MESSAGING_ERROR_CODES) {
      expect(isMessagingAPIError(new APIError(400, { error: code }), code)).toBe(true)
    }
  })

  it('accepts recognized messaging API errors', () => {
    const error = new APIError(404, {
      error: 'thread_not_found',
      message: 'Thread unavailable',
    })

    expect(isMessagingAPIError(error)).toBe(true)
    expect(isMessagingAPIError(error, 'thread_not_found')).toBe(true)
    expect(isMessagingAPIError(error, 'conversation_not_found')).toBe(false)
  })

  it('accepts SDK network errors as messaging errors', () => {
    const error = new APIError(0, {
      error: 'network_error',
      message: 'Network request failed',
    })

    expect(isMessagingAPIError(error, 'network_error')).toBe(true)
  })

  it('rejects non-messaging and malformed values', () => {
    expect(isMessagingAPIError(new APIError(409, { error: 'email_taken' }))).toBe(false)
    expect(isMessagingAPIError(new Error('thread_not_found'))).toBe(false)
    expect(isMessagingAPIError({ name: 'APIError', code: 'thread_not_found', status: 404 })).toBe(false)
    expect(isMessagingAPIError(null)).toBe(false)
    expect(isMessagingAPIError('thread_not_found')).toBe(false)
  })
})

describe('messaging realtime errors', () => {
  it('constructs a stable protocol error without untrusted frame content', () => {
    const error = new RealtimeProtocolError()

    expect(error).toBeInstanceOf(Error)
    expect(error.name).toBe('RealtimeProtocolError')
    expect(error.message).toBe('Messaging realtime protocol is invalid.')
  })

  it('constructs a stable runtime-unavailable error', () => {
    const error = new RealtimeUnavailableError()

    expect(error).toBeInstanceOf(Error)
    expect(error.name).toBe('RealtimeUnavailableError')
    expect(error.message).toBe('Messaging realtime is unavailable in this runtime.')
  })
})
