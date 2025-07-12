export default defineNuxtRouteMiddleware((to, from) => {
  // Skip authentication for public routes
  const publicRoutes = ['/', '/login', '/register']
  
  if (publicRoutes.includes(to.path)) {
    return
  }
  
  // Check for client-side authentication
  if (process.client) {
    const { authToken } = useAuth()
    
    console.log('Auth middleware - Current path:', to.path)
    console.log('Auth middleware - Token exists:', !!authToken.value)
    console.log('Auth middleware - Token value:', authToken.value)
    
    if (!authToken.value) {
      console.log('Auth middleware - No token, redirecting to login')
      return navigateTo('/login')
    }
    
    // Note: Token verification is handled on the server side
    // Client-side just checks if token exists
    console.log('Auth middleware - Token found, allowing access')
  }
}) 