import { defineEventHandler, useRuntimeConfig, getQuery } from '#imports'
import { getCookie, createError } from 'h3'
import { getAuthenticatedHeader } from '../../../../runtime/utils'


export default defineEventHandler(async (event) => {
  const query = getQuery<{ id: number }>(event)
  
  const config = useRuntimeConfig(event)
  const access = getCookie(event, config.public.nuxtAuthentication.accessTokenName || 'access')
  if (!access) throw createError({ statusCode: 401 })

  const endpoint = config.public.nuxtAuthentication.profileEndpoint
  if (!endpoint) throw createError({ statusCode: 500, message: 'Profile endpoint is not defined in the configuration' })
    
  try {
    const headers = getAuthenticatedHeader(access, config.public.nuxtAuthentication.bearerTokenType || 'Token')
    console.log('headers', headers)
    
    if (config.public.nuxtAuthentication.profileEndpointType === 'graphql') {
      if (!config.public.nuxtAuthentication.profileGraphqlQueryName) {
        throw createError({ statusCode: 500, message: 'Profile GraphQL query name is not defined in the configuration' })
      }

      return await $fetch(endpoint, {
        method: 'POST',
        baseURL: config.public.nuxtAuthentication.domain,
        headers,
        body: {
          query: `query($id: Int!) { ${config.public.nuxtAuthentication.profileGraphqlQueryName}(id: $id) { ${config.public.nuxtAuthentication.profileEndpointFields?.join(' ')} } }`,
          variables: {
            id: query.id
          }
        }
      })
    } else {
      return await $fetch(endpoint, {
        method: 'GET',
        baseURL: config.public.nuxtAuthentication.domain,
        headers
      })
    }
  } catch (error) {
    console.error('Error fetching user profile:', error)
    throw createError({ statusCode: 500, message: `Failed to fetch user profile: ${(error as Error).message}` })
  }
})
