import { describe, it, expect, vi, beforeEach } from 'vitest'
import { toggleBookmarkAction } from '@/app/actions/bookmarks'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'

vi.mock('@/lib/prisma', () => ({
  default: {
    bookmark: {
      findFirst: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

describe('Bookmark Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('requires authentication', async () => {
    (auth as any).mockResolvedValue(null)
    const result = await toggleBookmarkAction({ postId: 'p1', path: '/blog/p1' })
    expect(result.error).toContain('logged in')
  })

  it('creates a bookmark if it does not exist', async () => {
    (auth as any).mockResolvedValue({ user: { id: 'u1' } })
    ;(prisma.bookmark.findFirst as any).mockResolvedValue(null)

    const result = await toggleBookmarkAction({ postId: 'p1', path: '/blog/p1' })

    expect(prisma.bookmark.create).toHaveBeenCalledWith({
      data: { userId: 'u1', postId: 'p1', comparisonId: undefined }
    })
    expect(result.bookmarked).toBe(true)
  })

  it('removes a bookmark if it exists', async () => {
    (auth as any).mockResolvedValue({ user: { id: 'u1' } })
    ;(prisma.bookmark.findFirst as any).mockResolvedValue({ id: 'b1' })

    const result = await toggleBookmarkAction({ postId: 'p1', path: '/blog/p1' })

    expect(prisma.bookmark.delete).toHaveBeenCalledWith({
      where: { id: 'b1' }
    })
    expect(result.bookmarked).toBe(false)
  })
})
