// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  typescript: {
    strict: true,
    typeCheck: false // мне нужно отключить проверку типов при сборке для  Vercel
  },
  modules: [
    '@pinia/nuxt'
  ],
  css: [
    '~/assets/css/main.css'
  ]
})
