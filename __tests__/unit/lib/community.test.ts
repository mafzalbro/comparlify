import { describe, it, expect, vi } from 'vitest'
import { getCommunityStats } from '@/lib/community'
import prisma from '@/lib/prisma'

vi.mock('@/lib/prisma', () => ({
  default: {
    user: { count: vi.fn() },
    forumTopic: { count: vi.fn() },
    forumPost: { count: vi.fn() },
  },
}))

describe('Community Utilities', () => {
  it('calculates community stats with correct branding logic', async () => {
    ;(prisma.user.count as any).mockResolvedValue(100)
    ;(prisma.forumTopic.count as any).mockResolvedValue(50)
    ;(prisma.forumPost.count as any).mockResolvedValue(200)

    const stats = await getCommunityStats()

    expect(stats.verifiedNodes).toBe(1384) // 100 + 1284
    expect(stats.activeSyncs).toBe(762) // 50 + 200 + 512
    expect(stats.signalAccuracy).toBe('99.4%')
  })
})
