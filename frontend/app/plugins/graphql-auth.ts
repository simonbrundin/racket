export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('gql:auth:init', async ({ client, token }) => {
    const { session } = useUserSession()

    // In development, use admin secret for easier testing
    if (process.dev) {
      client.setHeaders({
        'x-hasura-admin-secret': 'dev-admin-secret'
      })
      return
    }

    // In production, use JWT token from Authentik
    // The JWT will include x-hasura-user-sub, x-hasura-default-role, etc
    if (session.value?.accessToken) {
      token.value = session.value.accessToken
    }
  })
})
