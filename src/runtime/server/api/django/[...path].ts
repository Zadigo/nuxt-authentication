import { defineEventHandler, proxyRequest, getCookie } from 'h3'
import { useRuntimeConfig } from '#imports'
import type {  FetchOptions } from 'ofetch'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const djangoBaseUrl = (config.public.nuxtAuthentication.domain || 'http://127.0.0.1:8000').replace(/\/$/, '')
  const remainingPath = event.context.params?.['_'] || ''
  const targetUrl = new URL(remainingPath, djangoBaseUrl).toString()

  // Never trust a client-supplied Authorization header on a proxied route —
  // strip whatever the client sent before deciding whether to inject our own.
  delete event.node.req.headers['authorization']

  let authHeader = event.context.djangoAuthHeader

  // if (authHeader) {
  //   return await proxyRequest(event, targetUrl, { headers: { authorization: authHeader || '' } })
  // } else {
  //   return await proxyRequest(event, targetUrl)
  // }

  let headers: Record<string, string> = { ...event.node.req.headers }

  if (authHeader) {
    // event.node.req.headers['authorization'] = authHeader
    headers['authorization'] = authHeader
  } else {
    const token = getCookie(event, config.public.nuxtAuthentication.accessTokenName)
    if (token) {
      authHeader = `${config.public.nuxtAuthentication.bearerTokenType} ${token}`
      // event.node.req.headers['authorization'] = authHeader
      headers['authorization'] = authHeader
    }
  }

  console.log(targetUrl)

  const method = event.node.req.method as FetchOptions['method']
  return $fetch(targetUrl, { method, headers, baseURL: djangoBaseUrl })
})
