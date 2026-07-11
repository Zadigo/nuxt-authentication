import { defineEventHandler, useRuntimeConfig } from '#imports'
import { getCookie } from 'h3'

export interface JWTResponseData {
  /**
   * User ID of the authenticated user
   */
  user_id: number
}

export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event)
  const access = getCookie(event, config.public.nuxtAuthentication.accessTokenName || 'access')
  return { status: !!access }
})
