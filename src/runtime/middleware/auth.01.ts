import { defineNuxtRouteMiddleware, useRuntimeConfig, navigateTo, createError } from '#app'
import { useUser } from '../composables'
import { refreshAccessTokenClient } from '../utils'

export default defineNuxtRouteMiddleware(async (_to, _from) => {
  const config = useRuntimeConfig()

  if (config.public.nuxtAuthentication.enabled) {
    const user = useUser()

    if (!user.isAuthenticated && config.public.nuxtAuthentication.enabled) {
      if (config.public.nuxtAuthentication.strategy === 'renew') {
        try {
          await refreshAccessTokenClient()
          return
        } catch {
          // Ignore error and redirect to login
        }
      } else if (config.public.nuxtAuthentication.strategy === 'login') {
        return navigateTo(config.public.nuxtAuthentication.login)
      } else if (config.public.nuxtAuthentication.strategy === 'fail') {
        return createError({
          statusCode: 401,
          statusMessage: 'Authentication required'
        })
      }
    }
  }
})
