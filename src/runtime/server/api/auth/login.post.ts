import { setCookie, readBody} from 'h3'
import { useRuntimeConfig, defineEventHandler } from '#imports'
import type { DjangoLoginResponse, BaseSsrResponse, BaseDjangoResponse } from '../../../types'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const config = useRuntimeConfig(event)
  const endpoint = config.public.nuxtAuthentication.accessEndpoint || '/api/token/access'
  
  const responseTemplate: BaseSsrResponse & Partial<Pick<BaseDjangoResponse, 'detail'>> = { success: false }

  try {
    const data = await $fetch<DjangoLoginResponse>(endpoint, {
      baseURL: config.public.nuxtAuthentication.domain,
      method: 'POST',
      body
    })

    if (data.access && data.refresh) {
      responseTemplate.success = true
    }

    setCookie(event, config.public.nuxtAuthentication.accessTokenName || 'access', data.access, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 60 * 15 // match your access token lifetime
    })

    setCookie(event, config.public.nuxtAuthentication.refreshTokenName || 'refresh', data.refresh, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7
    })
  } catch (error) {
    responseTemplate.detail = (error as any)?.data?.detail || 'Login failed'
  }

  return responseTemplate
})
