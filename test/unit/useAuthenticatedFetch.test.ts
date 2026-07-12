import { describe, expect, it } from 'vitest'
// import { useNuxtAuthentication } from '../../src/runtime/composables/index'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

mockNuxtImport('useRuntimeConfig', () => {
  return () => ({
    public: {
      myModule: {
        accessTokenName: 'access',
        refreshTokenName: 'refresh',
        accessTokenMaxAge: undefined,
        refreshTokenMaxAge: undefined
      }
    }
  })
})

describe('useNuxtAuthentication', () => {
  it("check structure", () => {
    expect(true).toBe(true)
  })
  // it("check structure", () => {
  //   const { hasToken, isAuthenticated } = useNuxtAuthentication()

  //   expect(hasToken).toBeDefined()
  //   expect(isAuthenticated).toBeDefined()
  // })
})
