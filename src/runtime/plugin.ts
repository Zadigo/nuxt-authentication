import { defineNuxtPlugin, useCookie, useRuntimeConfig, navigateTo, createError } from '#app'
import type { LoginApiResponse } from './types'
import { refreshAccessToken } from './utils'

/**
 * Nuxt plugin to provide an authenticated fetch client
 * which can then be used in the application to make
 * secured authenticated API requests
 */
export default defineNuxtPlugin(async (nuxtApp) => {
  const config = useRuntimeConfig().public.nuxtAuthentication

  const access = useCookie(config.accessTokenName || 'access')
  const refresh = useCookie(config.refreshTokenName || 'refresh')

  const nuxtAuthentication = $fetch.create<LoginApiResponse>({
    baseURL: config.domain,
    onRequest({ options }) {
      options.headers.set('Content-Type', 'application/json')

      if (access.value) {
        options.headers.set('Authorization', `${config.bearerTokenType || 'Token'} ${access.value}`)
      }
    },
    async onResponseError({ response }) {
      if (response.status === 401) {
        access.value = null

        if (config.strategy === 'renew' && refresh.value) {
          const { access: newAccess } = await refreshAccessToken(refresh.value)
          access.value = newAccess
        } else if (config.strategy === 'fail') {
          createError({
            statusCode: 401,
            statusMessage: 'Authentication failed. Please log in again.'
          })
        } else {
          refresh.value = null
          await nuxtApp.runWithContext(() => navigateTo(config.loginRedirectPath || '/'))
        }
      }
    }
  })

  return {
    provide: {
      /**
       * Authenticated fetch client
       */
      nuxtAuthentication
    }
  }
})
