export default defineEventHandler(async (event) => {
  // Clear the auth token cookie
  setCookie(event, 'auth-token', '', {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0
  })
  
  return {
    success: true,
    message: 'Logout successful'
  }
}) 