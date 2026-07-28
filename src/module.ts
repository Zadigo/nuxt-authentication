import { addImports, addServerHandler, createResolver, defineNuxtModule, installModule, addComponent } from '@nuxt/kit'
import { defu } from 'defu'
import type { AppleOauthConfig, GoogleOauthConfig, Nullable } from './runtime/types'
import type { NitroEventHandler } from 'nitropack/types'

export type ProtectedRoute = {
  route: string
}

// Module options TypeScript interface definition
export interface ModuleOptions {
  /**
   * Domain for the backend API
   * @example 'https://api.example.com'
   */
  domain: string
  /**
   * Enable or disable the module
   * @default true
   */
  enabled?: boolean
  /**
   * Refresh token endpoint on the backend
   * @default '/api/token/refresh'
   */
  refreshEndpoint?: string
  /**
   * Access token endpoint on the backend
   * @default '/api/token/access'
   */
  accessEndpoint?: string
  /**
   * Protected routes that require authentication. 
   * If the user is not authenticated, they will be 
   * redirected to the login page.
   */
  // protectedRoutes?: ProtectedRoute[]
  /**
   * Login path on Nuxt
   * @default '/login'
   */
  login?: string
  /**
   * Path to redirect to after login
   * @default '/'
   */
  loginRedirectPath?: string
  /**
   * How to handle token renewal when a 401
   * code is encountered
   *
   * - `renew` - Attempt to renew the access token using the refresh token
   * - `login` - Redirect to the login page
   * - `fail`  - Fail the request and do not attempt to renew
   *
   * @default 'renew'
   */
  strategy?: 'renew' | 'login' | 'fail' | 'do_nothing' | (string & {})
  /**
   * Optional bearer token type
   * @default 'Token'
   */
  bearerTokenType?: string
  /**
   * Name of the access token cookie
   * @default 'access'
   */
  accessTokenName?: string
  /**
   * Name of the refresh token cookie
   * @default 'refresh'
   */
  refreshTokenName?: string
  /**
   * Verify token validity on backend side
   * @default false
   */
  // autoVerifyToken: boolean
  /**
   * Interval in seconds to verify token validity
   * @default 60
   */
  // autoVerifyTokenInterval?: number
  /**
   * Verify endpoint on the backend
   * @default '/api/token/verify'
   */
  verifyEndpoint?: string
  /**
   * Access token max age in seconds
   * @default null
   */
  accessTokenMaxAge?: Nullable<number>
  /**
   * Refresh token max age in seconds
   * @default 7 days (604800 seconds)
   */
  refreshTokenMaxAge?: Nullable<number>

  oauth?: {
    /**
     * Apple OAuth configuration
     * @description This configuration is used for Apple OAuth authentication. It includes the necessary parameters for the OAuth flow, such as client ID, team ID, key ID, private key, scope, and redirect URI. Optional parameters for authorization URL and token URL can also be provided.
     * @link https://developer.apple.com/documentation/accountorganizationaldatasharing/creating-a-client-secret
     */
    apple?: AppleOauthConfig
    /**
     * Google OAuth configuration
     * @description This configuration is used for Google OAuth authentication. It includes the necessary parameters for the OAuth flow, such as client ID, client secret, scope, and redirect URI. Optional parameters for authorization URL and token URL can also be provided.
     * @link https://developers.google.com/identity/protocols/oauth2
     */
    google?: GoogleOauthConfig
  }
}

declare module '@nuxt/schema' {
  interface PublicRuntimeConfig {
    nuxtAuthentication: ModuleOptions
  }

  interface NuxtConfig {
    nuxtAuthentication?: ModuleOptions
  }

  interface NuxtOptions {
    nuxtAuthentication: ModuleOptions
  }
}

