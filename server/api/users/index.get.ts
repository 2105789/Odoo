import { prisma } from '~/lib/prisma'
import { z } from 'zod'

const querySchema = z.object({
  search: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0)
})

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const { search, limit, offset } = querySchema.parse(query)
    
    const where = search ? {
      OR: [
        {
          firstName: {
            contains: search,
            mode: 'insensitive' as const
          }
        },
        {
          lastName: {
            contains: search,
            mode: 'insensitive' as const
          }
        },
        {
          email: {
            contains: search,
            mode: 'insensitive' as const
          }
        }
      ]
    } : {}
    
    const users = await prisma.user.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    })
    
    return {
      success: true,
      data: users.map(user => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        questionCount: 0, // Placeholder until we can properly count
        answerCount: 0    // Placeholder until we can properly count
      }))
    }
    
  } catch (error: any) {
    console.error('Error fetching users:', error)
    
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