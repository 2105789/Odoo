import { prisma } from '~/lib/prisma'
import { z } from 'zod'

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
  search: z.string().optional(),
  tag: z.string().optional(),
  sort: z.enum(['newest', 'oldest', 'most_voted', 'most_answers']).default('newest')
})

export default defineEventHandler(async (event) => {
  try {
    const query = await getQuery(event)
    const { page, limit, search, tag, sort } = querySchema.parse(query)
    
    const skip = (page - 1) * limit
    
    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (tag) {
      where.tags = {
        some: {
          tag: {
            name: { equals: tag, mode: 'insensitive' }
          }
        }
      }
    }
    
    // Build order by clause
    let orderBy: any = {}
    switch (sort) {
      case 'newest':
        orderBy = { createdAt: 'desc' }
        break
      case 'oldest':
        orderBy = { createdAt: 'asc' }
        break
      case 'most_voted':
        orderBy = { votes: { _count: 'desc' } }
        break
      case 'most_answers':
        orderBy = { answers: { _count: 'desc' } }
        break
    }
    
    const [questions, totalCount] = await Promise.all([
      prisma.question.findMany({
        where,
        orderBy,
        skip,
        take: limit,
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
            select: {
              id: true,
              isAccepted: true
            }
          },
          votes: {
            select: {
              type: true
            }
          },
          _count: {
            select: {
              answers: true,
              votes: true
            }
          }
        }
      }),
      prisma.question.count({ where })
    ])
    
    // Calculate vote scores and format data
    const formattedQuestions = questions.map(question => {
      const upvotes = question.votes.filter(vote => vote.type === 'UPVOTE').length
      const downvotes = question.votes.filter(vote => vote.type === 'DOWNVOTE').length
      const score = upvotes - downvotes
      const hasAcceptedAnswer = question.answers.some(answer => answer.isAccepted)
      
      return {
        id: question.id,
        title: question.title,
        description: question.description,
        author: question.author,
        tags: question.tags.map(qt => qt.tag),
        answerCount: question._count.answers,
        voteScore: score,
        hasAcceptedAnswer,
        createdAt: question.createdAt,
        updatedAt: question.updatedAt
      }
    })
    
    return {
      success: true,
      data: {
        questions: formattedQuestions,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasNext: page < Math.ceil(totalCount / limit),
          hasPrev: page > 1
        }
      }
    }
    
  } catch (error: any) {
    console.error('Error fetching questions:', error)
    
    if (error.issues) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid query parameters',
        data: error.issues
      })
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
}) 