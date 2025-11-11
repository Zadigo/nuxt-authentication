import { useRuntimeConfig } from '#app'
import { computed, isDefined, ref, useCookie, useMemoize, useNuxtApp, useRouter, useState } from '#imports'
import { useCounter, useThrottleFn } from '@vueuse/core'
import { useJwt } from '@vueuse/integrations/useJwt'
import type { LoginApiResponse, Nullable } from '../types'

/**
 * Function used to login the user in the frontend
 */
export function useLogin<T extends LoginApiResponse>(usernameFieldName: 'email' | 'username' = 'email', throttle: number = 3000) {
  if (import.meta.server) {
    return {
      /**
       * Login function
       */
      login: async () => { },
      /**
       * Email or username of the user
       * @default ''
       */
      usernameField: ref(''),
      /**
       * Password of the user
       * @default ''
       */
      password: ref(''),
      /**
       * Number of failed login attempts
       * @default
       */
      failureCount: ref(0),
      /**
       * Access token of the user
       */
      accessToken: ref(''),
      /**
       * Refresh token of the user
       */
      refreshToken: ref(''),
      /**
       * Whether the form can be submitted
       */
      canBeSubmitted: ref(false)
    }
  }

  const { count, inc: incrementFailureCount } = useCounter()

  const usernameField = ref<string>('')
  const password = ref<string>('')

  const config = useRuntimeConfig().public.nuxtAuthentication

  const accessToken = useCookie(config.accessTokenName || 'access', { sameSite: 'strict', secure: true })
  const refreshToken = useCookie(config.refreshTokenName || 'refresh', { sameSite: 'strict', secure: true })

  async function login(callback?: (data: T) => void) {
    const data = await $fetch<T>(config.accessEndpoint || '/api/token/access', {
      baseURL: config.domain,
      method: 'POST',
      body: {
        [`${usernameFieldName}`]: usernameField.value,
        password: password.value
      },
      onRequestError() {
        incrementFailureCount()
      }
    })

    if (data) {
      accessToken.value = data.access
      refreshToken.value = data.refresh
      useState('isAuthenticated').value = true

      callback?.(data)

      if (config.loginRedirectPath) {
        const router = useRouter()
        await router.push(config.loginRedirectPath)
      }
    }
  }

  const _login = useThrottleFn(login, throttle)

  const canBeSubmitted = computed(() => usernameField.value !== '' && password.value !== '')

  return {
    /**
     * Login function
     */
    login: _login,
    /**
     * Email or username of the user
     * @default ''
     */
    usernameField,
    /**
     * Password of the user
     * @default ''
     */
    password,
    /**
     * Number of failed login attempts
     * @default 0
     */
    failureCount: count,
    /**
     * Access token of the user
     */
    accessToken,
    /**
     * Refresh token of the user
     */
    refreshToken,
    /**
     * Whether the form can be submitted
     */
    canBeSubmitted
  }
}

/**
 * Function used to logout the user
 */
export async function useLogout() {
  if (import.meta.server) {
    return
  }

  const accessToken = useCookie('access')
  const refreshToken = useCookie('refresh')

  accessToken.value = null
  refreshToken.value = null

  useState('isAuthenticated').value = false

  const config = useRuntimeConfig().public.nuxtAuthentication

  if (config.loginRedirectPath) {
    const router = useRouter()
    await router.push(config.loginRedirectPath)
  }
}

export interface JWTResponseData {
  user_id: number
}

/**
 * Composable used to check if the user is logged in
 */
export function useUser<P>() {
  if (import.meta.server) {
    return {
      userId: computed(() => null),
      isAuthenticated: ref(false),
      getProfile: async (_path: string) => null as Nullable<P>
    }
  }

  const config = useRuntimeConfig().public.nuxtAuthentication
  const accessToken = useCookie(config.accessTokenName || 'access')
  const isAuthenticated = useState('isAuthenticated', () => isDefined(accessToken) && accessToken.value !== '')

  const userId = computed(() => {
    if (accessToken.value) {
      const result = useJwt<JWTResponseData>(accessToken.value).payload.value

      if (result) {
        const { user_id } = result
        return user_id
      }
    }
    return undefined
  })

  const getProfile = useMemoize(async (path: string) => {
    if (isDefined(path)) {
      const { $nuxtAuthentication } = useNuxtApp()
      return await $nuxtAuthentication<P>(path, { method: 'GET' })
    }
    console.warn('User ID is not defined')
  })

  return {
    userId,
    isAuthenticated,
    getProfile
  }
}

/**
 * Function used to refresh the access token
 * on the client side.
 *
 * @description You are responseble for setting the new
 * access token in the cookie after calling this function
 *
 * @param throttle - Throttle time in milliseconds whcih limits
 * how often the token can be refreshed
 */
export async function useRefreshAccessToken(throttle: number = 5000) {
  if (import.meta.server) {
    return {
      access: null
    }
  }

  const config = useRuntimeConfig().public.nuxtAuthentication
  const accessToken = useCookie(config.accessTokenName || 'access')
  const refreshToken = useCookie(config.refreshTokenName || 'refresh')

  async function _renew() {
    const response = await $fetch<TokenRefreshApiResponse>(config.refreshEndpoint || '/api/token/refresh', {
      baseURL: config.domain,
      method: 'POST',
      body: {
        refresh: refreshToken.value
      }
    })

    accessToken.value = response.access
  }

  const renew = useThrottleFn(_renew, throttle)

  return {
    /**
     * Function used to renew the access token
     */
    renew,
    /**
     * Access token of the user
     */
    accessToken
  }
}
