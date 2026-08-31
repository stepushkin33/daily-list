export default defineNuxtConfig({
  compatibilityDate: '2026-08-28',
  ssr: false,
  devtools: { enabled: false },
  modules: ['@pinia/nuxt'],
  css: ['~/assets/styles/main.scss'],
  typescript: {
    strict: true,
    typeCheck: true,
  },
  app: {
    head: {
      htmlAttrs: { lang: 'ru' },
      title: 'Note Space — заметки без лишнего',
      meta: [
        {
          name: 'description',
          content: 'Небольшое приложение для заметок и списков задач.',
        },
      ],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
  },
})
