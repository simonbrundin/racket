export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('gql:auth:init', async ({ client, token }) => {
    const { session } = useUserSession()

    // Set token from user session
    if (session.value?.accessToken) {
      token.value = session.value.accessToken
    }
  })
})
