export default defineNuxtConfig({
  modules: [
    '../src/module',
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/ui'
  ],
  nuxtAuthentication: {},
  devtools: { enabled: true },
  runtimeConfig: {
    public: {
      nuxtAuthentication: {
        domain: 'http://127.0.0.1:8000',
        enabled: true,
        refreshEndpoint: '/api/token/refresh',
        accessEndpoint: '/api/token/access',
        login: '/login',
        loginRedirectPath: '/',
        strategy: 'renew',
        bearerTokenType: 'Token'
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
