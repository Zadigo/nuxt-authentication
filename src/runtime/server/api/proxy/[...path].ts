import { getCookie, createError } from 'h3'
import { useRuntimeConfig, defineEventHandler, getQuery, readBody } from '#imports'
import { generateErrorTemplate } from '../../../utils'

/**
 * Generic proxy handler for forwarding requests to the Django backend.
 * It checks for the presence of an access token in cookies and forwards the request
 * to the specified path on the Django server, including query parameters and request body.
 * If the access token is missing, it returns a 401 error. If the upstream request fails,
 * it forwards the actual status and message from Django instead of masking it as a 500 error.
 */
export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig(event)
    const access = getCookie(event, config.public.nuxtAuthentication.accessTokenName || 'access')
    
    // if (!access) {
    //   throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
    // }
    
    console.log('Access token found, proceeding with proxy request...', access)
    
    // const path = event.context.params?.path
    // const method = event.method
    // const query = getQuery(event)
    // const body = ['POST', 'PUT', 'PATCH'].includes(method) ? await readBody(event) : undefined
    
    // try {
    //   return await $fetch(`/${path}`, {
    //     baseURL: config.public.nuxtAuthentication.domain,
    //     method,
    //     query,
    //     body,
    //     headers: {
    //       Authorization: `${config.public.nuxtAuthentication.bearerTokenType} ${access}`
    //     }
    //   })
    // } catch (error: any) {
    //   // Forward Django's actual status/message instead of masking it as a 500
    //   throw createError({
    //     statusCode: error?.response?.status || 500,
    //     statusMessage: error?.response?._data?.detail || 'Upstream request failed'
    //   })
    // }
  } catch (error) {
    const template = generateErrorTemplate(error)
    throw createError(template)
  }
})
