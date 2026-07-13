import { getCookie } from 'h3'
import { useRuntimeConfig, defineEventHandler } from '#imports'
import type { BaseSsrResponse, BaseDjangoResponse } from '../../../types'
import { generateErrorTemplate, getAuthenticatedHeader } from '../../../../runtime/utils'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig(event)
    
    const responseTemplate: BaseSsrResponse & Partial<Pick<BaseDjangoResponse, 'detail'>> = { success: false }
    
    const access = getCookie(event, config.public.nuxtAuthentication.accessTokenName || 'access')
    if (!access) {
      responseTemplate.detail = 'Access token not found'
      return responseTemplate
    }
  
    console.log(getAuthenticatedHeader(access, config.public.nuxtAuthentication.bearerTokenType))

    const endpoint = config.public.nuxtAuthentication.verifyEndpoint || '/api/token/verify'
    const data = await $fetch<BaseDjangoResponse>(endpoint, {
      baseURL: config.public.nuxtAuthentication.domain,
      method: 'POST',
      headers: getAuthenticatedHeader(access, config.public.nuxtAuthentication.bearerTokenType || 'Token'),
      body: {
        token: access
      }
    })
    
    // When the verification is valid, Django does not 
    // return any data, so we check for the absence of 'detail' 
    // and 'code' to determine success.
    if (!data.detail && !data.code) {
      responseTemplate.success = true
    }
    return responseTemplate
  } catch (error) {
    throw generateErrorTemplate(error)
  }
})
