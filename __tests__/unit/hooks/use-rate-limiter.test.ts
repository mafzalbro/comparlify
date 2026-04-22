import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useRateLimiter } from '@/hooks/use-rate-limiter'

describe('useRateLimiter hook', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('allows queries initially', () => {
    const { result } = renderHook(() => useRateLimiter({ limit: 2, window: 1000 }))
    expect(result.current.isAllowed()).toBe(true)
  })

  it('limits queries based on the limit', () => {
    const { result } = renderHook(() => useRateLimiter({ limit: 2, window: 1000 }))

    act(() => {
      result.current.recordQuery()
    })
    expect(result.current.isAllowed()).toBe(true)

    act(() => {
      result.current.recordQuery()
    })
    expect(result.current.isAllowed()).toBe(false)
  })

  it('allows queries after the time window passes', () => {
    const { result } = renderHook(() => useRateLimiter({ limit: 1, window: 1000 }))

    act(() => {
      result.current.recordQuery()
    })
    expect(result.current.isAllowed()).toBe(false)

    act(() => {
      vi.advanceTimersByTime(1001)
    })

    expect(result.current.isAllowed()).toBe(true)
  })

  it('calculates timeUntilNextQuery correctly', () => {
    const { result } = renderHook(() => useRateLimiter({ limit: 1, window: 1000 }))

    expect(result.current.timeUntilNextQuery()).toBe(0)

    act(() => {
      result.current.recordQuery()
    })

    expect(result.current.timeUntilNextQuery()).toBeGreaterThan(0)
    expect(result.current.timeUntilNextQuery()).toBeLessThanOrEqual(1000)

    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(result.current.timeUntilNextQuery()).toBeCloseTo(500, -1)
  })
})
