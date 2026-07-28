import { eventHandler, getRequestHeader, readBody, sendRedirect } from 'h3'
import { useRuntimeConfig } from '#imports'
import { withQuery } from 'ufo'
import type { BaseJWTTokens, OAuthEventHandlerConfig, AppleOauthConfig } from '../../../types'
import { accessTokenErrorHandler, checkAccessTokenResponse, getAccessToken, signJwt, verifyJwt } from '../../utils'
import { defu } from 'defu'

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

export type AuthorizationValidationResponse = {
  access_token: string
  token_type: 'Bearer' | (string & {})
  expires_in: number
  refresh_token: string
  id_token: string
}


type EventHandlerConfig = OAuthEventHandlerConfig<AppleOauthConfig, { user: Partial<AppleUser>, tokens: OAuthAppleTokens }>

export function defineOAuthAppleEventHandler({ config, onSuccess, onError }: EventHandlerConfig): EventHandlerConfig  {
  return eventHandler(async (event) => {
    const runtimeConfig = useRuntimeConfig(event).public.nuxtAuthentication.oauth || {}
    const _config = defu(config, runtimeConfig.apple || {}, {
      authorizationUrl: 'https://appleid.apple.com/auth/authorize',
      authorizationParams: {},
      tokenUrl: 'https://appleid.apple.com/auth/token'
    } as AppleOauthConfig)

    // _config.authorizationUrl = config?.authorizationUrl || 'https://appleid.apple.com/auth/authorize'
    // _config.authorizationParams = {}

    if (!_config.authorizationUrl) {
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
    // if (!isPostRequest || !code) {
    //   const redirectUri = _config.redirectUri || 'http://localhost:3000/api/auth/apple/callback'

    //   _config.scope = ['name', 'email'].join(' ')
    //   return sendRedirect(event, withQuery(_config.authorizationUrl, {
    //     response_type: 'code',
    //     response_mode: 'form_post',
    //     client_id: _config.clientId,
    //     redirect_uri: redirectUri,
    //     scope: _config.scope,
    //     ..._config.authorizationParams
    //   }))
    // }

    // try {
    //   const secret = await signJwt(
    //     {
    //       iss: config.teamId,
    //       aud: 'https://appleid.apple.com',
    //       sub: config.clientId
    //     },
    //     {
    //       privateKey: config.privateKey,
    //       keyId: config.keyId,
    //       teamId: config.teamId,
    //       clientId: config.clientId,
    //       expiresIn: '5m'
    //     }
    //   )

    //   const accessTokenResponse = await getAccessToken<AuthorizationValidationResponse>(config.tokenUrl, {
    //     params: {
    //       code,
    //       client_id: config.clientId,
    //       client_secret: secret,
    //       grant_type: 'authorization_code',
    //       redirect_uri: config.redirectUri
    //     }
    //   })

    //   const payload = await verifyJwt<OAuthAppleTokens>(accessTokenResponse?.id_token, {
    //     publicJwkUrl: 'https://appleid.apple.com/auth/keys',
    //     audience: config.clientId,
    //     issuer: 'https://appleid.apple.com',
    //   })
      
    //   const payloadError = checkAccessTokenResponse(event, payload, 'apple', { testing: 'Apple access token verification failed' }, onError)
    //   return onSuccess(event, { user: user!, payload, tokens: accessTokenResponse })
    // } catch (error) {
    //   return accessTokenErrorHandler(event, 'apple', { testing: 'Apple access token verification failed' })
    // }

    return { isPostRequest, code, user }
  })
}
