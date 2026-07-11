import { getCookie } from 'h3'
import { useRuntimeConfig, defineEventHandler } from '#imports'
import type { VerifyTokenApiResponse } from '../../../types'
import { getAuthenticatedHeader } from '../../../../runtime/utils'

type LoginResponse = {
  success: boolean
  detail?: string
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  
  const responseTemplate: LoginResponse = { success: false }
  
  const access = getCookie(event, config.public.nuxtAuthentication.accessTokenName || 'access')
  if (!access) {
    responseTemplate.detail = 'Access token not found'
    return responseTemplate
  }
  
  try {
    const endpoint = config.public.nuxtAuthentication.verifyEndpoint || '/api/token/verify'
    const data = await $fetch<VerifyTokenApiResponse>(endpoint, {
      baseURL: config.public.nuxtAuthentication.domain,
      method: 'POST',
      headers: getAuthenticatedHeader(access, config.public.nuxtAuthentication.bearerTokenType || 'Token'),
      body: {
        token: access
      }
    })

    console.log('Token verification response:', data)
    
    // When the verification is valid, Django does not 
    // return any data, so we check for the absence of 'detail' 
    // and 'code' to determine success.
    if (!data.detail && !data.code) {
      responseTemplate.success = true
    }
  } catch (error) {
    console.log('Token verification response:', (error as any)?.data)
    responseTemplate.detail = (error as any)?.data?.detail || 'Refresh failed'
  }

  // Only return non-sensitive info to the client
  return responseTemplate
})
