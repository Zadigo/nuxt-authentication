import { isDefined } from '@vueuse/core'
import * as jose from 'jose'
import type { H3Event } from 'h3'
import { getRequestURL, createError } from 'h3'
import type { OAuthProvider, OnErrorFunction } from '../types'
// import { createError } from '#imports'

export type SignJwtOptions = {
  privateKey: string
  keyId: string
  teamId?: string
  clientId?: string
  algorithm?: 'ES256' | 'RS256'
  expiresIn?: string // e.g., '5m', '1h'
}

/**
 * A helper function to sign a JWT using the provided payload and options.
 * @param payload The payload to be included in the JWT.
 * @param options The options for signing the JWT, including the private key, key ID, team ID, client ID, algorithm, and expiration time.
 */
export async function signJwt<T extends Record<string, unknown>>(payload: T, options: SignJwtOptions): Promise<string> {
  const now = Math.floor(Date.now() / 1000)

  const algorithm = options.algorithm || 'ES256'
  const key = await jose.importPKCS8(options?.privateKey.replace(/\\n/g, '\n'), algorithm)

  return new jose.SignJWT(payload)
    .setProtectedHeader({ alg: algorithm, kid: options.keyId })
    .setIssuedAt(now)
    .setExpirationTime(options?.expiresIn || '5m')
    .sign(key)
}

export type RequestAccessTokenBody = {
  grant_type: string
  code: string
  redirect_uri: string
  client_id: string
  client_secret?: string
  [key: string]: string | undefined
}

export interface RequestAccessTokenOptions {
  body: RequestAccessTokenBody
  params: RequestAccessTokenBody
  headers: Record<string, string>
}


// TODO: Rename to authorization validation
export async function getAccessToken<T>(url: string, options: Partial<RequestAccessTokenOptions>): Promise<T | undefined> {
  let _body: RequestAccessTokenBody | string = options.body || options.params || {}
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    ...options.headers
  }

  if (isDefined(options)) {
    if (options.headers?.['Content-Type'] === 'application/x-www-form-urlencoded') {
      const urlSearchParams = new URLSearchParams(_body)

      return await $fetch<T>(url, {
        method: 'POST',
        headers,
        body: urlSearchParams.toString()
      })
    } else {
      return await $fetch<T>(url, {
        method: 'POST',
        headers,
        body: _body
      })
    }
  }
}

export interface JWTVerifyOptions {
  publicJwkUrl: string
  audience: string
  issuer: string
}

export async function verifyJwt<T>(token: string, options: JWTVerifyOptions): Promise<T> {
  const JWKS = jose.createRemoteJWKSet(new URL(options.publicJwkUrl))

  const { payload } = await jose.jwtVerify(token, JWKS, {
    audience: options.audience,
    issuer: options.issuer,
  })

  return payload as T
}

export function accessTokenErrorHandler(event: H3Event, oauthProvider: OAuthProvider, oauthError: { testing: string }) {
  return createError({
    name: `${oauthProvider} login failed`,
    statusCode: 401,
    statusMessage: 'Unauthorized',
    message: 'Something went wrong with the access token',
    data: oauthError
  })
}

export function checkAccessTokenResponse<P extends Record<string, string | number | boolean | undefined>>(event: H3Event, payload: P | undefined, oauthProvider: OAuthProvider, oauthError: { testing: string }, onError?: OnErrorFunction<void>): void | Promise<void> {
  if (!isDefined(payload)) {
    // const message = `${oauthProvider} login failed: ${oauthError.error_description || oauthError.error || 'Unknown error'}`
  
    const error = accessTokenErrorHandler(event, oauthProvider, oauthError)
    // If onError is not defined, throw the error to be handled by the global error handler
    // otherwise pass it to the onError function for custom handling
    if (!isDefined(onError)) throw error
    // TODO: Defined return type for onError function to be able to return a value from it
    return onError(event, error)
  }
}

export function oauthRedirectUrl(event: H3Event): string {
  const url = getRequestURL(event)
  return `${url.protocol}//${url.host}${url.pathname}`
}
