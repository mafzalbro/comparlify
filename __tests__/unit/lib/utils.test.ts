import { describe, it, expect } from 'vitest'
import { cn, createQueryString } from '@/lib/utils'

describe('cn utility', () => {
  it('merges class names correctly', () => {
    expect(cn('a', 'b')).toBe('a b')
    expect(cn('a', { b: true, c: false })).toBe('a b')
    expect(cn('px-2 py-2', 'p-4')).toBe('p-4') // tailwind-merge in action
  })
})

describe('createQueryString utility', () => {
  it('creates a query string from params', () => {
    const current = new URLSearchParams('a=1')
    const result = createQueryString({ b: 2 }, current)
    expect(result).toBe('a=1&b=2')
  })

  it('updates existing params', () => {
    const current = new URLSearchParams('a=1')
    const result = createQueryString({ a: 2 }, current)
    expect(result).toBe('a=2')
  })

  it('removes null or empty params', () => {
    const current = new URLSearchParams('a=1&b=2')
    const result = createQueryString({ a: null, b: '' }, current)
    expect(result).toBe('')
  })

  it('handles arrays', () => {
    const current = new URLSearchParams()
    const result = createQueryString({ tags: ['a', 'b'] }, current)
    expect(result).toBe('tags=a&tags=b')
  })
})
