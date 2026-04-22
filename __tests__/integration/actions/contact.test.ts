import { describe, it, expect, vi, beforeEach } from 'vitest'
import { sendContactMessageAction } from '@/app/actions/contact'
import prisma from '@/lib/prisma'

vi.mock('@/lib/prisma', () => ({
  default: {
    contactMessage: {
      create: vi.fn(),
    },
  },
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

describe('sendContactMessageAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns errors for invalid data', async () => {
    const formData = new FormData()
    formData.set('name', 'J')
    formData.set('email', 'invalid-email')
    formData.set('message', 'short')

    const result = await sendContactMessageAction({ error: null, success: false }, formData)

    expect(result.success).toBe(false)
    expect(result.error).toHaveProperty('name')
    expect(result.error).toHaveProperty('email')
    expect(result.error).toHaveProperty('message')
  })

  it('creates a contact message and returns success for valid data', async () => {
    const formData = new FormData()
    formData.set('name', 'John Doe')
    formData.set('email', 'john@example.com')
    formData.set('message', 'This is a long enough message.')

    ;(prisma.contactMessage.create as any).mockResolvedValue({} as any)

    const result = await sendContactMessageAction({ error: null, success: false }, formData)

    expect(result.success).toBe(true)
    expect(result.error).toBeNull()
    expect(prisma.contactMessage.create).toHaveBeenCalledWith({
      data: {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'This is a long enough message.',
      },
    })
  })

  it('returns an error message if prisma create fails', async () => {
    const formData = new FormData()
    formData.set('name', 'John Doe')
    formData.set('email', 'john@example.com')
    formData.set('message', 'This is a long enough message.')

    ;(prisma.contactMessage.create as any).mockRejectedValue(new Error('DB Error'))

    const result = await sendContactMessageAction({ error: null, success: false }, formData)

    expect(result.success).toBe(false)
    expect(typeof result.error).toBe('string')
  })
})
