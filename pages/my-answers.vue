<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">My Answers</h1>
      <p class="text-gray-600 mt-1">View and manage your answers to community questions</p>
    </div>

    <!-- Stats Summary -->
    <div class="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="text-center">
          <div class="text-2xl font-bold text-gray-900">{{ stats.total }}</div>
          <div class="text-sm text-gray-600">Total Answers</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-green-600">{{ stats.accepted }}</div>
          <div class="text-sm text-gray-600">Accepted</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-blue-600">{{ stats.totalVotes }}</div>
          <div class="text-sm text-gray-600">Total Votes</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-purple-600">{{ stats.acceptanceRate }}%</div>
          <div class="text-sm text-gray-600">Acceptance Rate</div>
        </div>
      </div>
    </div>

    <!-- Filter and Sort Bar -->
    <div class="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <div class="flex flex-col md:flex-row gap-4">
        <!-- Search Input -->
        <div class="flex-1">
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search your answers..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              @input="debouncedSearch"
            />
            <svg
              class="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        <!-- Status Filter -->
        <div class="w-full md:w-48">
          <select
            v-model="statusFilter"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            @change="fetchAnswers"
          >
            <option value="all">All Answers</option>
            <option value="accepted">Accepted</option>
            <option value="not_accepted">Not Accepted</option>
          </select>
        </div>

        <!-- Sort Options -->
        <div class="w-full md:w-48">
          <select
            v-model="sortBy"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            @change="fetchAnswers"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="most_voted">Most Voted</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Answers List -->
    <div class="space-y-4">
      <div v-if="loading" class="text-center py-8">
        <div class="inline-flex items-center">
          <svg class="animate-spin h-6 w-6 mr-3" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
          Loading your answers...
        </div>
      </div>

      <div v-else-if="answers.length === 0" class="text-center py-8">
        <div class="text-gray-500">
          <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
          </svg>
          <p class="text-lg font-medium">No answers found</p>
          <p class="text-sm text-gray-400">
            {{ searchQuery ? 'Try adjusting your search terms' : 'You haven\'t provided any answers yet' }}
          </p>
          <div class="mt-4">
            <NuxtLink
              to="/questions"
              class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Questions to Answer
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Answer Cards -->
      <div v-else class="space-y-4">
        <div
          v-for="answer in answers"
          :key="answer.id"
          class="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow"
        >
          <!-- Question Context -->
          <div class="mb-4 p-4 bg-gray-50 rounded-lg">
            <h3 class="font-medium text-gray-900 mb-2">
              <NuxtLink
                :to="`/questions/${answer.questionId}`"
                class="hover:text-blue-600 transition-colors"
              >
                {{ answer.question.title }}
              </NuxtLink>
            </h3>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="tag in answer.question.tags"
                :key="tag.id"
                class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {{ tag.name }}
              </span>
            </div>
          </div>

          <div class="flex items-start justify-between">
            <div class="flex-1">
              <!-- Answer Content -->
              <div class="text-gray-700 mb-4 prose max-w-none" v-html="getAnswerPreview(answer.content)"></div>

              <!-- Answer Meta -->
              <div class="flex items-center text-sm text-gray-500 space-x-4">
                <span>Answered {{ formatDate(answer.createdAt) }}</span>
                <span v-if="answer.updatedAt && answer.updatedAt !== answer.createdAt">
                  • Updated {{ formatDate(answer.updatedAt) }}
                </span>
              </div>
            </div>

            <!-- Stats and Status -->
            <div class="ml-6 flex flex-col items-center space-y-3">
              <!-- Vote Score -->
              <div class="text-center">
                <div class="text-lg font-semibold text-gray-900">{{ answer.voteScore }}</div>
                <div class="text-xs text-gray-500">votes</div>
              </div>

              <!-- Accepted Status -->
              <div v-if="answer.isAccepted" class="text-center">
                <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <svg class="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                  </svg>
                </div>
                <div class="text-xs text-green-600 font-medium mt-1">Accepted</div>
              </div>

              <!-- Action Buttons -->
              <div class="flex flex-col space-y-2">
                <NuxtLink
                  :to="`/questions/${answer.questionId}`"
                  class="text-xs text-blue-600 hover:text-blue-800 text-center"
                >
                  View Question
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="pagination.totalPages > 1" class="mt-8 flex justify-center">
      <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
        <button
          @click="goToPage(pagination.page - 1)"
          :disabled="!pagination.hasPrev"
          class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span class="sr-only">Previous</span>
          <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd"></path>
          </svg>
        </button>

        <button
          v-for="page in visiblePages"
          :key="page"
          @click="goToPage(page)"
          :class="[
            page === pagination.page
              ? 'bg-blue-50 border-blue-500 text-blue-600'
              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50',
            'relative inline-flex items-center px-4 py-2 border text-sm font-medium'
          ]"
        >
          {{ page }}
        </button>

        <button
          @click="goToPage(pagination.page + 1)"
          :disabled="!pagination.hasNext"
          class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span class="sr-only">Next</span>
          <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
          </svg>
        </button>
      </nav>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'auth'
})

