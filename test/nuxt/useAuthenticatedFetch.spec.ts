import { afterEach, describe, expect, it, vi } from 'vitest'
import { useNuxtAuthentication } from '../../src/runtime/composables/index'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

mockNuxtImport<() => ReturnType<typeof import('#app').useRuntimeConfig>>('useRuntimeConfig', (original) => {
  return () => {
    const config = original()

    return {
      ...config,
      public: {
        ...config.public,
        nuxtAuthentication: {
          domain: 'http://test-domain',
          loginRedirectPath: '/login',
          strategy: 'login'
        }
      }
    }
  }
})

describe('useNuxtAuthentication', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('composable structure', () => {
    const result = useNuxtAuthentication()

    expect(result).toHaveProperty('hasToken')
    expect(result).toHaveProperty('isAuthenticated')
    expect(result).toHaveProperty('verify')
    expect(result).toHaveProperty('tokenVerified')

    expect(result.verify).toBeInstanceOf(Function)
    expect(result.hasToken).toBeInstanceOf(Function)

    expect(result.isAuthenticated.value).toBe(false)
    expect(result.tokenVerified.value).toBe(false)
  })

  it('should verify token successfully', async () => {
    vi.stubGlobal('$fetch', vi.fn(async (url: string, _options?: Record<string, unknown>) => {
      if (url === '/api/auth/verify') {
        return {} // Django returns an empty object for a valid token
      }
      return {}
    }))

    const result = useNuxtAuthentication()

    const verifyResult = await result.verify('Token is invalid or expired')
    expect(verifyResult).toEqual({})
    expect(result.tokenVerified.value).toBe(true)
  })

  it('should fail verification on $fetch error', async () => {
    vi.stubGlobal('$fetch', vi.fn(async (url: string, _options?: Record<string, unknown>) => {
      if (url === '/api/auth/verify') {
        const error = new Error('Network error') as Error & { statusCode?: number, data?: unknown }
        error.statusCode = 500
        error.data = { statusCode: 500, statusMessage: 'Network error' }
        throw error
      }
      return {}
    }))

    const result = useNuxtAuthentication()

    const verifyResult = await result.verify('Token is invalid or expired')
    expect(verifyResult).toBeUndefined()
    expect(result.isAuthenticated.value).toBe(false)
    expect(result.tokenVerified.value).toBe(false)
  })
})
