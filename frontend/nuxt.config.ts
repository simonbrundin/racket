// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // extends: [
  //   // "github:simonbrundin/nuxt-base-layer",
  //   // ["github:simonbrundin/nuxt-base-layer", { install: true }],
  //   "../../nuxt-base-layer/",
  //   // eller med specifik branch/tag:
  //   // 'github:username/my-template-layer#v1.0.0'
  // ],
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  css: ["@/assets/css/main.css"],
  ui: {
    theme: {
      colors: [
        "primary",
        "secondary",
        "tertiary",
        "info",
        "success",
        "warning",
        "error",
      ],
    },
  },

  modules: [
    "@nuxt/image",
    "@nuxtjs/color-mode",
    "@nuxtjs/tailwindcss",
    "@nuxt/ui",
    "shadcn-nuxt",
    "nuxt-auth-utils",
    "nuxt-graphql-client",
  ],
  colorMode: {
    classSuffix: "",
  },
  runtimeConfig: {
    public: {
      authBaseUrl: process.env.BETTER_AUTH_URL || "http://localhost:3000",
      GQL_HOST: "https://plan-hasura.simonbrundin.com/v1/graphql",
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
  "graphql-client": {
    clients: {
      default: {
        host: "https://plan-hasura.simonbrundin.com/v1/graphql",
        token: {
          type: 'Bearer',
          name: 'Authorization',
        },
      },
    },
  },
});
