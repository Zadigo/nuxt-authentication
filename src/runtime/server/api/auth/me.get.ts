import { useJwt } from '@vueuse/integrations/useJwt'
import { defineEventHandler, useRuntimeConfig } from '#imports'
import { getCookie, setCookie } from 'h3'
import type { JWTResponseData } from '../../../types'

export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event)

  const access = getCookie(event, config.public.nuxtAuthentication.accessTokenName || 'access')
  if (!access) return { id: null }

  const { payload } = useJwt<JWTResponseData>(access)
  const userId = payload.value?.user_id

  const domain = config.public.nuxtAuthentication.cookieDomain || undefined
  const secure = process.env.NODE_ENV === 'production'

  setCookie(event, 'user_id', userId?.toString() || '', {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    domain,
    maxAge: 60 * 60 * 24 * 7 // 7 days
  })

  return { id: payload.value?.user_id }
})
