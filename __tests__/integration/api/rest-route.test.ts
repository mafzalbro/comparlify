import { describe, it, expect, vi } from 'vitest'
import { GET } from '@/app/api/rest/route'
import { isAuthorized } from '@/lib/api-auth'
import { NextResponse } from 'next/server'

vi.mock('@/lib/api-auth', () => ({
  isAuthorized: vi.fn()
}))

describe('REST API root route', () => {
  it('returns 401 if unauthorized', async () => {
    (isAuthorized as any).mockReturnValue(false)
    const req = new Request('http://localhost:3000/api/rest')

    const response = await GET(req)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized access')
  })

  it('returns 200 and data if authorized', async () => {
    (isAuthorized as any).mockReturnValue(true)
    const req = new Request('http://localhost:3000/api/rest')

    const response = await GET(req)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.status).toBe('ok')
    expect(data.endpoints).toBeDefined()
  })
})
