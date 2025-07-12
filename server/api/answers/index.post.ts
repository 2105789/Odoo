import { prisma } from '~/lib/prisma'
import jwt from 'jsonwebtoken'
import { z } from 'zod'

const createAnswerSchema = z.object({
  content: z.string().min(20, 'Answer must be at least 20 characters'),
  questionId: z.string().cuid('Invalid question ID')
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
    const { content, questionId } = createAnswerSchema.parse(body)
    
    // Check if question exists
    const question = await prisma.question.findUnique({
      where: { id: questionId },
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
    })
    
    if (!question) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Question not found'
      })
    }
    
    // Create answer
    const answer = await prisma.answer.create({
      data: {
        content,
        authorId: user.id,
        questionId
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        _count: {
          select: {
            votes: true
          }
        }
      }
    })
    
    // Create notification for question author (if not answering own question)
    if (question.authorId !== user.id) {
      await prisma.notification.create({
        data: {
          userId: question.authorId,
          type: 'QUESTION_ANSWERED',
          title: 'Your question has been answered',
          message: `${user.firstName} ${user.lastName} answered your question: "${question.title}"`,
          entityId: questionId,
          entityType: 'question'
        }
      })
    }
    
    return {
      success: true,
      message: 'Answer created successfully',
      data: {
        id: answer.id,
        content: answer.content,
        author: answer.author,
        isAccepted: answer.isAccepted,
        voteScore: 0,
        userVote: null,
        createdAt: answer.createdAt,
        updatedAt: answer.updatedAt
      }
    }
    
  } catch (error: any) {
    console.error('Error creating answer:', error)
    
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