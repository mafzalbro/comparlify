import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Badge } from '@/components/ui/badge'

describe('Badge component', () => {
  it('renders correctly', () => {
    render(<Badge>New</Badge>)
    expect(screen.getByText(/new/i)).toBeInTheDocument()
  })

  it('applies variant classes', () => {
    render(<Badge variant="destructive">Error</Badge>)
    const badge = screen.getByText(/error/i)
    expect(badge).toHaveClass('bg-destructive')
  })

  it('applies outline variant', () => {
    render(<Badge variant="outline">Outline</Badge>)
    const badge = screen.getByText(/outline/i)
    expect(badge).toHaveClass('text-foreground')
  })
})
