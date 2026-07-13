import { createError, defineNuxtPlugin, navigateTo, useRequestHeaders, useRuntimeConfig } from '#imports'

/**
 * Nuxt plugin to provide an authenticated fetch client
 * which can then be used in the application to make
 * secured authenticated API requests
 */
export default defineNuxtPlugin((nuxtApp) => {
  // const config = useRuntimeConfig()

  const authenticatedFetch = $fetch.create({
    baseURL: '/api/proxy',
    // onRequest({ options }) {
    //   if (import.meta.server) {
    //     const headers = useRequestHeaders([ 'cookie' ])
    //     const h = new Headers(options.headers as HeadersInit)

    //     if (headers.cookie) h.set('cookie', headers.cookie)
    //     options.headers = h
    //     console.log('H', h)
    //   }
    // },
    // async onResponseError({ response }) {
    //   if (response.status === 401) {
    //     switch(config.public.nuxtAuthentication.strategy) {
    //       case 'renew':
    //         await $fetch('/api/auth/renew', { method: 'POST' })
    //         break
    //       case 'login':
    //         nuxtApp.runWithContext(() => navigateTo(config.loginRedirectPath || '/'))
    //         break
    //       case 'do_nothing':
    //         // Do nothing, let the caller handle the 401
    //         break
    //       case 'fail':
    //         throw createError({
    //           statusCode: 401,
    //           statusMessage: 'Authentication failed. Please log in again.'
    //         })
    //     }
    //   }
    // }
  })

  return {
    provide: {
      authenticatedFetch
    }
  }
})
