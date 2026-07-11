import { useRuntimeConfig } from '#imports'
import type { Undefineable } from '../types'

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
 * Helper function to refresh the access token on the server side
 * when the access token has expired and the refresh token is still valid.
 * @param config nuxtAuthentication configuration object
 * @param refresh The refresh token
 */
export async function ssrRefreshAccessToken(config: ReturnType<typeof useRuntimeConfig>['public']['nuxtAuthentication'], refresh: string) {
  try {
    return await $fetch<{ access: string }>('/api/auth/renew', {
      baseURL: config.domain,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        refresh
      }
    })
  } catch (error) {
    console.error('Failed to refresh access token:', error)
    return {
      access: null
    }
  }
}
