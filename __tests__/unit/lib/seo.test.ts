import { describe, it, expect, vi } from 'vitest'
import { generateSeoMetadata } from '@/lib/seo'
import * as contentLib from '@/lib/content'

vi.mock('@/lib/content', () => ({
  getContent: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  default: {
    siteContent: {
        findMany: vi.fn().mockResolvedValue([])
    }
  },
}))

describe('SEO Utilities', () => {
  it('generates correct metadata with custom title', async () => {
    (contentLib.getContent as any).mockResolvedValue({
      'global.siteName': 'Comparlify',
      'seo.default.title': 'Default Title',
      'seo.default.description': 'Default Desc',
      'seo.default.keywords': 'k1, k2',
      'seo.default.twitter': '@comparlify',
      'seo.default.url': 'https://comparlify.com',
    })

    const metadata = await generateSeoMetadata({
      title: 'About',
      path: '/about',
    })

    expect(metadata.title).toBe('About | Comparlify')
    expect(metadata.description).toBe('Default Desc')
    expect(metadata.alternates?.canonical).toBe('https://comparlify.com/about')
  })

  it('handles custom description and keywords', async () => {
    (contentLib.getContent as any).mockResolvedValue({
      'global.siteName': 'Comparlify',
      'seo.default.title': 'Default Title',
      'seo.default.description': 'Default Desc',
      'seo.default.keywords': 'k1, k2',
      'seo.default.twitter': '@comparlify',
      'seo.default.url': 'https://comparlify.com',
    })

    const metadata = await generateSeoMetadata({
      description: 'Custom Desc',
      keywords: ['k3', 'k4'],
      path: '/test',
    })

    expect(metadata.description).toBe('Custom Desc')
    expect(metadata.keywords).toContain('k1')
    expect(metadata.keywords).toContain('k3')
  })

  it('uses default title if none provided', async () => {
    (contentLib.getContent as any).mockResolvedValue({
      'global.siteName': 'Comparlify',
      'seo.default.title': 'Default Title',
      'seo.default.description': 'Default Desc',
      'seo.default.keywords': 'k1, k2',
      'seo.default.twitter': '@comparlify',
      'seo.default.url': 'https://comparlify.com',
    })

    const metadata = await generateSeoMetadata({ path: '/' })
    expect(metadata.title).toContain('Default Title')
  })
})
