import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { RegisterForm } from '@/app/register/_components/register-form'
import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'

vi.mock('next-auth/react', () => ({
  signIn: vi.fn()
}))

vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn()
}))

describe('RegisterForm component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useSearchParams as any).mockReturnValue({
      get: vi.fn().mockReturnValue('/')
    })
  })

  it('renders Google and GitHub sign-in buttons', () => {
    render(<RegisterForm />)
    expect(screen.getByText(/continue with google/i)).toBeInTheDocument()
    expect(screen.getByText(/continue with github/i)).toBeInTheDocument()
  })

  it('calls signIn with google when Google button is clicked', () => {
    render(<RegisterForm />)
    fireEvent.click(screen.getByText(/continue with google/i))
    expect(signIn).toHaveBeenCalledWith('google', { callbackUrl: '/' })
  })

  it('calls signIn with github when GitHub button is clicked', () => {
    render(<RegisterForm />)
    fireEvent.click(screen.getByText(/continue with github/i))
    expect(signIn).toHaveBeenCalledWith('github', { callbackUrl: '/' })
  })

  it('uses callbackUrl from searchParams', () => {
    (useSearchParams as any).mockReturnValue({
      get: vi.fn().mockReturnValue('/dashboard')
    })

    render(<RegisterForm />)
    fireEvent.click(screen.getByText(/continue with google/i))
    expect(signIn).toHaveBeenCalledWith('google', { callbackUrl: '/dashboard' })
  })
})
