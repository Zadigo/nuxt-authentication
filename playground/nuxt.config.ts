export default defineNuxtConfig({
  modules: [
    '../src/module',
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/ui'
  ],
  devtools: {
    enabled: true,

    timeline: {
      enabled: true
    }
  },
  runtimeConfig: {
    public: {
      nuxtAuthentication: {
        domain: 'http://127.0.0.1:8000',
        enabled: true,
        accessEndpoint: '/auth/v1/token/',
        refreshEndpoint: '/auth/v1/token/refresh/',
        verifyEndpoint: '/auth/v1/token/verify/',
        login: '/login',
        loginRedirectPath: '/',
        strategy: 'do_nothing',
        bearerTokenType: 'Token',
        oauth: {
          apple: {
            clientId: process.env.NUXT_OAUTH_APPLE_CLIENT_ID,
            teamId: process.env.NUXT_OAUTH_APPLE_TEAM_ID,
            keyId: process.env.NUXT_OAUTH_APPLE_KEY_ID,
            privateKey: process.env.NUXT_OAUTH_APPLE_PRIVATE_KEY,
            scope: process.env.NUXT_OAUTH_APPLE_SCOPE || 'name email',
            authorizationUrl: process.env.NUXT_OAUTH_APPLE_AUTHORIZATION_URL,
            authorizationParams: {
              response_mode: 'form_post'
            },
            tokenUrl: process.env.NUXT_OAUTH_APPLE_TOKEN_URL,
            redirectUri: process.env.NUXT_OAUTH_APPLE_REDIRECT_URI
          }
        },
        // autoVerifyToken: true,
        // autoVerifyTokenInterval: 30 // 1 minute
      }
    }
  },
  ui: {},
  css: [
    '~/assets/css/tailwind.css'
  ],
  fonts: {
    provider: 'google',
    families: [
      {
        // Body
        name: 'Work Sans',
        weight: '100..900'
      },
      {
        // Titles
        name: 'Manrope',
        weight: '200..800'
      },
      {
        // Titles
        name: 'Fira Code',
        weight: '300..700'
      }
    ]
  }
})
