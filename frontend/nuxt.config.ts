// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  extends: [
    // "github:simonbrundin/nuxt-base-layer",
    // ["github:simonbrundin/nuxt-base-layer", { install: true }],
    "../../nuxt-base-layer/",
    // eller med specifik branch/tag:
    // 'github:username/my-template-layer#v1.0.0'
  ],
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: [
    "@nuxt/image",
    "@nuxtjs/color-mode",
    "@nuxt/ui",
    "shadcn-nuxt",
    "@nuxtjs/tailwindcss",
    "nuxt-auth-utils",
  ],
  colorMode: {
    classSuffix: "",
  },
  runtimeConfig: {
    public: {
      authBaseUrl: process.env.BETTER_AUTH_URL || "http://localhost:3000",
    },
    // oauth: {
    //   // provider in lowercase (github, google, etc.)
    //   authentik: {
    //     clientId: "...",
    //     clientSecret: "...",
    //   },
    // },
  },
  shadcn: {
    /**
     * Prefix for all the imported component
     */
    prefix: "",
    /**
     * Directory that the component lives in.
     * @default "./components/ui"
     */
    componentDir: "./app/components/ui",
  },
  nitro: {
    preset: "bun",
  },
});

