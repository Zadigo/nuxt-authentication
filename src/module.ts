import { addPlugin, addImports, createResolver, defineNuxtModule, installModule, addComponent } from '@nuxt/kit'
import { defu } from 'defu'
import type { Nullable } from './runtime/types'

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
  strategy?: 'renew' | 'login' | 'fail'
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
}

declare module '@nuxt/schema' {
  interface PublicRuntimeConfig {
    nuxtAuthentication: ModuleOptions
  }

  interface NuxtConfig {
    nuxtAuthentication?: ModuleOptions
  }

  interface NuxtOptions {
    nuxtAuthentication?: ModuleOptions
  }
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-authentication',
    configKey: 'nuxtAuthentication',
  },
  // Default configuration options of the Nuxt module
  defaults: {
    enabled: true,
    refreshEndpoint: '/api/token/refresh',
    accessEndpoint: '/api/token/access',
    login: '/login',
    loginRedirectPath: '/',
    strategy: 'renew',
    bearerTokenType: 'Token',
    accessTokenName: 'access',
    refreshTokenName: 'refresh',
    verifyEndpoint: '/api/token/verify',
    // autoVerifyToken: false,
    // autoVerifyTokenInterval: 60,
    accessTokenMaxAge: null,
    refreshTokenMaxAge: 60 * 60 * 24 * 7 // 7 days
  },
  async setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // Deep-merge nuxt module options + user custom gtm optionss filling missing fields
    const moduleOptions: ModuleOptions = defu(nuxt.options.runtimeConfig.public.nuxtAuthentication, options)

    // Transpile and alias runtime
    const runtimeDir = resolver.resolve('./runtime')
    nuxt.options.alias['#ganalytics'] = runtimeDir
    nuxt.options.build.transpile.push(runtimeDir)

    nuxt.options.runtimeConfig.public.nuxtAuthentication = moduleOptions

    // Do not add the extension since the `.ts` will be transpiled to `.mjs` after `npm run prepack`
    addPlugin(resolver.resolve('./runtime/plugin'))

    const composablesPath = resolver.resolve('./runtime/composables')
    addImports([
      { name: 'useLogin', from: composablesPath },
      { name: 'useLogout', from: composablesPath },
      { name: 'useUser', from: composablesPath },
      { name: 'useNuxtAuthentication', from: composablesPath },
      { name: 'useRefreshAccessToken', from: composablesPath }
    ])

    const utilsPath = resolver.resolve('./runtime/utils')
    addImports([
      { name: 'refreshAccessToken', from: utilsPath },
      { name: 'refreshAccessTokenClient', from: utilsPath }
    ])

    // Add middleware from your module
    // const middlewarePath = resolver.resolve('./runtime/middleware')
    // addRouteMiddleware('auth', middlewarePath)

    addComponent({
      name: 'AuthHandler',
      filePath: resolver.resolve('./runtime/components/NuxtLogin.vue'),
      global: true
    })

    addComponent({
      name: 'LogoutHandler',
      filePath: resolver.resolve('./runtime/components/NuxtLogout.vue'),
      global: true
    })

    await installModule('@vueuse/nuxt')
  }
})
