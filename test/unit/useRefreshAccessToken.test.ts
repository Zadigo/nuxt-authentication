import { describe, expect, it, vi } from 'vitest'
import { useRefreshAccessToken } from '../../src/runtime/composables'
import { useState } from '#imports'


describe('useRefreshAccessToken', () => {
  it('composable structure', async () => {
    const { renew } = await useRefreshAccessToken()

    expect(renew).toBeDefined()
    expect(renew).toBeTypeOf('function')
  })

  it('should call the renew function and update isAuthenticated state', async () => {
    vi.stubGlobal('$fetch', vi.fn(async (url: string, _options?: Record<string, unknown>) => {
      if (url === '/api/auth/renew') {
        return {
          status: true
        }
      }
      return {}
    }))

    const { renew } = await useRefreshAccessToken()
    await renew()

    const isAuthenticatedState = useState<boolean>('isAuthenticated')
    expect(isAuthenticatedState.value).toBe(true)

    expect($fetch).toHaveBeenCalledWith('/api/auth/renew', { method: 'POST' })
  })
})
