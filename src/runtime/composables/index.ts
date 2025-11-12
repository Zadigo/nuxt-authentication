import { useRuntimeConfig } from '#app'
import { computed, isDefined, ref, useCookie, useMemoize, useNuxtApp, useRouter, useState } from '#imports'
import { createGlobalState, useCounter, useThrottleFn } from '@vueuse/core'
import { useJwt } from '@vueuse/integrations/useJwt'
import type { NitroFetchOptions, NitroFetchRequest } from 'nitropack/types'
import type { LoginApiResponse, Nullable, TokenRefreshApiResponse } from '../types'

// import { useInterval } from '@vueuse/core'

/**
 * Global state to manage authentication status. This composable
 * should be ideally first used in `app.vue` to initialize the state.
 * @private
 */
// params: verificationValue : What to check for in the response in order to consider the token invalid
export const useNuxtAuthentication = createGlobalState(() => {
  const config = useRuntimeConfig().public.nuxtAuthentication
  const accessToken = useCookie(config.accessTokenName || 'access')

  const hasToken = computed(() => isDefined(accessToken) && accessToken.value !== '')

  // const intervalReturnValues = {
  //   verify: {
  //     /**
  //      * Counter for the number of verification attempts
  //      * @default 0
  //      */
  //     counter: ref(0),
  //     /**
  //      * Pause the verification interval
  //      */
  //     pause: () => { },
  //     /**
  //      * Resume the verification interval
  //      */
  //     resume: () => { },
  //     /**
  //      * Whether the verification interval is active
  //      * @default false
  //      */
  //     verificationActive: ref(false)
  //   }
  // }

  if (import.meta.server) {
    return {
      /**
       * Whether the user has a token stored. This does not mean that
       * the user is authenticated
       * @default false
       */
      hasToken,
      /**
       * Whether the user is actually authenticated
       * @default false
       */
      isAuthenticated: ref(false),
      // ...intervalReturnValues
    }
  }

  // Creates a global state for isAuthenticated
  const isAuthenticated = useState<boolean>('isAuthenticated', () => false)

  /**
   * Verify
   */

  // if (config.verifyToken) {
  //   const { $nuxtAuthentication } = useNuxtApp()
  //   const { counter, pause, resume, isActive } = useInterval(config.verifyInterval, {
  //     controls: true,
  //     callback: async () => {
  //       try {
  //         const response = await $nuxtAuthentication<Record<string, string>>(config.verifyEndpoint || '/api/token/verify', {
  //           method: 'POST',
  //           body: {
  //             token: accessToken.value
  //           }
  //         })

  //         const value = response[verificationKey]

  //         if (value === verificationValue) {
  //           if (config.strategy === 'login') {
  //             const router = useRouter()
  //             await router.push(config.login || '/login')
  //           } else if (config.strategy === 'renew') {
  //             const { renew } = await useRefreshAccessToken()
  //             await renew()
  //           } else {
  //             createError()
  //           }
  //         }

  //         isAuthenticated.value = true
  //       } catch {
  //         isAuthenticated.value = false
  //       }
  //     }
  //   })

  //   intervalReturnValues.verify.counter = counter
  //   intervalReturnValues.verify.pause = pause
  //   intervalReturnValues.verify.resume = resume
  //   intervalReturnValues.verify.verificationActive = isActive

  //   watchDebounced(hasToken, (value) => {
  //     if (isActive.value && !value) {
  //       pause()
  //     } else if (!isActive.value && value) {
  //       resume()
  //     }
  //   })
  // }

  return {
    /**
     * Whether the user has a token stored. This does not mean that
     * the user is authenticated
     * @default false
     */
    hasToken,
    /**
     * Whether the user is actually authenticated
     * @default false
     */
    isAuthenticated,
    // ...intervalReturnValues
  }
})

/**
 * Function used to login the user in the frontend
 * @param usernameFieldName - The field name used for the username, either 'email' or 'username'
 * @param throttle - Throttle time in milliseconds which limits how often the login function can be called
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
      useState<boolean>('isAuthenticated').value = true

      callback?.(data)

      usernameField.value = ''
      password.value = ''

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

  const config = useRuntimeConfig().public.nuxtAuthentication

  const accessToken = useCookie(config.accessTokenName || 'access')
  const refreshToken = useCookie(config.refreshTokenName || 'refresh')

  accessToken.value = null
  refreshToken.value = null

  useState('isAuthenticated').value = false

  if (config.loginRedirectPath) {
    const router = useRouter()
    await router.push(config.loginRedirectPath)
  }
}

export interface JWTResponseData {
  /**
   * User ID of the authenticated user
   */
  user_id: number
}

/**
 * Composable used to check if the user is logged in
 */
export function useUser<P>() {
  if (import.meta.server) {
    return {
      /**
       * User ID of the authenticated user
       */
      userId: computed(() => null),
      /**
       * Whether the user is authenticated
       * @default false
       */
      isAuthenticated: ref(false),
      /**
       * Function to get the user's profile
       * @param _path - The API path to fetch the user's profile
       */
      getProfile: async (_path: NitroFetchRequest) => null as Nullable<P>
    }
  }

  const config = useRuntimeConfig().public.nuxtAuthentication
  const accessToken = useCookie(config.accessTokenName || 'access')
  const isAuthenticated = useState('isAuthenticated', () => false)

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

  const getProfile = useMemoize(async (path: NitroFetchRequest) => {
    if (isDefined(path)) {
      const { $nuxtAuthentication } = useNuxtApp()
      return await $nuxtAuthentication<P>(path, { method: 'GET' })
    }
    console.warn('User ID is not defined')
  })

  return {
    /**
     * User ID of the authenticated user
     */
    userId,
    /**
     * Whether the user is authenticated
     * @default false
     */
    isAuthenticated,
    /**
     * Function to get the user's profile
     * @param path - The API path to fetch the user's profile
     */
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
      /**
       * Function used to renew the access token
       */
      renew: async () => { },
      /**
       * Access token of the user
       */
      accessToken: null,
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

/**
 * Composable used to perform authenticated fetch requests
 * @param request The request URL or NitroFetchRequest object
 * @param options Options for the fetch request
 */
export function useAuthenticatedFetch<T>(request: NitroFetchRequest, options?: NitroFetchOptions<NitroFetchRequest, 'get' | 'head' | 'patch' | 'post' | 'put' | 'delete' | 'connect' | 'options' | 'trace'>) {
  if (import.meta.server) {
    return {
      execute: async () => { }
    }
  }

  const config = useRuntimeConfig().public.nuxtAuthentication
  const accessToken = useCookie(config.accessTokenName || 'access')

  async function _fetch() {
    return await $fetch<T>(request, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${config.bearerTokenType || 'Token'} ${accessToken.value}`,
      }
    })
  }

  return {
    execute: _fetch
  }
}
