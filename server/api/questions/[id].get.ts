import { prisma } from '~/lib/prisma'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  try {
    const questionId = getRouterParam(event, 'id')
    
    if (!questionId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Question ID is required'
      })
    }
    
    // Get current user if authenticated
    let currentUserId: string | null = null
    const token = getCookie(event, 'auth-token')
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
        currentUserId = decoded.userId
      } catch (error) {
        // Token invalid, but we still allow viewing questions
        currentUserId = null
      }
    }
    
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
        },
        tags: {
          include: {
            tag: true
          }
        },
        answers: {
          include: {
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            },
            votes: {
              select: {
                type: true,
                userId: true
              }
            },
            _count: {
              select: {
                votes: true
              }
            }
          },
          orderBy: [
            { isAccepted: 'desc' },
            { createdAt: 'asc' }
          ]
        },
        votes: {
          select: {
            type: true,
            userId: true
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
    
    if (!question) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Question not found'
      })
    }
    
    // Calculate vote scores and user votes
    const questionUpvotes = question.votes.filter(vote => vote.type === 'UPVOTE').length
    const questionDownvotes = question.votes.filter(vote => vote.type === 'DOWNVOTE').length
    const questionScore = questionUpvotes - questionDownvotes
    const userQuestionVote = currentUserId ? question.votes.find(vote => vote.userId === currentUserId)?.type || null : null
    
    // Format answers with vote information
    const formattedAnswers = question.answers.map(answer => {
      const upvotes = answer.votes.filter(vote => vote.type === 'UPVOTE').length
      const downvotes = answer.votes.filter(vote => vote.type === 'DOWNVOTE').length
      const score = upvotes - downvotes
      const userVote = currentUserId ? answer.votes.find(vote => vote.userId === currentUserId)?.type || null : null
      
      return {
        id: answer.id,
        content: answer.content,
        author: answer.author,
        isAccepted: answer.isAccepted,
        voteScore: score,
        userVote,
        createdAt: answer.createdAt,
        updatedAt: answer.updatedAt
      }
    })
    
    return {
      success: true,
      data: {
        id: question.id,
        title: question.title,
        description: question.description,
        author: question.author,
        tags: question.tags.map(qt => qt.tag),
        answers: formattedAnswers,
        answerCount: question._count.answers,
        voteScore: questionScore,
        userVote: userQuestionVote,
        hasAcceptedAnswer: question.answers.some(answer => answer.isAccepted),
        canEdit: currentUserId === question.authorId,
        createdAt: question.createdAt,
        updatedAt: question.updatedAt
      }
    }
    
  } catch (error: any) {
    console.error('Error fetching question:', error)
    
    if (error.name === 'JsonWebTokenError') {
      // Invalid token, but still allow viewing
      console.log('Invalid token, allowing anonymous view')
    }
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
}) 