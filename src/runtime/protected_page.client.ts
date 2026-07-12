import { defineNuxtRouteMiddleware, navigateTo, useRuntimeConfig, useState } from "#app"

export default defineNuxtRouteMiddleware((to, _from) => {
  const config = useRuntimeConfig()
  if (config.public.nuxtAuthentication.enabled) {
    const routes = config.public.nuxtAuthentication.protectedRoutes?.map(route => route.route) || []

    if (routes.includes(to.path)) {
      const isAuthenticated = useState<boolean>('isAuthenticated')
      
      if (!isAuthenticated.value) {
        return navigateTo(config.public.nuxtAuthentication.loginRedirectPath || '/')
      }
    }
  }
})
