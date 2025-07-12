<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <!-- Hero Section -->
    <div class="relative overflow-hidden">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div class="text-center">
          <h1 class="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Welcome to
            <span class="text-blue-600">StackIt</span>
          </h1>
          <p class="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            A minimal Q&A platform for collaborative learning and knowledge sharing. 
            Ask questions, share knowledge, and learn together.
          </p>
          
          <!-- CTA Buttons -->
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <NuxtLink
              to="/questions"
              class="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
            >
              Browse Questions
            </NuxtLink>
            <NuxtLink
              v-if="isLoggedIn"
              to="/questions/ask"
              class="bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors shadow-lg border border-blue-200"
            >
              Ask a Question
            </NuxtLink>
            <NuxtLink
              v-else
              to="/register"
              class="bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors shadow-lg border border-blue-200"
            >
              Get Started
            </NuxtLink>
          </div>
        </div>
      </div>
      
      <!-- Decorative Elements -->
      <div class="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div class="absolute top-10 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20"></div>
        <div class="absolute top-32 right-20 w-16 h-16 bg-indigo-200 rounded-full opacity-20"></div>
        <div class="absolute bottom-20 left-20 w-12 h-12 bg-purple-200 rounded-full opacity-20"></div>
        <div class="absolute bottom-32 right-10 w-24 h-24 bg-blue-200 rounded-full opacity-20"></div>
      </div>
    </div>

    <!-- Features Section -->
    <div class="bg-white py-24">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose StackIt?
          </h2>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto">
            Built for developers, by developers. Our platform focuses on what matters most: getting answers and sharing knowledge.
          </p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Feature 1 -->
          <div class="text-center p-8 rounded-lg bg-blue-50">
            <div class="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-4">Ask & Answer</h3>
            <p class="text-gray-600">
              Post detailed questions with rich text formatting, images, and code examples. Get comprehensive answers from the community.
            </p>
          </div>

          <!-- Feature 2 -->
          <div class="text-center p-8 rounded-lg bg-green-50">
            <div class="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-4">Vote & Accept</h3>
            <p class="text-gray-600">
              Upvote helpful answers and downvote unhelpful ones. Question authors can accept the best answer to help others.
            </p>
          </div>

          <!-- Feature 3 -->
          <div class="text-center p-8 rounded-lg bg-purple-50">
            <div class="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-4">Tag & Organize</h3>
            <p class="text-gray-600">
              Tag your questions with relevant technologies. Search and filter by tags to find exactly what you're looking for.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Section -->
    <div class="bg-blue-600 py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div class="text-4xl font-bold text-white mb-2">{{ stats.questions }}+</div>
            <div class="text-blue-100">Questions Asked</div>
          </div>
          <div>
            <div class="text-4xl font-bold text-white mb-2">{{ stats.answers }}+</div>
            <div class="text-blue-100">Answers Given</div>
          </div>
          <div>
            <div class="text-4xl font-bold text-white mb-2">{{ stats.users }}+</div>
            <div class="text-blue-100">Active Users</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Questions -->
    <div class="bg-gray-50 py-24">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">Recent Questions</h2>
          <p class="text-gray-600">See what the community is asking about</p>
        </div>
        
        <div v-if="recentQuestions.length > 0" class="space-y-4">
          <div
            v-for="question in recentQuestions"
            :key="question.id"
            class="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-gray-900 mb-2">
                  <NuxtLink
                    :to="`/questions/${question.id}`"
                    class="hover:text-blue-600 transition-colors"
                  >
                    {{ question.title }}
                  </NuxtLink>
                </h3>
                <div class="flex flex-wrap gap-2 mb-3">
                  <span
                    v-for="tag in question.tags"
                    :key="tag.id"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {{ tag.name }}
                  </span>
                </div>
                <div class="text-sm text-gray-500">
                  Asked by {{ question.author.firstName }} {{ question.author.lastName }} • {{ formatDate(question.createdAt) }}
                </div>
              </div>
              <div class="ml-6 flex items-center space-x-4 text-sm text-gray-500">
                <div class="text-center">
                  <div class="font-semibold">{{ question.voteScore }}</div>
                  <div>votes</div>
                </div>
                <div class="text-center">
                  <div class="font-semibold">{{ question.answerCount }}</div>
                  <div>answers</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="text-center mt-8">
          <NuxtLink
            to="/questions"
            class="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            View All Questions
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- CTA Section -->
    <div class="bg-white py-24">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
          Ready to get started?
        </h2>
        <p class="text-xl text-gray-600 mb-8">
          Join our growing community of developers and start sharing knowledge today.
        </p>
        
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <NuxtLink
            v-if="!isLoggedIn"
            to="/register"
            class="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
          >
            Sign Up Free
          </NuxtLink>
          <NuxtLink
            v-else
            to="/questions/ask"
            class="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
          >
            Ask Your First Question
          </NuxtLink>
          <NuxtLink
            to="/questions"
            class="bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors shadow-lg border border-blue-200"
          >
            Browse Questions
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

interface Question {
  id: string
  title: string
  author: {
    firstName: string
    lastName: string
  }
  tags: Array<{
    id: string
    name: string
  }>
  answerCount: number
  voteScore: number
  createdAt: string
}

const { isLoggedIn } = useAuth()

const stats = reactive({
  questions: 0,
  answers: 0,
  users: 0
})

const recentQuestions = ref<Question[]>([])

const fetchStats = async () => {
  try {
    // You would implement this API endpoint
    const response = await $fetch('/api/stats') as {
      success: boolean
      data: {
        questions: number
        answers: number
        users: number
      }
    }
    
    if (response.success) {
      stats.questions = response.data.questions
      stats.answers = response.data.answers
      stats.users = response.data.users
    }
  } catch (error) {
    console.error('Error fetching stats:', error)
    // Use default values
    stats.questions = 150
    stats.answers = 420
    stats.users = 89
  }
}

const fetchRecentQuestions = async () => {
  try {
    const response = await $fetch('/api/questions?limit=5&sort=newest') as {
      success: boolean
      data: {
        questions: Question[]
      }
    }
    
    if (response.success) {
      recentQuestions.value = response.data.questions
    }
  } catch (error) {
    console.error('Error fetching recent questions:', error)
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) {
    return 'Yesterday'
  } else if (diffDays < 7) {
    return `${diffDays} days ago`
  } else {
    return date.toLocaleDateString()
  }
}

onMounted(() => {
  fetchStats()
  fetchRecentQuestions()
})
</script>

<style scoped>
/* Additional styles if needed */
</style> 