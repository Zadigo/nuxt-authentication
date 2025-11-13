export default defineNuxtConfig({
  modules: [
    '../src/module',
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/ui'
  ],
  devtools: { enabled: true },
  runtimeConfig: {
    public: {
      nuxtAuthentication: {
        domain: 'http://127.0.0.1:8000',
        enabled: true,
        accessEndpoint: '/auth/v1/token/',
        refreshEndpoint: '/auth/v1/token/refresh/',
        login: '/login',
        loginRedirectPath: '/',
        strategy: 'renew',
        bearerTokenType: 'Token',
        verifyEndpoint: '/auth/v1/token/verify/',
        accessTokenMaxAge: 15 * 60, // 15 minutes
        refreshTokenMaxAge: 7 * 24 * 60 * 60 // 7 days
      }
    }
  },
  ui: {
    prefix: 'Nuxt'
  },
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
