import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useLocalStorage } from '@/hooks/use-local-storage'

describe('useLocalStorage hook', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.clearAllMocks()
  })

  it('returns initial value when no value in localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'))
    expect(result.current[0]).toBe('default')
  })

  it('returns stored value from localStorage', () => {
    window.localStorage.setItem('test-key', JSON.stringify('stored'))
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'))
    expect(result.current[0]).toBe('stored')
  })

  it('updates localStorage when setValue is called', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'))

    act(() => {
      result.current[1]('new-value')
    })

    expect(result.current[0]).toBe('new-value')
    expect(JSON.parse(window.localStorage.getItem('test-key') || '')).toBe('new-value')
  })

  it('handles functional updates', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 1))

    act(() => {
      result.current[1]((prev: number) => prev + 1)
    })

    expect(result.current[0]).toBe(2)
    expect(JSON.parse(window.localStorage.getItem('test-key') || '')).toBe(2)
  })

  it('handles errors gracefully', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    window.localStorage.setItem('test-key', 'invalid-json')

    const { result } = renderHook(() => useLocalStorage('test-key', 'default'))

    expect(result.current[0]).toBe('default')
    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })
})
