import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { isAuthorized } from '@/lib/api-auth'

describe('isAuthorized API utility', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv, REST_API_KEY: 'test-api-key' }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('authorizes with a valid API key', () => {
    const req = new Request('http://localhost:3000/api/rest', {
      headers: { 'x-api-key': 'test-api-key' }
    })
    expect(isAuthorized(req)).toBe(true)
  })

  it('denies with an invalid API key', () => {
    const req = new Request('http://localhost:3000/api/rest', {
      headers: { 'x-api-key': 'wrong-key' }
    })
    expect(isAuthorized(req)).toBe(false)
  })

  it('authorizes with a valid same-origin header', () => {
    const req = new Request('http://localhost:3000/api/rest', {
      headers: {
        'host': 'localhost:3000',
        'origin': 'http://localhost:3000'
      }
    })
    expect(isAuthorized(req)).toBe(true)
  })

  it('authorizes with a valid referer header', () => {
    const req = new Request('http://localhost:3000/api/rest', {
      headers: {
        'host': 'localhost:3000',
        'referer': 'http://localhost:3000/dashboard'
      }
    })
    expect(isAuthorized(req)).toBe(true)
  })

  it('denies when host and origin do not match', () => {
    const req = new Request('http://localhost:3000/api/rest', {
      headers: {
        'host': 'localhost:3000',
        'origin': 'http://malicious.com'
      }
    })
    expect(isAuthorized(req)).toBe(false)
  })

  it('denies when origin/referer are missing (direct browser access)', () => {
    const req = new Request('http://localhost:3000/api/rest', {
      headers: {
        'host': 'localhost:3000'
      }
    })
    expect(isAuthorized(req)).toBe(false)
  })
})
