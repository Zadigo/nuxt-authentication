import { useJwt } from '@vueuse/integrations/useJwt'
import { defineEventHandler, useRuntimeConfig } from '#imports'
import { getCookie, setCookie, createError } from 'h3'
import type { JWTResponseData } from '../../../types'

export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event)

  const access = getCookie(event, config.public.nuxtAuthentication.accessTokenName || 'access')
  if (!access) throw createError({
    statusCode: 401,
    statusMessage: 'No access token found'
  })

  const { payload } = useJwt<JWTResponseData>(access)
  const userId = payload.value?.user_id

  setCookie(event, 'user_id', userId?.toString() || '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7 // 7 days
  })

  return { id: payload.value?.user_id }
})
