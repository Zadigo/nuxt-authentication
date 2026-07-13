import { getCookie, createError } from 'h3'
import { useRuntimeConfig, defineEventHandler, readBody } from '#imports'
import { generateErrorTemplate } from '../../../utils'
import type { NitroFetchOptions, NitroFetchRequest } from 'nitropack/types'

type ProxyRequest = {
  path: string
  options: NitroFetchOptions<NitroFetchRequest, 'get' | 'head' | 'patch' | 'post' | 'put' | 'delete' | 'connect' | 'options' | 'trace'>
}

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

    const requestBody = await readBody<ProxyRequest>(event)

    requestBody.options.headers = {
      ...requestBody.options.headers,
      'Accept': 'application/json',
      'Authorization': `${config.public.nuxtAuthentication.bearerTokenType} ${access}`,
      'Content-Type': 'application/json'
    }
    
    return $fetch(requestBody.path, requestBody.options)
  } catch (error) {
    const template = generateErrorTemplate(error)
    throw createError(template)
  }
})
