import { useRuntimeConfig } from '#imports'
import type { TokenRefreshApiResponse, Undefineable, Emptyable } from '../types'

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
export async function refreshAccessToken(refresh: Emptyable<string>) {
  try {
    const config = useRuntimeConfig().public.nuxtAuthentication
    const response = await $fetch<TokenRefreshApiResponse>(config.refreshEndpoint || '/api/token/refresh', {
      baseURL: config.domain,
      method: 'POST',
      body: {
        refresh
      }
    })

    return {
      access: response.access
    }
  } catch (error) {
    console.error('Failed to refresh access token:', error)
    return {
      access: null
    }
  }
}
