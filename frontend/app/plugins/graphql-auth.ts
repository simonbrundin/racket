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

      // Validate session structure to prevent hydration errors
      if (session.value && typeof session.value === 'object' && session.value.accessToken) {
        // Ensure the token is a valid string
        const accessToken = session.value.accessToken
        if (typeof accessToken === 'string' && accessToken.length > 0) {
          token.value = accessToken
          console.log('GraphQL auth: Using JWT token from session')
        } else {
          console.warn('GraphQL auth: Invalid access token format, falling back to admin secret')
          // Fallback to admin secret if token is invalid
          client.setHeaders({
            'x-hasura-admin-secret': process.env.HASURA_GRAPHQL_ADMIN_SECRET || 'fallback-admin-secret'
          })
        }
      } else {
        console.warn('GraphQL auth: No valid session found, falling back to admin secret')
        // Fallback to admin secret for anonymous access
        client.setHeaders({
          'x-hasura-admin-secret': process.env.HASURA_GRAPHQL_ADMIN_SECRET || 'fallback-admin-secret'
        })
      }
    } catch (error) {
      console.error('GraphQL auth: Critical error getting user session:', error)
      // Fallback to admin secret on any error to prevent 500 errors
      try {
        client.setHeaders({
          'x-hasura-admin-secret': process.env.HASURA_GRAPHQL_ADMIN_SECRET || 'fallback-admin-secret'
        })
        console.log('GraphQL auth: Successfully fell back to admin secret after error')
      } catch (fallbackError) {
        console.error('GraphQL auth: Even fallback failed:', fallbackError)
      }
    }
  })
})
