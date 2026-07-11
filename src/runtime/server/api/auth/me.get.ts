import { useJwt } from '@vueuse/integrations/useJwt'
import { defineCachedEventHandler, useRuntimeConfig } from '#imports'
import { getCookie, createError } from 'h3'

export interface JWTResponseData {
  /**
   * User ID of the authenticated user
   */
  user_id: number
}

export default defineCachedEventHandler((event) => {
  const config = useRuntimeConfig(event)
  const access = getCookie(event, config.public.nuxtAuthentication.accessTokenName || 'access')

  if (!access) throw createError({ statusCode: 401 })

  const { payload } = useJwt<JWTResponseData>(access)
  return { user_id: payload.value?.user_id }
}, {
  maxAge: 300, // Cache the response for 5 minutes (300 seconds)
  revalidate: 300 // Revalidate the cache every 5 minutes (300 seconds)
})
