import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { RecentActivity } from '@/app/admin/_components/recent-activity'

describe('RecentActivity component', () => {
  it('renders empty state message', () => {
    render(<RecentActivity activities={[]} />)
    expect(screen.getByText(/no recent activity/i)).toBeInTheDocument()
  })

  it('renders a list of activities', () => {
    const mockActivities: any[] = [
      {
        id: '1',
        type: 'USER',
        name: 'New User',
        email: 'user@example.com',
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        type: 'POST',
        title: 'New Blog Post',
        author: { name: 'Admin' },
        createdAt: new Date().toISOString(),
      }
    ]

    render(<RecentActivity activities={mockActivities} />)

    expect(screen.getByText(/new user signup/i)).toBeInTheDocument()
    expect(screen.getByText(/new post/i)).toBeInTheDocument()
    expect(screen.getByText('New Blog Post')).toBeInTheDocument()
  })
})