export default defineNuxtModule<ModuleOptions>({
  // Default configuration options of the Nuxt module
  defaults: {
    enabled: true,
    domain: '',
    refreshEndpoint: '/api/token/refresh',
    accessEndpoint: '/api/token/access',
    // protectedRoutes: [],
    login: '/login',
    loginRedirectPath: '/',
    strategy: 'renew',
    bearerTokenType: 'Token',
    accessTokenName: 'access',
    refreshTokenName: 'refresh',
    verifyEndpoint: '/api/token/verify',
    // autoVerifyToken: false,
    // autoVerifyTokenInterval: 60,
    accessTokenMaxAge: 60 * 15,
    refreshTokenMaxAge: 60 * 60 * 24 * 7, // 7 days

    oauth: {
      apple: {
        clientId: '',
        teamId: '',
        keyId: '',
        privateKey: '',
        scope: 'name email',
        authorizationUrl: 'https://appleid.apple.com/auth/authorize',
        authorizationParams: {}, // response_mode: 'form_post'
        tokenUrl: 'https://appleid.apple.com/auth/token',
        redirectUri: ''
      }
    }
  },
  meta: {
    name: 'nuxt-authentication',
    configKey: 'nuxtAuthentication',
  },
  async setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // Deep-merge nuxt module options + user custom nuxt-authentication options filling missing fields
    const moduleOptions = defu(nuxt.options.runtimeConfig.public.nuxtAuthentication, options)

    // Transpile and alias runtime
    const runtimeDir = resolver.resolve('./runtime')
    nuxt.options.alias['#nuxt-authentication'] = runtimeDir
    nuxt.options.build.transpile.push(runtimeDir)

    nuxt.options.runtimeConfig.public.nuxtAuthentication = moduleOptions

    // Do not add the extension since the `.ts` will be transpiled to `.mjs` after `npm run prepack`
    // addPlugin(resolver.resolve('./runtime/nuxtauth'))

    // Add composables
    const composablesPath = resolver.resolve('./runtime/app/composables')
    addImports([
      { name: 'useLogin', from: composablesPath },
      { name: 'useLogout', from: composablesPath },
      { name: 'useUser', from: composablesPath },
      { name: 'useNuxtAuthentication', from: composablesPath },
      { name: 'useRefreshAccessToken', from: composablesPath },
      { name: 'useWebauthnAuthentication', from: composablesPath }
    ])

    // Add utils
    const utilsPath = resolver.resolve('./runtime/app/utils')
    addImports([
      { name: 'ssrRefreshAccessToken', from: utilsPath },
      { name: 'getAuthenticatedHeader', from: utilsPath }
    ])

    // Add server imports directory for webauthn
    // addServerImportsDir([
    //   resolver.resolve('./runtime/server/lib')
    // ])
    // addServerHandler({
    //   method: 'get',
    //   route: '/auth/apple',
    //   handler: resolver.resolve('./runtime/server/lib/oauth/apple')
    // })

    // Add server routes (Django)
    const routes: NitroEventHandler[] = [
      {
        method: 'post',
        route: '/api/auth/login',
        handler: resolver.resolve('./runtime/server/api/auth/login.post')
      },
      {
        method: 'get',
        route: '/api/auth/me',
        handler: resolver.resolve('./runtime/server/api/auth/me.get')
      },
      {
        method: 'post',
        route: '/api/auth/renew',
        handler: resolver.resolve('./runtime/server/api/auth/renew.post')
      },
      {
        method: 'post',
        route: '/api/auth/logout',
        handler: resolver.resolve('./runtime/server/api/auth/logout.post')
      },
      {
        method: 'post',
        route: '/api/auth/verify',
        handler: resolver.resolve('./runtime/server/api/auth/verify.post')
      },
      {
        method: 'get',
        route: '/api/auth/has-token',
        handler: resolver.resolve('./runtime/server/api/auth/has-token.get')
      },
      {
        method: 'post',
        route: '/api/proxy/django',
        handler: resolver.resolve('./runtime/server/api/proxy/django.post')
      }
    ]
    routes.forEach(route => addServerHandler(route))

    // Add middleware from your module
    // const middlewarePath = resolver.resolve('./runtime/middleware')
    // addRouteMiddleware('auth', middlewarePath)

    addComponent({
      name: 'AuthHandler',
      filePath: resolver.resolve('./runtime/app/components/NuxtLogin.vue'),
      global: true
    })

    addComponent({
      name: 'LogoutHandler',
      filePath: resolver.resolve('./runtime/app/components/NuxtLogout.vue'),
      global: true
    })

    await installModule('@vueuse/nuxt')
  }
})
