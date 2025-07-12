import { uploadImage } from '~/server/utils/cloudinary'
import jwt from 'jsonwebtoken'
import { z } from 'zod'

const uploadSchema = z.object({
  image: z.string().min(1, 'Image data is required'),
  folder: z.string().optional().default('stackit')
})

export default defineEventHandler(async (event) => {
  try {
    // Check authentication
    const token = getCookie(event, 'auth-token')
    if (!token) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required'
      })
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    
    // Verify user exists and is active
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })
    
    if (!user || !user.isActive) {
      throw createError({
        statusCode: 401,
        statusMessage: 'User not found or inactive'
      })
    }
    
    const body = await readBody(event)
    const { image, folder } = uploadSchema.parse(body)
    
    // Upload image to Cloudinary
    const result = await uploadImage(image, folder)
    
    return {
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: result.url,
        publicId: result.public_id,
        width: result.width,
        height: result.height
      }
    }
    
  } catch (error: any) {
    console.error('Error uploading image:', error)
    
    if (error.issues) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation error',
        data: error.issues
      })
    }
    
    if (error.name === 'JsonWebTokenError') {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid token'
      })
    }
    
    if (error.name === 'TokenExpiredError') {
      throw createError({
        statusCode: 401,
        statusMessage: 'Token expired'
      })
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
}) 