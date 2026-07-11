import { defineCachedEventHandler, useRuntimeConfig } from '#imports'
import { getCookie, createError } from 'h3'


export default defineCachedEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const access = getCookie(event, config.public.nuxtAuthentication.accessCookieName || 'access')
  if (!access) throw createError({ statusCode: 401 })

  try {
    return await $fetch(config.public.nuxtAuthentication.endpoints.profile, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `${config.public.nuxtAuthentication.bearerTokenType} ${access}`
      }
    }) 
  } catch (error) {
    console.error('Error fetching user profile:', error)
    throw createError({ statusCode: 500, message: 'Failed to fetch user profile' })
  }
}, {
  // Cache the response for 5 minutes (300 seconds)
  maxAge: 300,
  // Revalidate the cache every 5 minutes (300 seconds)
  revalidate: 300
})
