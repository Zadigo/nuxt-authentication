import type { H3Event, H3Error } from 'h3'

export type ATProtoProvider = 'bluesky'

export type OAuthProvider = ATProtoProvider | 'atlassian' | 'auth0' | 'authentik' | 'azureb2c' | 'battledotnet' | 'cognito' | 'discord' | 'dropbox' | 'facebook' | 'gitea' | 'github' | 'gitlab' | 'google' | 'hubspot' | 'instagram' | 'kick' | 'keycloak' | 'line' | 'linear' | 'linkedin' | 'microsoft' | 'paypal' | 'polar' | 'spotify' | 'seznam' | 'steam' | 'strava' | 'tiktok' | 'twitch' | 'vk' | 'workos' | 'x' | 'xsuaa' | 'yandex' | 'zitadel' | 'apple' | 'livechat' | 'salesforce' | 'slack' | 'heroku' | 'roblox' | 'okta' | 'ory' | 'shopifyCustomer' | 'oidc' | 'osu' | 'riotgames' | 'box' | (string & {})

export type BaseJWTTokens = {
  iss: string
  aud: string
  exp: number
  iat: number
  sub: string
}

export type OnSuccessFunction<T extends Record<string, unknown> = Record<string, unknown>> = (event: H3Event, result: T) => Promise<T> | void

export type OnErrorFunction<T = undefined> = (event: H3Event, error: H3Error) => Promise<T> | void

export interface OAuthEventHandlerConfig<T, R extends { user: unknown, tokens: unknown }> {
  config: T
  onSuccess: OnSuccessFunction<R>
  onError?: OnErrorFunction<Record<string, string | number> | undefined>
}
