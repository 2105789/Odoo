import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import { z } from 'zod'

const prisma = new PrismaClient()

const markReadSchema = z.object({
  notificationIds: z.array(z.string().cuid()).optional(),
  markAll: z.boolean().default(false)
}).refine(data => data.notificationIds || data.markAll, {
  message: "Either notificationIds or markAll must be provided"
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
    
    // Get user from database
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
    const { notificationIds, markAll } = markReadSchema.parse(body)
    
    let result
    if (markAll) {
      // Mark all notifications as read for the user
      result = await prisma.notification.updateMany({
        where: {
          userId: user.id,
          isRead: false
        },
        data: {
          isRead: true
        }
      })
    } else {
      // Mark specific notifications as read
      result = await prisma.notification.updateMany({
        where: {
          id: {
            in: notificationIds
          },
          userId: user.id, // Ensure user can only mark their own notifications
          isRead: false
        },
        data: {
          isRead: true
        }
      })
    }
    
    return {
      success: true,
      message: markAll ? 'All notifications marked as read' : 'Notifications marked as read',
      data: {
        updatedCount: result.count
      }
    }
    
  } catch (error: any) {
    console.error('Error marking notifications as read:', error)
    
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