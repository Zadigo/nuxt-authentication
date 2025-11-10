import { useRuntimeConfig, useCookie } from '#app'
import type { TokenRefreshApiResponse, Undefineable } from '../types'
import { isDefined } from '@vueuse/core'

/**
 * @private
 * @param url The base url
 * @param path The path 
 */
export function getUrl(url: string, path: Undefineable<string>) {
  if (!path) {
    return ''
  }

  if (path.startsWith('http://') || path.startsWith('https://')) {
    throw new Error('Absolute URLs are not allowed for authentication redirects.')
  }

  if (!path.startsWith('/')) {
    return `${url}${path}`
  }

  return `${url}/${path}`
}

/**
 * Helper function used to ask for a new access
 * token for the user
 * @param refresh - The refresh token
 */
export async function refreshAccessToken(refresh: Undefineable<string>) {
  if (import.meta.client) {
    return {
      access: null
    }
  }

  const config = useRuntimeConfig().public.nuxtAuthentication
  const response = await $fetch<TokenRefreshApiResponse>('/auth/v1/token/refresh/', {
    baseURL: getUrl(config.domain, config.refreshEndpoint),
    method: 'POST',
    body: {
      refresh
    }
  })

  return {
    access: response.access
  }
}

/**
 * Function used to refresh the access token
 * on the client side
 */
export async function refreshAccessTokenClient() {
  if (import.meta.server) {
    return {
      access: null
    }
  }

  const refreshToken = useCookie('refresh')

  if (isDefined(refreshToken)) {
    const response = await refreshAccessToken(refreshToken.value)

    if (response.access) {
      useCookie('access').value = response.access
    }

    return response
  }

  return { access: null }
}
