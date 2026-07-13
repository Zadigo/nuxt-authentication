import { defineEventHandler, useRuntimeConfig } from '#imports'
import { getCookie } from 'h3'
import { generateErrorTemplate } from '../../../utils'

export default defineEventHandler((event) => {
  try {
    const config = useRuntimeConfig(event)
    const access = getCookie(event, config.public.nuxtAuthentication.accessTokenName || 'access')
    return { status: !!access }
  } catch (error) {
    console.error('Error checking token:', generateErrorTemplate(error))
    return { status: false }
  }
})
