import { createError, defineNuxtPlugin, navigateTo, useRequestHeaders, useRuntimeConfig } from '#imports'

/**
 * Nuxt plugin to provide an authenticated fetch client
 * which can then be used in the application to make
 * secured authenticated API requests
 */
export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()

  const authenticatedFetch = $fetch.create({
    baseURL: '/api/proxy', // your BFF proxy layer from earlier

    onRequest({ options }) {
      if (import.meta.server) {
        // Forward the incoming request's cookies to the internal call
        const headers = useRequestHeaders([ 'cookie' ])
        options.headers = {
          ...options.headers,
          ...headers
        }
      }

      // NOTE: On the client, no action needed — the browser attaches
      // httpOnly cookies to same-origin requests automatically
    },

    async onResponseError({ response }) {
      if (response.status === 401) {
        switch(config.public.nuxtAuthentication.strategy) {
          case 'renew':
            await $fetch('/api/auth/renew')
            break
          case 'login':
            nuxtApp.runWithContext(() => navigateTo(config.loginRedirectPath || '/'))
            break
          case 'fail':
            throw createError({
              statusCode: 401,
              statusMessage: 'Authentication failed. Please log in again.'
            })
        }
      }
    }
  })

  return {
    provide: {
      authenticatedFetch
    }
  }
})
