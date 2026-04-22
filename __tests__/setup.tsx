import '@testing-library/jest-dom'
import { vi } from 'vitest'
import React from 'react'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    length: 0,
    key: (index: number) => Object.keys(store)[index] || null,
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => ({
    get: vi.fn(),
    forEach: vi.fn(),
    entries: vi.fn(() => []),
    toString: vi.fn(() => ''),
  }),
}))

// Mock Next-Auth
vi.mock('next-auth/react', () => ({
  useSession: () => ({
    data: null,
    status: 'unauthenticated',
  }),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
  signIn: vi.fn(),
  signOut: vi.fn(),
}))

// Mock Framer Motion to avoid animation issues in tests
vi.mock('framer-motion', () => {
  const MockComponent = React.forwardRef(({ children, whileInView, whileHover, viewport, transition, initial, animate, ...props }: any, ref: any) => (
    <div {...props} ref={ref}>{children}</div>
  ))
  return {
    motion: {
      div: MockComponent,
      section: MockComponent,
      h1: MockComponent,
      p: MockComponent,
      span: MockComponent,
      button: MockComponent,
    },
    AnimatePresence: ({ children }: any) => children,
  }
})
