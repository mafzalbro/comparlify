import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { DiscoveryHub } from '@/components/home/discovery-hub'

describe('DiscoveryHub component', () => {
  it('renders all core categories', () => {
    render(<DiscoveryHub />)

    expect(screen.getByText('Course Platforms')).toBeInTheDocument()
    expect(screen.getByText('AI Creation Tools')).toBeInTheDocument()
    expect(screen.getByText('Expert Guides')).toBeInTheDocument()
  })

  it('contains correct links to modules', () => {
    render(<DiscoveryHub />)

    expect(screen.getByRole('link', { name: /course platforms/i })).toHaveAttribute('href', '/compare')
    expect(screen.getByRole('link', { name: /ai creation tools/i })).toHaveAttribute('href', '/tools')
    expect(screen.getByRole('link', { name: /expert guides/i })).toHaveAttribute('href', '/blog')
  })
})
