import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateGenericContentAction } from '@/app/actions/ai'
import { generateGenericContent } from '@/ai/flows/ai-generic-content-generator'
import { auth } from '@/lib/auth'

vi.mock('@/ai/flows/ai-generic-content-generator', () => ({
  generateGenericContent: vi.fn(),
}))

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('@/ai/flows/ai-query-comparlify-chatbot', () => ({
  aiQueryComparlifyChatbot: vi.fn(),
}))

describe('AI Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('generateGenericContentAction', () => {
    it('returns error if not authorized', async () => {
      (auth as any).mockResolvedValue(null)
      const result = await generateGenericContentAction({ prompt: 'p', topic: 't' })
      expect(result.error).toBe('Not authorized.')
    })

    it('validates input', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'u1' } })
      const result = await generateGenericContentAction({ prompt: '', topic: '' })
      expect(result.error).toBeDefined()
    })

    it('calls AI flow with enhanced prompt', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'u1' } })
      ;(generateGenericContent as any).mockResolvedValue({ generatedContent: 'AI response' })

      const result = await generateGenericContentAction({ prompt: 'Write a bio', topic: 'React Dev' })

      expect(generateGenericContent).toHaveBeenCalledWith(expect.objectContaining({
        topic: 'React Dev',
        prompt: expect.stringContaining('RULES')
      }))
      expect(result.generatedContent).toBe('AI response')
    })
  })
})
