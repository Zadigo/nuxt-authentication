import { useJwt } from '@vueuse/integrations/useJwt'
import { defineEventHandler, useRuntimeConfig, createError } from '#imports'
import { getCookie, setCookie } from 'h3'
import type { JWTResponseData } from '../../../types'
import { generateErrorTemplate } from '../../../utils'
import { toValue } from 'vue'

export default defineEventHandler((event) => {
  try {
    const config = useRuntimeConfig(event)

    const access = getCookie(event, config.public.nuxtAuthentication.accessTokenName || 'access')
    if (!access) return { id: null }

    const { payload } = useJwt<JWTResponseData>(access)
    const userId = toValue(payload)?.user_id

    const domain = config.public.nuxtAuthentication.cookieDomain || undefined
    const secure = process.env.NODE_ENV === 'production'

    setCookie(event, 'user_id', userId?.toString() || '', {
      httpOnly: true,
      sameSite: 'lax',
      secure,
      domain,
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    return { id: userId }
  } catch (error) {
    const template = generateErrorTemplate(error)
    throw createError(template)
  }
})
