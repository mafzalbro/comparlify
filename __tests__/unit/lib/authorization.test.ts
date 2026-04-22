import { describe, it, expect, vi, beforeEach } from 'vitest'
import { checkAuthorization } from '@/lib/authorization'
import { redirect } from 'next/navigation'

vi.mock('next/navigation', () => ({
  redirect: vi.fn()
}))

describe('Authorization Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('redirects to login for protected routes if no session', async () => {
    try {
      await checkAuthorization(null, '/panel')
    } catch (e) {
      // ignore redirect 'error'
    }
    expect(redirect).toHaveBeenCalledWith(expect.stringContaining('/login'))
  })

  it('allows access to non-protected routes without session', async () => {
    await checkAuthorization(null, '/about')
    expect(redirect).not.toHaveBeenCalled()
  })

  it('allows ADMIN to access any admin path', async () => {
    const session = { user: { role: 'ADMIN' } } as any
    await checkAuthorization(session, '/admin/settings')
    expect(redirect).not.toHaveBeenCalled()
  })

  it('denies USER from accessing admin paths', async () => {
    const session = { user: { role: 'USER' } } as any
    try {
      await checkAuthorization(session, '/admin')
    } catch (e) {}
    expect(redirect).toHaveBeenCalledWith('/')
  })

  it('allows EDITOR to access /admin/blog but not /admin/settings', async () => {
    const session = { user: { role: 'EDITOR' } } as any

    // Allowed
    await checkAuthorization(session, '/admin/blog')
    expect(redirect).not.toHaveBeenCalled()

    // Denied
    try {
      await checkAuthorization(session, '/admin/settings')
    } catch (e) {}
    expect(redirect).toHaveBeenCalledWith('/')
  })
})
