import { prisma } from '~/lib/prisma'
import { generateAnswer, shouldGenerateAIAnswer } from '~/server/utils/aiService'
import { z } from 'zod'

const generateAnswerSchema = z.object({
  questionId: z.string().min(1, 'Question ID is required'),
  delay: z.number().min(0).max(300000).optional().default(5000) // Default 5 seconds delay, max 5 minutes
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { questionId, delay } = generateAnswerSchema.parse(body)
    
    // Get the question details
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      select: {
        id: true,
        title: true,
        description: true,
        authorId: true
      }
    })
    
    if (!question) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Question not found'
      })
    }
    
    // Get the AI bot user
    const aiBot = await prisma.user.findUnique({
      where: { email: 'aibot@stackit.ai' },
      select: { id: true }
    })
    
    if (!aiBot) {
      throw createError({
        statusCode: 500,
        statusMessage: 'AI Bot user not found'
      })
    }
    
    // Check if AI should generate an answer for this question
    const shouldGenerate = await shouldGenerateAIAnswer(question.title, question.description)
    
    if (!shouldGenerate) {
      return {
        success: false,
        message: 'AI determined this question is not suitable for automatic answering',
        reason: 'SKIPPED_BY_HEURISTICS'
      }
    }
    
    // Check if AI bot has already answered this question
    const existingAiAnswer = await prisma.answer.findFirst({
      where: {
        questionId: question.id,
        authorId: aiBot.id
      }
    })
    
    if (existingAiAnswer) {
      return {
        success: false,
        message: 'AI has already answered this question',
        reason: 'ALREADY_ANSWERED'
      }
    }
    
    // Generate AI answer with delay if specified
    if (delay > 0) {
      // Return immediately and process in background
      setTimeout(async () => {
        try {
          await generateAndSaveAnswer(question, aiBot.id)
        } catch (error) {
          console.error('Background AI answer generation failed:', error)
        }
      }, delay)
      
      return {
        success: true,
        message: `AI answer will be generated in ${delay / 1000} seconds`,
        questionId: question.id,
        delay: delay
      }
    } else {
      // Generate immediately
      const answer = await generateAndSaveAnswer(question, aiBot.id)
      
      return {
        success: true,
        message: 'AI answer generated successfully',
        answer: {
          id: answer.id,
          content: answer.content,
          questionId: answer.questionId
        }
      }
    }
    
  } catch (error: any) {
    console.error('Error in AI answer generation:', error)
    
    if (error.issues) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation error',
        data: error.issues
      })
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

async function generateAndSaveAnswer(question: any, aiBotId: string) {
  try {
    // Generate AI answer
    const aiAnswerContent = await generateAnswer(question.title, question.description)
    
    // Save the answer to database
    const answer = await prisma.answer.create({
      data: {
        content: aiAnswerContent,
        authorId: aiBotId,
        questionId: question.id,
        isAccepted: false
      },
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
    
    // Create notification for question author
    if (question.authorId !== aiBotId) {
      await prisma.notification.create({
        data: {
          userId: question.authorId,
          type: 'QUESTION_ANSWERED',
          title: 'AI Assistant answered your question',
          message: `AI Assistant has provided an answer to your question: "${question.title}"`,
          entityId: answer.id,
          entityType: 'answer'
        }
      })
    }
    
    console.log(`AI answer generated for question ${question.id}`)
    return answer
    
  } catch (error) {
    console.error('Error generating and saving AI answer:', error)
    throw error
  }
} 