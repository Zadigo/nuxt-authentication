import { defineEventHandler, useRuntimeConfig } from '#imports'
import { setCookie } from 'h3'

export interface JWTResponseData {
  /**
   * User ID of the authenticated user
   */
  user_id: number
}

export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event)

  setCookie(event, config.public.nuxtAuthentication.accessTokenName || 'access', '')
  setCookie(event, config.public.nuxtAuthentication.refreshTokenName || 'refresh', '')
})
