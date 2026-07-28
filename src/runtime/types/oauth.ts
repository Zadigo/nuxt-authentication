import type { H3Event, H3Error } from 'h3'
import { sendRedirect } from 'h3'

export type ATProtoProvider = 'bluesky'

export type OAuthProvider = ATProtoProvider | 'atlassian' | 'auth0' | 'authentik' | 'azureb2c' | 'battledotnet' | 'cognito' | 'discord' | 'dropbox' | 'facebook' | 'gitea' | 'github' | 'gitlab' | 'google' | 'hubspot' | 'instagram' | 'kick' | 'keycloak' | 'line' | 'linear' | 'linkedin' | 'microsoft' | 'paypal' | 'polar' | 'spotify' | 'seznam' | 'steam' | 'strava' | 'tiktok' | 'twitch' | 'vk' | 'workos' | 'x' | 'xsuaa' | 'yandex' | 'zitadel' | 'apple' | 'livechat' | 'salesforce' | 'slack' | 'heroku' | 'roblox' | 'okta' | 'ory' | 'shopifyCustomer' | 'oidc' | 'osu' | 'riotgames' | 'box' | (string & {})

export type BaseJWTTokens = {
  iss: string
  aud: string
  exp: number
  iat: number
  sub: string
}

export type OnSuccessFunction<R extends Record<string, string> = Record<string, string>> = (event: H3Event, result: R) => ReturnType<typeof sendRedirect>

export type OnErrorFunction<T = undefined> = (event: H3Event, error: H3Error) => Promise<T>

export interface OAuthEventHandlerConfig<T, R extends { user: string, tokens: string }> {
  config?: T
  onSuccess: OnSuccessFunction<R>
  onError?: OnErrorFunction<Record<string, string | number> | undefined>
}

export interface WebAuthnUser {
  userName: string
  displayName?: string
  [key: string]: unknown
}

type BaseOAuthConfig = {
  clientId: string
} & Partial<{
  scope: string | string[]
  authorizationUrl: string
  tokenUrl: string
  redirectUri: string
  authorizationParams: Record<string, boolean>
}>

/**
 * Apple
 */

export type AppleOauthConfig = BaseOAuthConfig & {
  clientId: string
  teamId: string
  keyId: string
  privateKey: string
}

/**
 * Google
 */

export type GoogleOauthConfig = BaseOAuthConfig & {
  clientSecret: string
} & Partial<{
  userUrl: string
}>