const searchQuery = ref('')
const statusFilter = ref('all')
const sortBy = ref('newest')
const answers = ref([])
const loading = ref(true)
const stats = ref({
  total: 0,
  accepted: 0,
  totalVotes: 0,
  acceptanceRate: 0
})

const pagination = ref({
  page: 1,
  totalPages: 1,
  hasPrev: false,
  hasNext: false
})

// Debounced search
let searchTimeout
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchAnswers()
  }, 300)
}

const fetchAnswers = async () => {
  loading.value = true
  try {
    // Get current user first
    const userResponse = await $fetch('/api/auth/me')
    const currentUserId = userResponse.user?.id
    
    if (!currentUserId) {
      throw new Error('User not authenticated')
    }

    // Get all questions to find answers by current user
    const questionsResponse = await $fetch('/api/questions', { 
      query: { limit: 50, page: 1 } // Get more questions to find user's answers
    })
    
    if (questionsResponse.success) {
      const allQuestions = questionsResponse.data.questions || []
      const userAnswers = []
      
      // Get detailed question data to find user's answers
      for (const question of allQuestions) {
        try {
          const questionDetail = await $fetch(`/api/questions/${question.id}`)
          if (questionDetail.success && questionDetail.data.answers) {
            const userAnswersInQuestion = questionDetail.data.answers.filter(
              answer => answer.author.id === currentUserId
            )
            
            // Add question context to each answer
            userAnswersInQuestion.forEach(answer => {
              userAnswers.push({
                ...answer,
                question: {
                  title: questionDetail.data.title,
                  tags: questionDetail.data.tags
                }
              })
            })
          }
        } catch (error) {
          console.warn(`Failed to fetch question ${question.id}:`, error)
        }
      }
      
      // Apply status filter
      let filteredAnswers = userAnswers
      if (statusFilter.value === 'accepted') {
        filteredAnswers = userAnswers.filter(a => a.isAccepted)
      } else if (statusFilter.value === 'not_accepted') {
        filteredAnswers = userAnswers.filter(a => !a.isAccepted)
      }
      
      // Apply search filter
      if (searchQuery.value) {
        filteredAnswers = filteredAnswers.filter(a => 
          a.content.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          a.question.title.toLowerCase().includes(searchQuery.value.toLowerCase())
        )
      }
      
      answers.value = filteredAnswers
      
      const accepted = userAnswers.filter(a => a.isAccepted).length
      stats.value = {
        total: userAnswers.length,
        accepted: accepted,
        totalVotes: userAnswers.reduce((sum, a) => sum + a.voteScore, 0),
        acceptanceRate: userAnswers.length > 0 ? Math.round((accepted / userAnswers.length) * 100) : 0
      }

      pagination.value = {
        page: 1,
        totalPages: 1,
        hasPrev: false,
        hasNext: false
      }
    } else {
      answers.value = []
      stats.value = { total: 0, accepted: 0, totalVotes: 0, acceptanceRate: 0 }
    }
  } catch (error) {
    console.error('Error fetching answers:', error)
    answers.value = []
    stats.value = { total: 0, accepted: 0, totalVotes: 0, acceptanceRate: 0 }
  } finally {
    loading.value = false
  }
}

const goToPage = (page) => {
  pagination.value.page = page
  fetchAnswers()
}

const visiblePages = computed(() => {
  const total = pagination.value.totalPages
  const current = pagination.value.page
  const pages = []
  
  for (let i = Math.max(1, current - 2); i <= Math.min(total, current + 2); i++) {
    pages.push(i)
  }
  
  return pages
})

const getAnswerPreview = (content) => {
  if (!content) return ''
  // Simple preview - truncate at 200 characters
  return content.length > 200 ? content.substring(0, 200) + '...' : content
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Fetch answers on component mount
onMounted(() => {
  fetchAnswers()
})
</script> 