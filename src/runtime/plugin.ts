import { defineNuxtPlugin, useCookie, useRuntimeConfig, navigateTo } from '#app'
import { refreshAccessToken } from './utils'

/**
 * Nuxt plugin to provide an authenticated fetch client
 * which can then be used in the application to make
 * secured authenticated API requests
 */
export default defineNuxtPlugin(async (nuxtApp) => {
  const access = useCookie('access')
  const refresh = useCookie('refresh')

  const config = useRuntimeConfig().public.nuxtAuthentication

  const client = $fetch.create({
    baseURL: config.domain,
    onRequest({ _request, options, _error }) {
      options.headers.set('Content-Type', 'application/json')
      if (access.value) {
        options.headers.set('Authorization', `${config.bearerTokenType} ${access.value}`)
      }
    },
    async onResponseError({ response }) {
      if (response.status === 401) {
        access.value = null

        if (refresh.value) {
          const { access: newAccess } = await refreshAccessToken(refresh.value)
          access.value = newAccess
        } else {
          refresh.value = null
          await nuxtApp.runWithContext(() => navigateTo(config.loginRedirectPath || '/'))
        }
      }
    }
  })

  return {
    provide: {
      client
    }
  }
})
