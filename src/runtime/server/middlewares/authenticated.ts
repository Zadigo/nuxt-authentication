import { defineEventHandler } from 'h3'

export default defineEventHandler((event) => {
  const cookies = parseCookies(event)
  const token = cookies.access_token
  const config = useRuntimeConfig()
  
  if (token) {
    event.context.djangoAuthHeader = `${config.public.nuxtAuthentication.bearerTokenType} ${token}`
  }
})
