import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createAIBot() {
  try {
    // Check if AI bot already exists
    const existingBot = await prisma.user.findUnique({
      where: { email: 'aibot@stackit.ai' }
    })

    if (existingBot) {
      console.log('AI Bot already exists:', existingBot.email)
      return existingBot
    }

    // Create AI bot user
    const hashedPassword = await bcrypt.hash('aibot-secure-password-2024', 12)
    
    const aiBot = await prisma.user.create({
      data: {
        email: 'aibot@stackit.ai',
        password: hashedPassword,
        firstName: 'AI',
        lastName: 'Assistant',
        role: 'USER',
        isActive: true
      }
    })

    console.log('AI Bot created successfully:', aiBot.email)
    console.log('AI Bot ID:', aiBot.id)
    
    return aiBot
  } catch (error) {
    console.error('Error creating AI bot:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

createAIBot()
  .then(() => {
    console.log('AI Bot setup completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Failed to create AI bot:', error)
    process.exit(1)
  }) 