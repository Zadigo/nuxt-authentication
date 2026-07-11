import { setCookie } from 'h3'
import { useRuntimeConfig, defineEventHandler, getCookie } from '#imports'
import type { TokenRefreshApiResponse, SsrApiResponse } from '../../../../runtime/types'
import { getAuthenticatedHeader } from '../../../utils'


export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event).public.nuxtAuthentication
  const endpoint = config.refreshEndpoint || '/api/token/refresh'

  const responseTemplate: SsrApiResponse = { success: false }

  const access = getCookie(event, config.accessTokenName || 'access')
  const refresh = getCookie(event, config.refreshTokenName || 'refresh')

  try {
    const data = await $fetch<TokenRefreshApiResponse>(endpoint, {
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

    setCookie(event, config.accessTokenName || 'access', data.access, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 60 * 15 // match your access token lifetime
    })
  } catch (error) {
    // console.log((error as any)?.data)
    responseTemplate.success = false
    responseTemplate.detail = (error as any)?.data?.detail || 'Token refresh failed'
  }

  // Only return non-sensitive info to the client
  return responseTemplate
})
