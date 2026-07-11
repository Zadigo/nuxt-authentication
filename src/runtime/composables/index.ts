import { computed, createError, isDefined, ref, shallowReadonly, useCookie, useNuxtApp, useRouter, useRuntimeConfig, useState, preloadRouteComponents } from '#imports'
import { createGlobalState, useCounter, useThrottleFn, useToggle, computedAsync } from '@vueuse/core'
import { useJwt } from '@vueuse/integrations/useJwt'
import { refreshAccessToken } from '../utils/index'
import type { NitroFetchOptions, NitroFetchRequest } from 'nitropack/types'
import type { LoginApiResponse } from '../types'

/**
 * Global state to manage authentication status. This composable
 * should be ideally first used in `app.vue` to initialize the state.
 */
export const useNuxtAuthentication = createGlobalState(() => {
  const config = useRuntimeConfig().public.nuxtAuthentication
  const accessToken = useCookie(config.accessTokenName || 'access')

  const hasToken = computed(() => isDefined(accessToken) && accessToken.value !== '')

  // Creates a global state for isAuthenticated
  const isAuthenticated = useState<boolean>('isAuthenticated', () => false)

  /**
   * Verification
   */

  const [tokenVerified, toggleTokenVerified] = useToggle(false)
  const { $nuxtAuthentication } = useNuxtApp()

  // If the verification fails, for future requests
  // we will skip the verification until the next token change
  const skipVerification = ref<boolean>(false)

  async function verify(verificationKey?: string, verificationValue?: string) {
    if (hasToken.value && !skipVerification.value) {
      try {
        const response = await $nuxtAuthentication<Record<string, string>>(config.verifyEndpoint || '/api/token/verify', {
          method: 'POST',
          body: { token: accessToken.value },
          onRequestError() {
            skipVerification.value = true
          }
        })

        // The verificationKey and verificationValue are used to get the
        // from the response that indicates whether the token not valid.
        // e.g. { detail: 'Token is invalid or expired' } which can then
        // determine verificationKey = 'detail' and verificationValue = 'Token is invalid or expired'
        if (isDefined(verificationKey) && isDefined(verificationValue)) {
          const value = response[verificationKey]

          if (isDefined(value) && value === verificationValue) {
            await useLogout()

            if (config.strategy === 'login') {
              const router = useRouter()
              await router.push(config.login || '/login')
            } else if (config.strategy === 'renew') {
              const { renew } = await useRefreshAccessToken()
              await renew()
            } else {
              createError({
                statusCode: 401,
                statusMessage: 'Authentication required'
              })
            }
          } else {
            isAuthenticated.value = true
            toggleTokenVerified(true)
          }
        }
      } catch {
        isAuthenticated.value = false
        toggleTokenVerified(false)
      }
    }
  }

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
    /**
     * Function which can be used to verify the access token
     * when the Nuxt app or page is mounted
     * @param _verificationKey What key to check in the response to consider the token invalid
     * @param _verificationValue What to check for in the response in order to consider the token invalid
     * @example ```ts
     * // In app.vue
     * const { verify } = useNuxtAuthentication()
     * onMounted(async () => {
     *   await verify('detail', 'Token is invalid or expired')
     * })
     * ```
     */
    verify,
    /**
     * Whether the token has been verified
     * @default false
     */
    tokenVerified
    // ...intervalReturnValues
  }
})

/**
 * Function used to login the user in the frontend
 * @param usernameFieldName - The field name used for the username, either 'email' or 'username'
 * @param throttle - Throttle time in milliseconds which limits how often the login function can be called
 * @param redirectPath Custom redirect path after login that overrides the one in the config
 */
export function useLogin<T extends LoginApiResponse>(usernameFieldName: 'email' | 'username' = 'email', throttle: number = 3000, redirectPath?: string) {
  const { count, inc: incrementFailureCount } = useCounter()

  const usernameField = ref<string>('')
  const password = ref<string>('')

  const config = useRuntimeConfig().public.nuxtAuthentication

  const cookieOptions = {sameSite: 'strict', secure: true} as const
  const accessToken = useCookie(config.accessTokenName || 'access', { ...cookieOptions, maxAge: config.accessTokenMaxAge || undefined })
  const refreshToken = useCookie(config.refreshTokenName || 'refresh', { ...cookieOptions, maxAge: config.refreshTokenMaxAge || undefined })

  if (config.loginRedirectPath) {
    void preloadRouteComponents(config.loginRedirectPath)
  }

  async function login(callback?: (data: T) => void) {
    try {
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
  
      accessToken.value = data.access
      refreshToken.value = data.refresh
      useState<boolean>('isAuthenticated').value = true

      callback?.(data)

      usernameField.value = ''
      password.value = ''

      if (config.loginRedirectPath) {
        const router = useRouter()
        await router.push(redirectPath || config.loginRedirectPath)
      }
    } catch (error) {
      incrementFailureCount()
      console.error('Login failed:', error)
    }
  }

  const canBeSubmitted = computed(() => usernameField.value !== '' && password.value !== '')

  return {
    /**
     * Login function
     */
    login: useThrottleFn(login, throttle),
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
 * @param redirectPath Custom redirect path after logout that overrides the one in the config
 */
export async function useLogout(redirectPath?: string) {
  if (import.meta.server) {
    return
  }

  const config = useRuntimeConfig().public.nuxtAuthentication

  const accessToken = useCookie(config.accessTokenName || 'access')
  const refreshToken = useCookie(config.refreshTokenName || 'refresh')

  accessToken.value = null
  refreshToken.value = null

  useState<boolean>('isAuthenticated').value = false

  if (config.loginRedirectPath) {
    const router = useRouter()
    await router.push(redirectPath || config.loginRedirectPath)
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
  const config = useRuntimeConfig().public.nuxtAuthentication
  const accessToken = useCookie(config.accessTokenName || 'access')
  const isAuthenticated = useState('isAuthenticated')

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

  function getProfile(path: NitroFetchRequest, body: Record<string, unknown> | null | undefined = null, method: 'GET' | 'POST' = 'GET') {
    return computedAsync(async () => {
      const { $nuxtAuthentication } = useNuxtApp()
      return await $nuxtAuthentication<P>(path, {
        method,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body
      })
    })
  }

  return {
    /**
     * Access token of the user
     * @default null
     */
    accessToken: shallowReadonly(accessToken),
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
     * @param body - Optional body to send with the request
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
 * @param throttle - Throttle time in milliseconds whcih limits how often the token can be refreshed
 */
export async function useRefreshAccessToken(throttle: number = 5000) {
  const config = useRuntimeConfig().public.nuxtAuthentication
  const accessToken = useCookie(config.accessTokenName || 'access')
  const refreshToken = useCookie(config.refreshTokenName || 'refresh')

  async function renew() {
    const { access } = await refreshAccessToken(refreshToken.value)
    accessToken.value = access
  }

  return {
    /**
     * Function used to renew the access token
     */
    renew: useThrottleFn(renew, throttle),
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
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `${config.bearerTokenType || 'Token'} ${accessToken.value}`,
      }
    })
  }

  return {
    execute: _fetch
  }
}
