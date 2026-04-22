import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPostAction } from '@/app/actions/community'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'

vi.mock('@/lib/prisma', () => ({
  default: {
    forumTopic: { findUnique: vi.fn() },
    forumPost: { create: vi.fn() },
    user: { findMany: vi.fn().mockResolvedValue([]) },
    notification: { create: vi.fn() }, // Needed because community actions use notifications
  },
}))

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

describe('Community Post Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createPostAction', () => {
    it('creates a reply to a topic', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'u1' } })
      ;(prisma.forumTopic.findUnique as any).mockResolvedValue({ id: 't1', title: 'Topic 1' })

      const formData = new FormData()
      formData.set('content', 'This is a reply')
      formData.set('topicId', 't1')

      const result = await createPostAction({}, formData)

      expect(prisma.forumPost.create).toHaveBeenCalled()
      expect(result.success).toBe(true)
    })
  })
})
