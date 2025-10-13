export default defineNuxtRouteMiddleware((to) => {
  const { user } = useUserSession()

  // Allow access to login and signup pages
  if (to.path === '/login' || to.path === '/signup') {
    return
  }

  // Redirect to login if not authenticated
  if (!user.value) {
    return navigateTo('/login')
  }
})