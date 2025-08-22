// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      title: "Planeringsapp",
      meta: [
        { name: "description", content: "Världens bästa planeringskompis" }
      ],
      htmlAttrs: {
        lang: 'en',
      }
    }
  },
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  // Nuxt 4 specific configurations
  experimental: {
    // Enable composables for better performance
    composables: true,
    // Enable server components
    componentIslands: true,
  },
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/color-mode',
  ],
  // Runtime config for environment variables
  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE_URL || 'http://localhost:3000'
    }
  },
  // Build configuration
  nitro: {
    preset: 'node-server'
  }
})