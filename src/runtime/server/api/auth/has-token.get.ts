import { defineEventHandler, useRuntimeConfig } from '#imports'
import { getCookie } from 'h3'

export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event)
  const access = getCookie(event, config.public.nuxtAuthentication.accessTokenName || 'access')
  return { status: !!access }
})
