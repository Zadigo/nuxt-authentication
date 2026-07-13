import { setCookie, readBody} from 'h3'
import { useRuntimeConfig, defineEventHandler } from '#imports'
import type { DjangoLoginResponse, BaseSsrResponse, BaseDjangoResponse } from '../../../types'
import { generateErrorTemplate } from '../../../utils'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const config = useRuntimeConfig(event)
    const endpoint = config.public.nuxtAuthentication.accessEndpoint || '/api/token/access'
    
    const responseTemplate: BaseSsrResponse & Partial<Pick<BaseDjangoResponse, 'detail'>> = { success: false }

    const data = await $fetch<DjangoLoginResponse>(endpoint, {
      baseURL: config.public.nuxtAuthentication.domain,
      method: 'POST',
      body
    })

    if (data.access && data.refresh) {
      responseTemplate.success = true
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

    setCookie(event, config.public.nuxtAuthentication.refreshTokenName || 'refresh', data.refresh, {
      httpOnly: true,
      secure,
      // domain,
      sameSite: 'strict',
      maxAge: config.public.nuxtAuthentication.refreshTokenMaxAge || 60 * 60 * 24 * 7
    })
    return responseTemplate
  } catch (error) {
    throw generateErrorTemplate(error)
  }
})
