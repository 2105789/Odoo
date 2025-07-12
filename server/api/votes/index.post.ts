import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import { z } from 'zod'

const prisma = new PrismaClient()

const voteSchema = z.object({
  type: z.enum(['UPVOTE', 'DOWNVOTE']),
  questionId: z.string().cuid().optional(),
  answerId: z.string().cuid().optional()
}).refine(data => data.questionId || data.answerId, {
  message: "Either questionId or answerId must be provided"
}).refine(data => !(data.questionId && data.answerId), {
  message: "Cannot vote on both question and answer at the same time"
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
    const { type, questionId, answerId } = voteSchema.parse(body)
    
    // Check if entity exists
    if (questionId) {
      const question = await prisma.question.findUnique({
        where: { id: questionId },
        select: { id: true, authorId: true }
      })
      
      if (!question) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Question not found'
        })
      }
      
      // Prevent voting on own question
      if (question.authorId === user.id) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Cannot vote on your own question'
        })
      }
    }
    
    if (answerId) {
      const answer = await prisma.answer.findUnique({
        where: { id: answerId },
        select: { id: true, authorId: true }
      })
      
      if (!answer) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Answer not found'
        })
      }
      
      // Prevent voting on own answer
      if (answer.authorId === user.id) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Cannot vote on your own answer'
        })
      }
    }
    
    // Check if user already voted on this item
    const existingVote = await prisma.vote.findFirst({
      where: {
        userId: user.id,
        ...(questionId && { questionId }),
        ...(answerId && { answerId })
      }
    })
    
    let vote
    if (existingVote) {
      if (existingVote.type === type) {
        // Same vote type, remove the vote (toggle off)
        await prisma.vote.delete({
          where: { id: existingVote.id }
        })
        
        return {
          success: true,
          message: 'Vote removed',
          data: {
            action: 'removed',
            type: null
          }
        }
      } else {
        // Different vote type, update the vote
        vote = await prisma.vote.update({
          where: { id: existingVote.id },
          data: { type }
        })
        
        return {
          success: true,
          message: 'Vote updated',
          data: {
            action: 'updated',
            type: vote.type
          }
        }
      }
    } else {
      // No existing vote, create new one
      vote = await prisma.vote.create({
        data: {
          userId: user.id,
          type,
          ...(questionId && { questionId }),
          ...(answerId && { answerId })
        }
      })
      
      return {
        success: true,
        message: 'Vote created',
        data: {
          action: 'created',
          type: vote.type
        }
      }
    }
    
  } catch (error: any) {
    console.error('Error processing vote:', error)
    
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