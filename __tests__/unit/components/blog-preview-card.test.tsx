import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { BlogPreviewCard } from '@/components/blog-preview-card'
import { getPostPreview } from '@/app/actions/blog'

vi.mock('@/app/actions/blog', () => ({
  getPostPreview: vi.fn()
}))

vi.mock('@/components/managed-image', () => ({
  ManagedImage: ({ alt }: any) => <img alt={alt} />
}))

describe('BlogPreviewCard component', () => {
  it('renders skeleton initially', () => {
    (getPostPreview as any).mockReturnValue(new Promise(() => {}))
    const { container } = render(<BlogPreviewCard slug="test-post" />)
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('renders post data after loading', async () => {
    const mockPost = {
      title: 'Mock Post Title',
      description: 'Mock Description',
      image: 'https://example.com/image.jpg',
      dataAiHint: 'hint'
    };
    (getPostPreview as any).mockResolvedValue(mockPost)

    render(<BlogPreviewCard slug="test-post" />)

    await waitFor(() => {
      expect(screen.getByText('Mock Post Title')).toBeInTheDocument()
    })
    expect(screen.getByText('Mock Description')).toBeInTheDocument()
    expect(screen.getByAltText('Mock Post Title')).toBeInTheDocument()
  })

  it('renders error message if post not found', async () => {
    (getPostPreview as any).mockResolvedValue(null)

    render(<BlogPreviewCard slug="non-existent" />)

    await waitFor(() => {
      expect(screen.getByText(/could not load preview/i)).toBeInTheDocument()
    })
  })
})
