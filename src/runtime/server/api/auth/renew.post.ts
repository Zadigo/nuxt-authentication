import { setCookie } from 'h3'
import { useRuntimeConfig, defineEventHandler, getCookie, createError } from '#imports'
import type { BaseSsrResponse, BaseDjangoResponse, DjangoLoginResponse } from '../../../../runtime/types'
import { generateErrorTemplate, getAuthenticatedHeader } from '../../../utils'


export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig(event)
    const endpoint = config.public.nuxtAuthentication.refreshEndpoint || '/api/token/refresh'
  
    const responseTemplate: BaseSsrResponse & Partial<Pick<BaseDjangoResponse, 'detail'>> = { success: false }
  
    const access = getCookie(event, config.public.nuxtAuthentication.accessTokenName || 'access')
    const refresh = getCookie(event, config.public.nuxtAuthentication.refreshTokenName || 'refresh')

    const data = await $fetch<Pick<DjangoLoginResponse, 'access'>>(endpoint, {
      baseURL: config.public.nuxtAuthentication.domain,
      method: 'POST',
      headers: getAuthenticatedHeader(access, config.bearerTokenType || 'Token'),
      body: {
        refresh
      }
    })

    if (data.access) {
      responseTemplate.success = true
    } else {
      responseTemplate.detail = 'Refresh token is invalid or expired'
    }

    // const domain = config.public.nuxtAuthentication.domain || undefined
    const secure = process.env.NODE_ENV === 'production'

    setCookie(event, config.public.nuxtAuthentication.accessTokenName || 'access', data.access, {
      httpOnly: true,
      secure,
      // domain,
      sameSite: 'strict',
      maxAge: config.public.nuxtAuthentication.accessTokenMaxAge || 60 * 15
    })

    return responseTemplate
  } catch (error) {
    const template = generateErrorTemplate(error)
    throw createError(template)
  }
})
