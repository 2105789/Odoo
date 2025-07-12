export default defineNuxtRouteMiddleware(async (to, from) => {
  // Check for client-side authentication
  if (process.client) {
    const { authToken, clearToken } = useAuth()
    
    console.log('Admin middleware - Current path:', to.path)
    console.log('Admin middleware - Token exists:', !!authToken.value)
    console.log('Admin middleware - Token value:', authToken.value)
    
    if (!authToken.value) {
      console.log('Admin middleware - No token, redirecting to login')
      return navigateTo('/login')
    }
    
    // Verify admin role by calling the API
    try {
      console.log('Admin middleware - Verifying admin role...')
      const data = await $fetch('/api/auth/me')
      
      console.log('Admin middleware - API response:', data)
      
      if (!data?.success || data.user.role !== 'ADMIN') {
        console.log('Admin middleware - Not admin, redirecting')
        throw createError({
          statusCode: 403,
          statusMessage: 'Admin access required'
        })
      }
      
      console.log('Admin middleware - Admin verified, allowing access')
      
    } catch (error) {
      console.error('Admin middleware - Error:', error)
      // Invalid token or not admin
      clearToken()
      return navigateTo('/login')
    }
  }
}) 