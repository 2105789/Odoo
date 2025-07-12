import { prisma } from '~/lib/prisma'
import jwt from 'jsonwebtoken'
import { z } from 'zod'

const createQuestionSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters').max(200, 'Title must be less than 200 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  tags: z.array(z.string().min(1, 'Tag cannot be empty')).min(1, 'At least one tag is required').max(5, 'Maximum 5 tags allowed')
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
    const { title, description, tags } = createQuestionSchema.parse(body)
    
    // Create or get tags
    const tagObjects = await Promise.all(
      tags.map(async (tagName) => {
        const normalizedName = tagName.toLowerCase().trim()
        return await prisma.tag.upsert({
          where: { name: normalizedName },
          create: { 
            name: normalizedName,
            description: `Tag for ${normalizedName}` 
          },
          update: {}
        })
      })
    )
    
    // Create question with tags
    const question = await prisma.question.create({
      data: {
        title,
        description,
        authorId: user.id,
        tags: {
          create: tagObjects.map(tag => ({
            tagId: tag.id
          }))
        }
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
        tags: {
          include: {
            tag: true
          }
        },
        _count: {
          select: {
            answers: true,
            votes: true
          }
        }
      }
    })
    
    // Trigger AI answer generation in background with random delay (5-30 seconds)
    const aiDelay = Math.floor(Math.random() * 25000) + 5000 // 5-30 seconds
    
    // Call AI answer generation in background
    setTimeout(async () => {
      try {
        const response = await fetch(`${process.env.BASE_URL || 'http://localhost:3000'}/api/ai/generate-answer`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            questionId: question.id,
            delay: 0 // Generate immediately since we already have the delay here
          })
        })
        
        if (!response.ok) {
          console.error('AI answer generation failed:', response.statusText)
        } else {
          console.log(`AI answer generation triggered for question ${question.id}`)
        }
      } catch (error) {
        console.error('Failed to trigger AI answer generation:', error)
      }
    }, aiDelay)

    return {
      success: true,
      message: 'Question created successfully',
      data: {
        id: question.id,
        title: question.title,
        description: question.description,
        author: question.author,
        tags: question.tags.map((qt: any) => qt.tag),
        answerCount: question._count.answers,
        voteScore: 0,
        hasAcceptedAnswer: false,
        createdAt: question.createdAt,
        updatedAt: question.updatedAt
      }
    }
    
  } catch (error: any) {
    console.error('Error creating question:', error)
    
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