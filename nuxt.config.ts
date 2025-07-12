// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss'
  ],
  runtimeConfig: {
    // Server-side environment variables
    jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    nextauthSecret: process.env.NEXTAUTH_SECRET || 'your-super-secret-nextauth-key',
    
    // Cloudinary configuration
    cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || 'djwk3tel2',
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || '533595556696782',
    cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || 'hLoHcGNA1pYIei9LYBUtBtf83y4',
    
    // Public keys (exposed to client-side)
    public: {
      cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || 'djwk3tel2',
    }
  },
  css: ['~/assets/css/main.css']
})