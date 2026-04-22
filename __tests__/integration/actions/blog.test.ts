import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPost } from '@/app/actions/blog'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'

vi.mock('@/lib/prisma', () => ({
  default: {
    post: {
      create: vi.fn(),
    },
  },
}))

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))

describe('Blog Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createPost', () => {
    it('returns error if not authorized', async () => {
      (auth as any).mockResolvedValue({ user: { role: 'USER' } })
      const formData = new FormData()

      const result = await createPost({}, formData)
      expect(result.error).toBe('Not authorized')
    })

    it('validates required fields', async () => {
      (auth as any).mockResolvedValue({ user: { role: 'ADMIN', id: 'admin1' } })
      const formData = new FormData()
      formData.set('title', 'Hi') // Too short

      const result = await createPost({}, formData)
      expect(result.error).toHaveProperty('title')
      expect(result.error).toHaveProperty('slug')
    })

    it('creates post and redirects for valid data', async () => {
      (auth as any).mockResolvedValue({ user: { role: 'ADMIN', id: 'admin1' } })
      const formData = new FormData()
      formData.set('title', 'Valid Title')
      formData.set('slug', 'valid-slug')
      formData.set('description', 'This is a long enough description.')
      formData.set('content', 'This is a long enough content body for the post.')
      formData.set('image', 'img.jpg')
      formData.set('categoryId', 'cat1')
      formData.set('published', 'on')

      const { redirect } = await import('next/navigation')

      await createPost({}, formData)

      expect(prisma.post.create).toHaveBeenCalled()
      expect(redirect).toHaveBeenCalledWith('/admin/blog')
    })
  })
})
