import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Footer from '@/components/layout/footer'
import React from 'react'

vi.mock('@/app/actions/subscriptions', () => ({
  subscribeAction: vi.fn()
}))

vi.mock('@/components/logo', () => ({
  Logo: ({ siteName }: any) => <div>{siteName} Logo</div>
}))

describe('Footer component', () => {
  const mockContent = {
    'footer.tagline': 'Test tagline',
    'footer.navLinks.navigate': JSON.stringify([{ label: 'Home', href: '/' }]),
    'footer.navLinks.company': JSON.stringify([{ label: 'About', href: '/about' }]),
  }

  it('renders site name and tagline', () => {
    render(<Footer content={mockContent} siteName="Comparlify" />)
    expect(screen.getByText('Comparlify Logo')).toBeInTheDocument()
    expect(screen.getByText('Test tagline')).toBeInTheDocument()
  })

  it('renders navigation links', () => {
    render(<Footer content={mockContent} siteName="Comparlify" />)
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('About')).toBeInTheDocument()
  })

  it('renders newsletter section', () => {
    render(<Footer content={mockContent} siteName="Comparlify" />)
    expect(screen.getByPlaceholderText(/enter your email/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /join/i })).toBeInTheDocument()
  })
})
