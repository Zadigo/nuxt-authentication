import { useRuntimeConfig } from '#app'
import { computed, isDefined, ref, useCookie, useMemoize, useNuxtApp, useState } from '#imports'
import { useJwt } from '@vueuse/integrations/useJwt'
import type { Nullable } from '../types'

export interface LoginApiResponse {
  access: string
  refresh: string
}

export type TokenRefreshApiResponse = Pick<LoginApiResponse, 'access'>

/**
 * Helper function used to ask for a new access
 * token for the user
 * @param refresh - Refresh token of the user
 */
export async function refreshAccessToken<T extends TokenRefreshApiResponse>(refresh: string) {
  const response = await $fetch<T>('/auth/v1/token/refresh/', {
    baseURL: useRuntimeConfig().public.nuxtAuthentication.refreshEndpoint,
    method: 'POST',
    body: {
      refresh
    }
  })

  return {
    access: response.access
  }
}

/**
 * Function used to refresh the access token
 * on the client side
 */
export async function refreshAccessTokenClient<T extends TokenRefreshApiResponse>() {
  if (import.meta.server) {
    return {
      access: null
    }
  }

  const refreshToken = useCookie('refresh')

  if (isDefined(refreshToken)) {
    const response = await refreshAccessToken<T>(refreshToken.value)

    if (response.access) {
      useCookie('access').value = response.access
    }

    return response
  }

  return { access: null }
}

/**
 * Function used to login the user in the frontend
 */
export function useLogin<T extends LoginApiResponse>(usernameFieldName: 'email' | 'username' = 'email') {
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

  const failureCount = ref(0)

  const usernameField = ref<string>('')
  const password = ref<string>('')

  const accessToken = useCookie('access', { sameSite: 'strict', secure: true })
  const refreshToken = useCookie('refresh', { sameSite: 'strict', secure: true })

  const config = useRuntimeConfig().public.nuxtAuthentication

  async function login() {
    const data = await $fetch<T>(config.accessEndpoint, {
      baseURL: config.domain,
      method: 'POST',
      body: {
        [`$${usernameFieldName}`]: usernameField.value,
        password: password.value
      },
      onRequestError() {
        failureCount.value += 1
      }
    })

    if (data) {
      accessToken.value = data.access
      refreshToken.value = data.refresh
      useState('isAuthenticated').value = true
    }
  }

  const canBeSubmitted = computed(() => usernameField.value !== '' && password.value !== '')

  return {
    /**
     * Login function
     */
    login,
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
    failureCount,
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

  // router.push('/')
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

  const getProfile = useMemoize(async (id: Nullable<number>) => {
    if (isDefined(id)) {
      const { $client } = useNuxtApp()

      const data = await $client<P>(`/api/v1/accounts/${id}`, {
        method: 'GET'
      })
      return data
    }
    console.warn('User ID is not defined')
  })

  return {
    userId,
    isAuthenticated,
    getProfile
  }
}
