import { prisma } from '~/lib/prisma'
import jwt from 'jsonwebtoken'

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
    
    const answerId = getRouterParam(event, 'id')
    
    if (!answerId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Answer ID is required'
      })
    }
    
    // Get answer with question info
    const answer = await prisma.answer.findUnique({
      where: { id: answerId },
      include: {
        question: {
          include: {
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })
    
    if (!answer) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Answer not found'
      })
    }
    
    // Check if user is the question author
    if (answer.question.authorId !== user.id) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Only the question author can accept answers'
      })
    }
    
    // Start transaction to update answer and question
    const result = await prisma.$transaction(async (prisma) => {
      // First, unaccept any currently accepted answer for this question
      await prisma.answer.updateMany({
        where: {
          questionId: answer.questionId,
          isAccepted: true
        },
        data: {
          isAccepted: false
        }
      })
      
      // Accept the selected answer
      const updatedAnswer = await prisma.answer.update({
        where: { id: answerId },
        data: { isAccepted: true }
      })
      
      // Update question to reference the accepted answer
      await prisma.question.update({
        where: { id: answer.questionId },
        data: { acceptedAnswerId: answerId }
      })
      
      return updatedAnswer
    })
    
    // Create notification for answer author (if not accepting own answer)
    if (answer.authorId !== user.id) {
      await prisma.notification.create({
        data: {
          userId: answer.authorId,
          type: 'ANSWER_ACCEPTED',
          title: 'Your answer has been accepted',
          message: `${user.firstName} ${user.lastName} accepted your answer to: "${answer.question.title}"`,
          entityId: answer.questionId,
          entityType: 'question'
        }
      })
    }
    
    return {
      success: true,
      message: 'Answer accepted successfully',
      data: {
        id: result.id,
        isAccepted: result.isAccepted,
        updatedAt: result.updatedAt
      }
    }
    
  } catch (error: any) {
    console.error('Error accepting answer:', error)
    
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