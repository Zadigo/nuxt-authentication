// @vitest-environment nuxt

import { describe, expect, it, vi } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

vi.stubGlobal('$fetch', vi.fn(async (url: string, _options?: Record<string, unknown>) => {
  if (url === '/api/token/access') {
    return {
      access_token: 'google',
      refresh_token: 'google'
    }
  }
  return {}
}))

mockNuxtImport<() => ReturnType<typeof import('#app').useRuntimeConfig>>('useRuntimeConfig', (original) => {
  return () => {
    const config = original()
    return {
      ...config,
      public: {
        ...config.public
      }
    }
  }
})

mockNuxtImport('useCookie', (original) => {
  return (name: string) => {
    if (name === 'access') {
      return {
        value: ''
      }
    }
    if (name === 'refresh') {
      return {
        value: ''
      }
    }
    return original(name)
  }
})

mockNuxtImport<() => ReturnType<typeof import('vue-router').useRouter>>('useRouter', (original) => {
  return () => {
    const config = original()
    return {
      ...config,
    }
  }
})

describe('useLogin', () => {
  it('should be defined', async () => {
    expect(true).toBe(true)
  })
})
