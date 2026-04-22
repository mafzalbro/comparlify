import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createTopicAction } from '@/app/actions/community'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'

vi.mock('@/lib/prisma', () => ({
  default: {
    forumTopic: { create: vi.fn(), findUnique: vi.fn() },
    forumCategory: { findUnique: vi.fn() },
    user: { findMany: vi.fn().mockResolvedValue([]) },
  },
}))

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

describe('Community Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createTopicAction', () => {
    it('requires authentication', async () => {
      (auth as any).mockResolvedValue(null)
      const result = await createTopicAction({}, new FormData())
      expect(result.error).toContain('logged in')
    })

    it('validates topic data', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'u1' } })
      const formData = new FormData()
      formData.set('title', 'Short')

      const result = await createTopicAction({}, formData)
      expect(result.error).toHaveProperty('title')
    })

    it('creates a topic and notifies admins', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'u1' } })
      ;(prisma.forumCategory.findUnique as any).mockResolvedValue({ id: 'c1', slug: 'cat' })
      ;(prisma.user.findMany as any).mockResolvedValue([{ id: 'admin1' }])

      const formData = new FormData()
      formData.set('title', 'This is a long enough title for a topic.')
      formData.set('content', 'This is a long enough content body for a topic.')
      formData.set('categoryId', 'c1')

      const result = await createTopicAction({}, formData)

      expect(prisma.forumTopic.create).toHaveBeenCalled()
      expect(result.success).toBe(true)
    })
  })
})
