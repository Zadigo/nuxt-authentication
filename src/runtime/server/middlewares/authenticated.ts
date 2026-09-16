import { defineEventHandler, parseCookies } from 'h3'
import { useRuntimeConfig } from '#imports'

export default defineEventHandler((event) => {
  const config = useRuntimeConfig()
  const cookies = parseCookies(event)
  const token = cookies[config.public.nuxtAuthentication.accessTokenName]

  if (token) {
    event.context.djangoAuthHeader = `${config.public.nuxtAuthentication.bearerTokenType} ${token}`
  }
})
