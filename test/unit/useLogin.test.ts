import { describe, expect, it, vi } from 'vitest'
import { useLogin } from '../../src/runtime/composables/index'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

const loginSpy = vi.fn<() => string>(() => "google")

vi.stubGlobal('$fetch', vi.fn(async (url: string, _options?: Record<string, unknown>) => {
  if (url === '/api/token/access') {
    return {
      access_token: 'google',
      refresh_token: 'google'
    }
  }
  return {}
}))

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

mockNuxtImport('useRouter', () => {
  return () => ({
    afterEach: vi.fn<() => void>(),
    push: vi.fn<() => void>(),
    replace: vi.fn<() => void>(),
    currentRoute: { value: {} }
  })
})

describe('useLogin', () => {
  it('should be defined', () => {
    const { accessToken, refreshToken, canBeSubmitted, failureCount, password } = useLogin('email', undefined, '/login')

    expect(accessToken).toBeDefined()
    expect(refreshToken).toBeDefined()
    expect(canBeSubmitted).toBeDefined()
    expect(failureCount).toBeDefined()
    expect(password).toBeDefined()

    expect(accessToken.value).toEqual('')
    expect(refreshToken.value).toEqual('')
    expect(canBeSubmitted.value).toEqual(false)
    expect(failureCount.value).toEqual(0)
    expect(password.value).toEqual('')
  })

  it('should be able to login', async () => {
    const { login, accessToken, refreshToken } = useLogin('email', undefined, '/login')
    
    void login(loginSpy)

    expect(loginSpy).toHaveBeenCalled()
    expect(accessToken.value).toEqual('google')
    expect(refreshToken.value).toEqual('google')
  })
})
