import { eventHandler, getRequestHeader, readBody, sendRedirect } from 'h3'
import { useRuntimeConfig } from '#imports'
import { withQuery } from 'ufo'
import type { BaseJWTTokens, OAuthEventHandlerConfig } from '../../types'
import { accessTokenErrorHandler, checkAccessTokenResponse, getAccessToken, signJwt, verifyJwt } from '../utils'

export interface AppleOauthConfig {
  clientId: string
  teamId: string
  keyId: string
  privateKey: string
  scope: string | string[]
  authorizationUrl: string
  authorizationParams: Record<string, boolean>
  tokenUrl: string
  redirectUri: string
}

export interface AppleUser {
  name: Partial<{
    firstName: string
    lastName: string
  }>
  email: string
}

export type OAuthAppleTokens = BaseJWTTokens & {
  at_hash: string
  email: string
  email_verified: boolean
  is_private_email: boolean
  auth_time: number
  nonce_supported: boolean
}

type EventHandlerConfig = OAuthEventHandlerConfig<AppleOauthConfig, { user: Partial<AppleUser>, tokens: OAuthAppleTokens }>

export function defineOAuthAppleEventHandler({ config, onSuccess, onError }: EventHandlerConfig): EventHandlerConfig  {
  return eventHandler(async (event) => {
    const runtimeConfig = useRuntimeConfig(event).public.nuxtAuthentication
    config.authorizationUrl = config.authorizationUrl || runtimeConfig.oauth?.apple?.authorizationUrl || 'https://appleid.apple.com/auth/authorize'
    config.authorizationParams = {}

    if (!config.authorizationUrl) {
      return 
    }

    const isPostRequest = getRequestHeader(event, 'content-type') === 'application/x-www-form-urlencoded'

    let code: string | undefined = undefined
    let user: Partial<AppleUser> | undefined = undefined

    if (isPostRequest) {
      const body = await readBody<{ code: string, user: Partial<AppleUser> }>(event)
      
      code = body.code
      user = body.user
    }

    // Redirect the user to the Apple authorization page 
    // if the request is not a POST request or if the code is not 
    // present in the request body.
    if (!isPostRequest || !code) {
      const redirectUrl = runtimeConfig.oauth?.apple?.redirectUri || 'http://localhost:3000/api/auth/apple/callback'

      config.scope = ['name', 'email'].join(' ')
      return sendRedirect(event, withQuery(config.authorizationUrl, {
        response_type: 'code',
        response_mode: 'form_post',
        client_id: config.clientId,
        redirect_uri: redirectUrl,
        scope: config.scope,
        ...config.authorizationParams
      }))
    }

    try {
      const secret = await signJwt(
        {
          iss: config.teamId,
          aud: 'https://appleid.apple.com',
          sub: config.clientId
        },
        {
          privateKey: config.privateKey,
          keyId: config.keyId,
          teamId: config.teamId,
          clientId: config.clientId,
          expiresIn: '5m'
        }
      )

      const accessTokenResponse = await getAccessToken<{ id_token: string }>(config.tokenUrl, {
        params: {
          code,
          client_id: config.clientId,
          client_secret: secret,
          grant_type: 'authorization_code',
          redirect_uri: config.redirectUri
        }
      })

      const payload = await verifyJwt<OAuthAppleTokens>(accessTokenResponse.id_token, {
        publicJwkUrl: 'https://appleid.apple.com/auth/keys',
        audience: config.clientId,
        issuer: 'https://appleid.apple.com',
      })
      
      const payloadError = checkAccessTokenResponse(event, payload, 'apple', { testing: 'Apple access token verification failed' }, onError)
      return onSuccess(event, { user: user!, payload, tokens: accessTokenResponse })
    } catch (error) {
      return accessTokenErrorHandler(event, 'apple', { testing: 'Apple access token verification failed' })
    }
  })
}
