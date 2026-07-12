import { describe, expect, it, vi } from 'vitest'
import { useLogout } from '../../src/runtime/composables'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

vi.stubGlobal('$fetch', vi.fn(async (url: string, _options?: Record<string, unknown>) => {
  if (url === '/api/auth/logout') {
    return {}
  }
  return {}
}))

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
        }
      }
    }
  }
})

describe('useLogout', () => {
  it('should log out the user', () => {
    void useLogout()

    expect($fetch).toHaveBeenCalledWith('/api/auth/logout')

    const isAuthenticatedState = useState<boolean>('isAuthenticated')
    expect(isAuthenticatedState.value).toBe(false)
  })
})
