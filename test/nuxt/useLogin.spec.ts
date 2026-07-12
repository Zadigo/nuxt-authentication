// @vitest-environment nuxt

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { useLogin } from '../../src/runtime/composables'
import type { NavigationFailure } from 'vue-router'

vi.stubGlobal('$fetch', vi.fn(async (url: string, _options?: Record<string, unknown>) => {
  if (url === '/api/auth/login') {
    return {
      success: true
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
        ...config.public,
        nuxtAuthentication: {
          domain: 'http://test-domain',
          loginRedirectPath: '/login',
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

const mockRouterPush = vi.fn<(_path: string) => Promise<NavigationFailure | void | undefined>>().mockImplementation(async (_to: string) => {
  return Promise.resolve(undefined)
})

mockNuxtImport<() => ReturnType<typeof import('vue-router').useRouter>>('useRouter', (original) => {
  return () => {
    const config = original()
    return {
      ...config,
      push: mockRouterPush
    }
  }
})

describe('useLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('composable structure', async () => {
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
    expect(result?.login).toBeDefined()
    expect(result?.login).toBeTypeOf('function')

    expect(result?.canBeSubmitted.value).toEqual(false)
    expect(result?.failureCount.value).toEqual(0)
    expect(result?.password.value).toEqual('')
  })

  it('should have canBeSubmitted true when username and password are set', async () => {
    let result: ReturnType<typeof useLogin> | undefined

    await mountSuspended(defineComponent({
      setup() {
        result = useLogin('email', undefined, '/login')
        return () => null
      }
    }))

    expect(result?.canBeSubmitted).toBeDefined()
    
    result!.usernameField.value = 'testuser'
    result!.password.value = 'testpassword'

    expect(result?.canBeSubmitted.value).toEqual(true)
  })

  it('should be able to login', async () => {
    let result: ReturnType<typeof useLogin> | undefined

    await mountSuspended(defineComponent({
      setup() {
        result = useLogin('email', undefined, '/login')
        return () => null
      }
    }))

    expect(result?.login).toBeDefined()
    
    // Call the login function and check if the failureCount is reset to 0 after successful login
    await result?.login()
    expect(result?.failureCount.value).toEqual(0)

    // Check if the isAuthenticated state is set to true after successful login
    const isAuthenticated = useState<boolean>('isAuthenticated')
    expect(isAuthenticated.value).toEqual(true)

    // Reset the username and password fields after successful login
    expect(result?.usernameField.value).toEqual('')
    expect(result?.password.value).toEqual('')

    // Check if the router push was called with the correct redirect path
    expect(mockRouterPush).toHaveBeenCalledWith('/login')
  })

  it('should fail to login and increment failureCount', async () => {
    let result: ReturnType<typeof useLogin> | undefined

    // Mock $fetch to simulate a failed login
    vi.stubGlobal('$fetch', vi.fn(async (url: string, _options?: Record<string, unknown>) => {
      if (url === '/api/auth/login') {
        return {
          success: false
        }
      }
      return {}
    }))

    await mountSuspended(defineComponent({
      setup() {
        result = useLogin('email', undefined, '/login')
        return () => null
      }
    }))

    expect(result?.login).toBeDefined()
    
    // Call the login function and check if the failureCount is incremented after failed login
    await result?.login()
    expect(result?.failureCount.value).toEqual(1)

    // TODO: Check if the isAuthenticated state is still false after failed login
    // const isAuthenticated = useState<boolean>('isAuthenticated')
    // expect(isAuthenticated.value).toEqual(false)
  })

  it('should fail on $fetch error and increment failureCount', async () => {
    let result: ReturnType<typeof useLogin> | undefined

    // Mock $fetch to simulate an error during login
    vi.stubGlobal('$fetch', vi.fn(async (url: string, _options?: Record<string, unknown>) => {
      if (url === '/api/auth/login') {
        throw new Error('Network error')
      }
      return {}
    }))

    await mountSuspended(defineComponent({
      setup() {
        result = useLogin('email', undefined, '/login')
        return () => null
      }
    }))

    expect(result?.login).toBeDefined()
    
    // Call the login function and check if the failureCount is incremented after $fetch error
    await result?.login()
    expect(result?.failureCount.value).toEqual(1)
  })
})
