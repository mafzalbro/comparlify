import { describe, it, expect, vi } from 'vitest'
import { createNotification } from '@/lib/notifications'
import prisma from '@/lib/prisma'

vi.mock('@/lib/prisma', () => ({
  default: {
    notification: {
      create: vi.fn(),
    },
  },
}))

describe('Notification Utilities', () => {
  it('calls prisma create with correct data', async () => {
    const props = {
      userId: 'u1',
      type: 'NEW_USER_REGISTERED' as any,
      message: 'Hello',
      link: '/test',
    }

    await createNotification(props)

    expect(prisma.notification.create).toHaveBeenCalledWith({
      data: props
    })
  })

  it('handles errors gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    ;(prisma.notification.create as any).mockRejectedValue(new Error('DB Fail'))

    await createNotification({ userId: 'u1', type: 'INFO' as any, message: 'm', link: 'l' })

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Failed'), expect.any(Error))
    consoleSpy.mockRestore()
  })
})
