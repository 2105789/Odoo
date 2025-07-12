export const useAuthToken = () => {
  return useCookie<string | null>('auth-token', {
    default: () => null,
    maxAge: 60 * 60 * 24, // 24 hours
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: false // Allow client-side access
  })
}

export const useAuth = () => {
  const authToken = useAuthToken()
  
  const isLoggedIn = computed(() => !!authToken.value)
  
  const user = ref<{
    id: string
    email: string
    firstName: string
    lastName: string
    role: string
    isActive: boolean
  } | null>(null)
  
  const fetchUser = async () => {
    if (!authToken.value) {
      user.value = null
      return
    }
    
    try {
      const response = await $fetch('/api/auth/me', {
        headers: {
          'Cache-Control': 'no-cache'
        }
      }) as {
        success: boolean
        user: {
          id: string
          email: string
          firstName: string
          lastName: string
          role: string
          isActive: boolean
        }
      }
      
      if (response.success) {
        user.value = response.user
      } else {
        user.value = null
        // Clear invalid token
        authToken.value = null
      }
    } catch (error: any) {
      console.error('Error fetching user:', error)
      user.value = null
      // Clear invalid token on auth errors
      if (error.status === 401) {
        authToken.value = null
      }
    }
  }
  
  const login = (token: string) => {
    // This is now handled server-side via setCookie
    // Just refresh the auth state
    fetchUser()
  }
  
  const logout = async () => {
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      console.error('Logout API failed:', error)
    } finally {
      authToken.value = null
      user.value = null
      await navigateTo('/login', { replace: true })
    }
  }
  
  const clearToken = () => {
    authToken.value = null
    user.value = null
  }
  
  // Fetch user on token change
  watch(authToken, (newToken) => {
    if (newToken) {
      fetchUser()
    } else {
      user.value = null
    }
  }, { immediate: true })
  
  return {
    authToken: readonly(authToken),
    isLoggedIn: readonly(isLoggedIn),
    user: readonly(user),
    login,
    logout,
    clearToken,
    fetchUser
  }
} 