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
  const response = await $fetch<TokenRefreshApiResponse>(config.refreshEndpoint, {
    baseURL: config.domain,
    method: 'POST',
    body: {
      refresh
    }
  })

  return {
    access: response.access
  }
}
