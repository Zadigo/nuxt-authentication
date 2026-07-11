import { computed, createError, isDefined, ref, useCookie, useNuxtApp, useRouter, useRuntimeConfig, useState, preloadRouteComponents } from '#imports'
import { createGlobalState, useCounter, useThrottleFn, useToggle, computedAsync, useCached } from '@vueuse/core'
import type { NitroFetchOptions, NitroFetchRequest } from 'nitropack/types'
import type { LoginApiResponse, SsrLoginApiResponse, SsrMeApiResponse } from '../types'

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

  // If the verification fails, for future requests
  // we will skip the verification until the next token change
  const skipVerification = ref<boolean>(false)

  async function verify(verificationKey?: string, verificationValue?: string) {
    if (hasToken.value && !skipVerification.value) {
      try {
        const response = await $fetch<LoginApiResponse>('/api/auth/verify')

        // The verificationKey and verificationValue are used to get the
        // from the response that indicates whether the token not valid.
        // e.g. { detail: 'Token is invalid or expired' } which can then
        // determine verificationKey = 'detail' and verificationValue = 'Token is invalid or expired'
        if (isDefined(verificationKey) && isDefined(verificationValue)) {
          const value = response.detail

          if (isDefined(value) && value === verificationValue) {
            await useLogout()

            switch (config.strategy) {
              case 'login':
                const router = useRouter()
                await router.push(config.login || '/login')
                break
              case 'renew':
                const { renew } = await useRefreshAccessToken()
                await renew()
                break
              default:
                throw createError({
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
export function useLogin<T extends SsrLoginApiResponse>(usernameFieldName: 'email' | 'username' = 'email', throttle: number = 3000, redirectPath?: string) {
  const { count, inc: incrementFailureCount } = useCounter()

  const usernameField = ref<string>('')
  const password = ref<string>('')

  const config = useRuntimeConfig().public.nuxtAuthentication

  if (config.loginRedirectPath && import.meta.client) {
    void preloadRouteComponents(config.loginRedirectPath)
  }

  async function login(callback?: (data: T) => void) {
    try {
      const data = await $fetch<T>('/api/auth/login', {
        method: 'POST',
        body: {
          [`${usernameFieldName}`]: usernameField.value,
          password: password.value
        }
      })

      if (!data.success) {
        incrementFailureCount()
        return
      }

      useState<boolean>('isAuthenticated').value = true

      callback?.(data)

      usernameField.value = ''
      password.value = ''

      if (config.loginRedirectPath) {
        const router = useRouter()
        void router.push(redirectPath || config.loginRedirectPath)
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
  const config = useRuntimeConfig().public.nuxtAuthentication

  void $fetch('/api/auth/logout')

  if (config.loginRedirectPath) {
    const router = useRouter()
    await router.push(redirectPath || config.loginRedirectPath)
  }
}

/**
 * Composable used to check if the user is logged in
 */
export function useUser<P>() {
  const isAuthenticated = useState('isAuthenticated')

  const _userData = computedAsync(async () => {
    const response = await $fetch<SsrMeApiResponse>('/api/auth/me', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
    return response
  })

  const userData = useCached(_userData, (newData, cachedData) => {
    return newData?.user_id === cachedData?.user_id
  })

  const userId = computed(() => userData.value?.user_id || null)

  function getProfile(path: NitroFetchRequest, body: Record<string, unknown> | null | undefined = null, method: 'GET' | 'POST' = 'GET') {
    const { $nuxtAuthentication } = useNuxtApp()
    return $nuxtAuthentication<P>(path, {
      method,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body
    })
  }

  return {
    /**
     * Access token of the user
     * @default null
     */
    // accessToken: shallowReadonly(accessToken),
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
 * @description You are responsible for setting the new
 * access token in the cookie after calling this function
 *
 * @param throttle - Throttle time in milliseconds which limits how often the token can be refreshed
 */
export async function useRefreshAccessToken(throttle: number = 5000) {
  async function renew() {
    return await $fetch<{ status: boolean }>('/api/auth/renew')
  }

  return {
    /**
     * Function used to renew the access token
     */
    renew: useThrottleFn(renew, throttle),
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
    if (!accessToken.value) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required'
      })
    }
    
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
