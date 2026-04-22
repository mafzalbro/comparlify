import { describe, it, expect, vi } from 'vitest'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

vi.mock('@/lib/prisma', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
    },
  },
}))

describe('Auth Configuration Callbacks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('signIn callback', () => {
    it('returns false if user is suspended', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ suspended: true } as any)

      const result = await authOptions.callbacks?.signIn?.({
        user: { email: 'suspended@example.com' } as any,
        account: null as any,
        profile: {} as any,
      })

      expect(result).toBe(false)
    })

    it('returns true if user is not suspended', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ suspended: false } as any)

      const result = await authOptions.callbacks?.signIn?.({
        user: { email: 'active@example.com' } as any,
        account: null as any,
        profile: {} as any,
      })

      expect(result).toBe(true)
    })

    it('returns false if no email provided', async () => {
      const result = await authOptions.callbacks?.signIn?.({
        user: {} as any,
        account: null as any,
        profile: {} as any,
      })

      expect(result).toBe(false)
    })
  })

  describe('jwt callback', () => {
    it('augments token with user data during sign in', async () => {
      const token = {}
      const user = {
        id: '123',
        role: 'ADMIN',
        onboarded: true,
        newsletter: false,
        suspended: false,
      }

      const result = await authOptions.callbacks?.jwt?.({
        token,
        user: user as any,
        account: null as any,
        profile: {} as any,
        trigger: 'signIn'
      })

      expect(result).toEqual({
        id: '123',
        role: 'ADMIN',
        onboarded: true,
        newsletter: false,
        suspended: false,
      })
    })
  })

  describe('session callback', () => {
    it('augments session with token data', async () => {
      const session = { user: {} }
      const token = {
        id: '123',
        role: 'ADMIN',
        onboarded: true,
        newsletter: false,
        suspended: false,
      }

      const result = await authOptions.callbacks?.session?.({
        session: session as any,
        token: token as any,
        user: {} as any,
      })

      expect(result.user).toEqual({
        id: '123',
        role: 'ADMIN',
        onboarded: true,
        newsletter: false,
        suspended: false,
      })
    })
  })
})
