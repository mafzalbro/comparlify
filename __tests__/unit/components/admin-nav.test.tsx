import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { AdminNav } from '@/app/admin/_components/admin-nav'
import { usePathname } from 'next/navigation'

vi.mock('next/navigation', () => ({
  usePathname: vi.fn()
}))

// Mock Sidebar components
vi.mock('@/components/ui/sidebar', () => ({
  SidebarMenu: ({ children }: any) => <div>{children}</div>,
  SidebarMenuItem: ({ children }: any) => <div>{children}</div>,
  SidebarMenuButton: ({ children }: any) => <div>{children}</div>,
  SidebarGroup: ({ children }: any) => <div>{children}</div>,
  SidebarGroupLabel: ({ children }: any) => <div>{children}</div>,
}))

describe('AdminNav component', () => {
  it('renders nothing if no userRole', () => {
    const { container } = render(<AdminNav userRole={null as any} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('filters navigation items based on user role', () => {
    (usePathname as any).mockReturnValue('/admin')

    // Test with AUTHOR role (should see Blog but not Users)
    render(<AdminNav userRole="AUTHOR" />)

    expect(screen.getByText(/blog/i)).toBeInTheDocument()
    expect(screen.queryByText(/users/i)).not.toBeInTheDocument()
  })

  it('renders all items for ADMIN', () => {
    (usePathname as any).mockReturnValue('/admin')
    render(<AdminNav userRole="ADMIN" />)

    expect(screen.getByText(/users/i)).toBeInTheDocument()
    expect(screen.getByText(/settings/i)).toBeInTheDocument()
  })
})
