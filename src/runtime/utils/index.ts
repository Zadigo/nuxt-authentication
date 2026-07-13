import { createError, useRuntimeConfig } from '#imports'
import type { DjangoLoginResponse, Undefineable } from '../types'
import { FetchError } from 'ofetch'

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
    return await $fetch<Partial<Pick<DjangoLoginResponse, 'access'>>>('/api/auth/renew', {
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

/**
 * A helper function to generate the authenticated headers for API requests.
 * @description This function generates the necessary headers for making authenticated API requests using the provided access token and bearer token type.
 * @param accessToken The access token to be used for authentication.
 * @param bearerTokenType The type of bearer token (default is 'Token').
 */
export function getAuthenticatedHeader(accessToken: Undefineable<string>, bearerTokenType: string = 'Token'): HeadersInit {
  if (!accessToken) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required'
    })
  }

  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `${bearerTokenType} ${accessToken}`,
  }
}

/**
 * Creates a standardized error template based on the provided error object.
 * This function is useful for generating consistent error responses in API handlers. 
 * @param error The error object to generate the template from.
 */
export function generateErrorTemplate(error: Error | FetchError | unknown): { statusCode: number; statusMessage: string } {
  const template: Record<string, string | number> = {
    statusCode: 500,
    statusMessage: 'An unknown error occurred'
  }

  if (error instanceof Error) {
    template.statusMessage = error.message
  } else if (error instanceof FetchError) {
    template.statusCode = error.response?.status || 500
    template.statusMessage = error.response?._data?.detail || `${error}`
  }

  return template as { statusCode: number; statusMessage: string }
}
