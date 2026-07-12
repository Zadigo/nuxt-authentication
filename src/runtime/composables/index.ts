import { computed, createError, isDefined, ref, useRouter, useRuntimeConfig, useState, preloadRouteComponents, useNuxtApp } from '#imports'
import { createGlobalState, useCounter, useThrottleFn, useToggle } from '@vueuse/core'
import type { NitroFetchOptions, NitroFetchRequest } from 'nitropack/types'
import type { LoginApiResponse, SsrApiResponse } from '../types'

/**
 * Global state to manage authentication status. This composable
 * should be ideally first used in `app.vue` to initialize the state.
 */
export const useNuxtAuthentication = createGlobalState(() => {
  // const config = useRuntimeConfig().public.nuxtAuthentication

  async function hasToken() {
    const data = await $fetch<{ status: boolean }>('/api/auth/has-token')
    return data.status
  }

  // Creates a global state for isAuthenticated
  const isAuthenticated = useState<boolean>('isAuthenticated', () => false)

  /**
   * Verification
   */

  const [tokenVerified, toggleTokenVerified] = useToggle(false)

  async function verify(verificationValue?: string): Promise<LoginApiResponse | undefined> {
    try {
      const response = await $fetch<LoginApiResponse>('/api/auth/verify')
      const value = response.detail
      
      if (!isDefined(value)) {
        toggleTokenVerified(true)
      } else {
        tokenVerified.value = value === verificationValue
      }
      return response
    } catch {
      isAuthenticated.value = false
      toggleTokenVerified(false)
      return undefined
    }
  }

  async function verifyWithSideEffects(verificationValue?: string): ReturnType<typeof verify> {
    const config = useRuntimeConfig().public.nuxtAuthentication
    const result = await verify(verificationValue)

    // The verificationKey and verificationValue are used to get the
    // from the response that indicates whether the token not valid.
    // e.g. { detail: 'Token is invalid or expired' } which can then
    // determine verificationKey = 'detail' and verificationValue = 'Token is invalid or expired'

    if (isDefined(result) && result.detail === verificationValue) {
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
    }

    return result
  }

  return {
    /**
     * Whether the user is actually authenticated
     * @default false
     */
    isAuthenticated,
    /**
     * Whether the token has been verified
     * @default false
     */
    tokenVerified,
    /**
     * Whether the user has a token stored. This does not mean that
     * the user is authenticated
     * @default false
    */
   hasToken,
   /**
    * Function which can be used to verify the access token
    * when the Nuxt app or page is mounted
    * @param verificationValue What to check for in the response in order to consider the token invalid
    * @example ```ts
    * // In app.vue
    * const { verify } = useNuxtAuthentication()
    * onMounted(async () => {
    *    await verify('Token is invalid or expired')
    * })
    * ```
    */
    verify,
    /**
     * Function which can be used to verify the access token
     * when the Nuxt app or page is mounted. If the token is invalid,
     * it will perform the necessary side effects based on the strategy
     * defined in the config.
     * @param verificationValue What to check for in the response in order to consider the token invalid
     * @example ```ts
     * // In app.vue
     * const { verifyWithSideEffects } = useNuxtAuthentication()
     * onMounted(async () => {
     *    await verifyWithSideEffects('Token is invalid or expired')
     * })
     * ```
     */
    verifyWithSideEffects
  }
})

/**
 * Function used to login the user in the frontend
 * @param usernameFieldName - The field name used for the username, either 'email' or 'username'
 * @param throttle - Throttle time in milliseconds which limits how often the login function can be called
 * @param redirectPath Custom redirect path after login that overrides the one in the config
 */
export function useLogin<T extends SsrApiResponse>(usernameFieldName: 'email' | 'username' = 'email', throttle: number = 3000, redirectPath?: string) {
  const { count, inc: incrementFailureCount } = useCounter()

  const usernameField = ref<string>('')
  const password = ref<string>('')

  const config = useRuntimeConfig().public.nuxtAuthentication

  if (config.loginRedirectPath && import.meta.client) {
    void preloadRouteComponents(config.loginRedirectPath)
  }

  const isAuthenticated = useState<boolean>('isAuthenticated')

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

      isAuthenticated.value = true

      callback?.(data)

      usernameField.value = ''
      password.value = ''

      if (config.loginRedirectPath) {
        const router = useRouter()
        void router.push(redirectPath || config.loginRedirectPath)
      }
    } catch (error) {
      incrementFailureCount()
      isAuthenticated.value = false
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
  useState<boolean>('isAuthenticated').value = false

  if (config.loginRedirectPath) {
    const router = useRouter()
    await router.push(redirectPath || config.loginRedirectPath)
  }
}

/**
 * Composable used to check if the user is logged in
 */
export function useUser() {
  const isAuthenticated = useState('isAuthenticated')

  // async function getUserId() {
  //   return await $fetch<{ user_id: string }>('/api/auth/me')
  // }

  // async function getProfile() {
  //   const data = await getUserId()
  //   return await $fetch<P>('/api/auth/profile', {
  //     query: {
  //       id: data.user_id
  //     }
  //   })
  // }

  return {
    /**
     * Whether the user is authenticated
     * @default false
     */
    isAuthenticated,
    /**
     * Function to get the user's profile
     */
    // getProfile,
    /**
     * Function to get the user's ID
     */
    // getUserId
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
    const result = await $fetch<{ status: boolean }>('/api/auth/renew')
    
    if (result.status) {
      useState<boolean>('isAuthenticated').value = true
    }
    
    return result
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
export function useAuthenticatedFetch<T extends Record<string, unknown>>(request: NitroFetchRequest, options?: NitroFetchOptions<NitroFetchRequest, 'get' | 'head' | 'patch' | 'post' | 'put' | 'delete' | 'connect' | 'options' | 'trace'>) {
  const { $authenticatedFetch } = useNuxtApp()

  const execute = async () => {
    try {
      return await $authenticatedFetch<T>(request, options)
    } catch (error: any) {
      throw createError({
        statusCode: error?.response?.status || 500,
        statusMessage: error?.response?._data?.detail || 'Authenticated fetch request failed'
      })
    }
  }  

  return {
    execute
  }
}
