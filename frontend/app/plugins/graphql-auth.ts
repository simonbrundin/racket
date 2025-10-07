export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('gql:auth:init', async ({ client, token }) => {
    // Always use admin secret in development for easier testing
    if (process.dev) {
      client.setHeaders({
        'x-hasura-admin-secret': 'dev-admin-secret'
      })
      return
    }

    // In production, use JWT token from Authentik
    // The JWT will include x-hasura-user-sub, x-hasura-default-role, etc
    try {
      const { session } = useUserSession()
      if (session.value?.accessToken) {
        token.value = session.value.accessToken
      }
    } catch (error) {
      // If useUserSession fails, continue without auth
      console.warn('Failed to get user session:', error)
    }
  })
})
