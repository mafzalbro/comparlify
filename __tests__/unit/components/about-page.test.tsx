import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import AboutPage from '@/app/(simple)/about/page'
import React from 'react'

// Mock the dependencies of AboutPage
vi.mock('@/lib/content', () => ({
  getContent: vi.fn().mockResolvedValue({
    'global.siteName': 'Comparlify',
    'about.hero.title': 'About Us',
    'about.hero.subtitle': 'Learn more about Comparlify',
    'about.values.title': 'Our Values',
    'about.values.subtitle': 'What we stand for',
    'about.values.clarity.title': 'Clarity',
    'about.values.clarity.description': 'We believe in clear data.',
    'about.values.community.title': 'Community',
    'about.values.community.description': 'We value our users.',
    'about.values.empowerment.title': 'Empowerment',
    'about.values.empowerment.description': 'We empower creators.',
    'about.team.members': JSON.stringify([
      { name: 'John Doe', role: 'CEO', avatar: '', dataAiHint: '' }
    ]),
    'about.story.content': 'Our story started in 2024.',
    'about.cta.title': 'Join Us',
    'about.cta.subtitle': 'Start your journey today.',
    'about.cta.button': 'Register Now',
  }),
}))

vi.mock('@/components/layout/page-hero', () => ({
  PageHero: ({ children, title, subtitle }: any) => (
    <div>
      <h1>{title}</h1>
      <h2>{subtitle}</h2>
      {children}
    </div>
  ),
}))

vi.mock('@/components/managed-image', () => ({
  ManagedImage: () => <img />,
}))

vi.mock('@/components/markdown-content', () => ({
  MarkdownContent: ({ content }: any) => <div>{content}</div>,
}))

vi.mock('@/components/motion-wrapper', () => ({
  MotionDiv: ({ children }: any) => <div>{children}</div>,
}))

vi.mock('@/components/breadcrumb', () => ({
  Breadcrumbs: () => <nav>Breadcrumbs</nav>,
}))

describe('AboutPage', () => {
  it('renders the about page with content from CMS', async () => {
    const Page = await AboutPage()
    render(Page)

    expect(screen.getByText('About Us')).toBeInTheDocument()
    expect(screen.getByText('Learn more about Comparlify')).toBeInTheDocument()
    expect(screen.getByText('Clarity')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Join Us')).toBeInTheDocument()
  })
})
