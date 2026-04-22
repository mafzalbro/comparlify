import { describe, it, expect } from 'vitest'
import { PLATFORM_DEFAULTS } from '@/lib/platforms'

describe('Platform Data Defaults', () => {
  it('contains correct data for Teachable', () => {
    const teachable = PLATFORM_DEFAULTS.teachable
    expect(teachable.name).toBe('Teachable')
    expect(teachable.tier.monthlyPrice).toBe(59)
    expect(teachable.tier.transactionFeePercent).toBe(5)
  })

  it('contains correct data for Kajabi', () => {
    const kajabi = PLATFORM_DEFAULTS.kajabi
    expect(kajabi.name).toBe('Kajabi')
    expect(kajabi.tier.monthlyPrice).toBe(149)
    expect(kajabi.tier.transactionFeePercent).toBe(0)
  })
})
