import { prisma } from '~/lib/prisma'
import { z } from 'zod'

const querySchema = z.object({
  search: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(20)
})

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const { search, limit } = querySchema.parse(query)
    
    const where = search ? {
      name: {
        contains: search,
        mode: 'insensitive' as const
      }
    } : {}
    
    const tags = await prisma.tag.findMany({
      where,
      take: limit,
      orderBy: {
        name: 'asc'
      },
      include: {
        _count: {
          select: {
            questions: true
          }
        }
      }
    })
    
    return {
      success: true,
      data: tags.map(tag => ({
        id: tag.id,
        name: tag.name,
        description: tag.description,
        color: tag.color,
        questionCount: tag._count.questions,
        createdAt: tag.createdAt
      }))
    }
    
  } catch (error: any) {
    console.error('Error fetching tags:', error)
    
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