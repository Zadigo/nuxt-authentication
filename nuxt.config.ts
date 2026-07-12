// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxt/scripts',
    '@vueuse/nuxt'
  ],

  compatibilityDate: '2026-07-11',

  devtools: {
    enabled: true
  }
})
