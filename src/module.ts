import { addPlugin, addImports, createResolver, defineNuxtModule, installModule, addComponent } from '@nuxt/kit'
import { defu } from 'defu'

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
  enabled: boolean
  /**
   * Refresh token endpoint on the backend
   * @default '/api/token/refresh'
   */
  refreshEndpoint: string
  /**
   * Access token endpoint on the backend
   * @default '/api/token/access'
   */
  accessEndpoint: string
  /**
   * Login path on Nuxt
   * @default '/login'
   */
  login: string
  /**
   * Path to redirect to after login
   * @default '/'
   */
  loginRedirectPath?: string
  /**
   * How to handle token renewal when a 401
   * code is encountered
   * @default 'renew'
   */
  strategy: 'renew' | 'login' | 'fail'
  /**
   * Optional bearer token type
   * @default 'Token'
   */
  bearerTokenType?: string
  /**
   * Name of the access token cookie
   * @default 'access'
   */
  accessTokenName: string
  /**
   * Name of the refresh token cookie
   * @default 'refresh'
   */
  refreshTokenName: string
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
    refreshTokenName: 'refresh'
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
      { name: 'useUser', from: composablesPath }
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
