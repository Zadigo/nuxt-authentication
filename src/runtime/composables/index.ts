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

  const accessToken = useCookie(config.accessTokenName, { sameSite: 'strict', secure: true })
  const refreshToken = useCookie(config.refreshTokenName, { sameSite: 'strict', secure: true })

  async function login() {
    const data = await $fetch<T>(config.accessEndpoint, {
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

interface JWTResponseData {
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
      getProfile: async (_id: Nullable<number>) => null as Nullable<P>
    }
  }

  const accessToken = useCookie('access')
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
