import { defineEventHandler, useRuntimeConfig } from '#imports'
import { setCookie } from 'h3'
import type { BaseSsrResponse } from '../../../types'

export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event)

  setCookie(event, config.public.nuxtAuthentication.accessTokenName || 'access', '')
  setCookie(event, config.public.nuxtAuthentication.refreshTokenName || 'refresh', '')

  return { success: true } as BaseSsrResponse
})
