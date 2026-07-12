// @vitest-environment nuxt

import { describe, expect, it, vi } from 'vitest'
import { useLogin } from '../../src/runtime/composables/index'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'

vi.stubGlobal('$fetch', vi.fn(async (url: string, _options?: Record<string, unknown>) => {
  if (url === '/api/token/access') {
    return {
      access_token: 'google',
      refresh_token: 'google'
    }
  }
  return {}
}))

mockNuxtImport('useRuntimeConfig', (original) => {
  const config = original()

  return () => {
    return {
      ...config(),
      public: {
        ...config().public,
        nuxtAuthentication: {
          loginRedirectPath: '/login'
        }
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

mockNuxtImport('useRouter', (original) => {
  const config = original()

  return () => {
    return {
      ...config(),
    }
  }
})

describe('useLogin', () => {
  it('should be defined', async () => {
    let result: ReturnType<typeof useLogin> | undefined

    // Mount a component to ensure the Nuxt context
    // is available for useLogin<
    await mountSuspended(defineComponent({
      setup() {
        result = useLogin('email', undefined, '/login')
        return () => null
      }
    }))
   
    
    expect(result).toBeDefined()

    expect(result?.canBeSubmitted).toBeDefined()
    expect(result?.failureCount).toBeDefined()
    expect(result?.password).toBeDefined()

    expect(result?.canBeSubmitted.value).toEqual(false)
    expect(result?.failureCount.value).toEqual(0)
    expect(result?.password.value).toEqual('')
  })

  // it('should be able to login', async () => {
  //   const { login } = useLogin('email', undefined, '/login')
    
  //   void login(loginSpy)

  //   expect(loginSpy).toHaveBeenCalled()
  // })
})
