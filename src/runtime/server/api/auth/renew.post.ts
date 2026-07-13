import { setCookie } from 'h3'
import { useRuntimeConfig, defineEventHandler, getCookie } from '#imports'
import type { BaseSsrResponse, BaseDjangoResponse, DjangoLoginResponse } from '../../../../runtime/types'
import { getAuthenticatedHeader } from '../../../utils'


export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event).public.nuxtAuthentication
  const endpoint = config.refreshEndpoint || '/api/token/refresh'

  const responseTemplate: BaseSsrResponse & Partial<Pick<BaseDjangoResponse, 'detail'>> = { success: false }

  const access = getCookie(event, config.accessTokenName || 'access')
  const refresh = getCookie(event, config.refreshTokenName || 'refresh')

  try {
    const data = await $fetch<Pick<DjangoLoginResponse, 'access'>>(endpoint, {
      baseURL: config.domain,
      method: 'POST',
      headers: getAuthenticatedHeader(access, config.bearerTokenType || 'Token'),
      body: {
        refresh
      }
    })

    // console.log('Token refresh response:', data)

    if (data.access) {
      responseTemplate.success = true
    } else {
      responseTemplate.detail = 'Refresh token is invalid or expired'
    }

    // const domain = config.public.nuxtAuthentication.domain || undefined
    const secure = process.env.NODE_ENV === 'production'

    setCookie(event, config.accessTokenName || 'access', data.access, {
      httpOnly: true,
      secure,
      // domain,
      sameSite: 'strict',
      maxAge: config.public.nuxtAuthentication.accessTokenMaxAge || 60 * 15
    })
  } catch (error) {
    // console.log((error as any)?.data)
    responseTemplate.success = false
    responseTemplate.detail = (error as any)?.data?.detail || 'Token refresh failed'
  }

  return responseTemplate
})
