import { eventHandler, getQuery, sendRedirect } from 'h3'
import { isDefined, useRuntimeConfig } from '#imports'
import { withQuery } from 'ufo'
import type { OAuthEventHandlerConfig, GoogleOauthConfig } from '../../../types'
import { checkAccessTokenResponse, getAccessToken, oauthRedirectUrl } from '../../utils'
import { defu } from 'defu'

export type ValidAuthenticationResponse = {
  sub: string
  name: string
  email: string
  picture: string
}

export function defineOAuthGoogleEventHandler({ config, onSuccess, onError }: OAuthEventHandlerConfig<GoogleOauthConfig, ValidAuthenticationResponse>): OAuthEventHandlerConfig<GoogleOauthConfig, ValidAuthenticationResponse> {
  return eventHandler(async (event) => {
    const runtimeConfig = useRuntimeConfig(event).public.nuxtAuthentication.oauth || {}
    const _config = defu(config, runtimeConfig.google || {}, {
      authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      userUrl: 'https://www.googleapis.com/oauth2/v3/userinfo',
      authorizationParams: {},
    } as GoogleOauthConfig)

    if (!isDefined(_config.clientId) && !isDefined(_config.clientSecret)) {
      // return accessTokenErrorHandler(event, 'google', { message: 'Google OAuth configuration is missing clientId or clientSecret' })
    }

    const query = getQuery<Partial<{ code: string, state: string }>>(event)
    const redirectUrl = _config.redirectUri || oauthRedirectUrl(event)

    if (!isDefined(query.code)) {
      _config.scope = _config.scope || 'openid email profile'
      return sendRedirect(event, withQuery(_config.authorizationUrl, {
        response_type: 'code',
        client_id: _config.clientId,
        redirect_uri: redirectUrl,
        scope: _config.scope,
        state: query.state,
        ..._config.authorizationParams,
      }))
    }

    const tokens = await getAccessToken<{ access_token: string }>(_config.tokenUrl, {
      body: {
        grant_type: 'authorization_code',
        code: query.code,
        redirect_uri: redirectUrl,
        client_id: _config.clientId,
        client_secret: _config.clientSecret,
      }
    })

    const error = await checkAccessTokenResponse(event, tokens, 'google', { message: 'Google access token verification failed' }, onError)

    if (error) {
      return error
    }

    const user = await $fetch<{ sub: string, name: string, email: string, picture: string }>(_config.userUrl, {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`
      }
    })

    return onSuccess(event, user)
  })
}
