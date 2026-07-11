import { setCookie, readBody } from 'h3'
import { useRuntimeConfig, defineEventHandler } from '#imports'


export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const config = useRuntimeConfig(event).public.nuxtAuthentication
  const endpoint = config.refreshEndpoint || '/api/token/refresh'

  const responseTemplate: { success: boolean } = { success: false }

  try {
    const data = await $fetch<{ access: string }>(endpoint, {
      baseURL: config.domain,
      method: 'POST',
      body
    })

    if (data.access) {
      responseTemplate.success = true
    } else {
      console.log('Refreshing failed: Missing access token in response')
      return responseTemplate
    }

    setCookie(event, 'access', data.access, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 60 * 15 // match your access token lifetime
    })
  } catch (error) {
    console.error('Error during token refresh:', error)
  }

  // Only return non-sensitive info to the client
  return responseTemplate
})
