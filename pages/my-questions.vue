<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">My Questions</h1>
        <p class="text-gray-600 mt-1">Manage and track your questions</p>
      </div>
      <NuxtLink
        to="/questions/ask"
        class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Ask New Question
      </NuxtLink>
    </div>

    <!-- Stats Summary -->
    <div class="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="text-center">
          <div class="text-2xl font-bold text-gray-900">{{ stats.total }}</div>
          <div class="text-sm text-gray-600">Total Questions</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-green-600">{{ stats.answered }}</div>
          <div class="text-sm text-gray-600">Answered</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-yellow-600">{{ stats.pending }}</div>
          <div class="text-sm text-gray-600">Pending</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-blue-600">{{ stats.totalVotes }}</div>
          <div class="text-sm text-gray-600">Total Votes</div>
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
              placeholder="Search your questions..."
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
            @change="fetchQuestions"
          >
            <option value="all">All Questions</option>
            <option value="answered">Answered</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted Answer</option>
          </select>
        </div>

        <!-- Sort Options -->
        <div class="w-full md:w-48">
          <select
            v-model="sortBy"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            @change="fetchQuestions"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="most_voted">Most Voted</option>
            <option value="most_answers">Most Answers</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Questions List -->
    <div class="space-y-4">
      <div v-if="loading" class="text-center py-8">
        <div class="inline-flex items-center">
          <svg class="animate-spin h-6 w-6 mr-3" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
          Loading your questions...
        </div>
      </div>

      <div v-else-if="questions.length === 0" class="text-center py-8">
        <div class="text-gray-500">
          <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <p class="text-lg font-medium">No questions found</p>
          <p class="text-sm text-gray-400">
            {{ searchQuery ? 'Try adjusting your search terms' : 'You haven\'t asked any questions yet' }}
          </p>
          <div class="mt-4">
            <NuxtLink
              to="/questions/ask"
              class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ask Your First Question
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Question Cards -->
      <div v-else class="space-y-4">
        <div
          v-for="question in questions"
          :key="question.id"
          class="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <!-- Question Title -->
              <h3 class="text-lg font-semibold text-gray-900 mb-2">
                <NuxtLink
                  :to="`/questions/${question.id}`"
                  class="hover:text-blue-600 transition-colors"
                >
                  {{ question.title }}
                </NuxtLink>
              </h3>

              <!-- Question Description Preview -->
              <div class="text-gray-600 mb-3 line-clamp-2" v-html="getPreview(question.description)"></div>

              <!-- Tags -->
              <div class="flex flex-wrap gap-2 mb-3">
                <span
                  v-for="tag in question.tags"
                  :key="tag.id"
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {{ tag.name }}
                </span>
              </div>

              <!-- Created Time -->
              <div class="text-sm text-gray-500">
                Asked {{ formatDate(question.createdAt) }}
              </div>
            </div>

            <!-- Stats -->
            <div class="ml-6 flex flex-col items-center space-y-3">
              <!-- Vote Score -->
              <div class="text-center">
                <div class="text-lg font-semibold text-gray-900">{{ question.voteScore }}</div>
                <div class="text-xs text-gray-500">votes</div>
              </div>

              <!-- Answer Count -->
              <div class="text-center">
                <div class="text-lg font-semibold" :class="question.hasAcceptedAnswer ? 'text-green-600' : 'text-gray-900'">
                  {{ question.answerCount }}
                </div>
                <div class="text-xs text-gray-500">answers</div>
              </div>

              <!-- Status Badge -->
              <div class="text-center">
                <span
                  v-if="question.hasAcceptedAnswer"
                  class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                >
                  <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                  </svg>
                  Solved
                </span>
                <span
                  v-else-if="question.answerCount > 0"
                  class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
                >
                  Answered
                </span>
                <span
                  v-else
                  class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                >
                  Pending
                </span>
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
const questions = ref([])
const loading = ref(true)
const stats = ref({
  total: 0,
  answered: 0,
  pending: 0,
  totalVotes: 0
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
    fetchQuestions()
  }, 300)
}

const fetchQuestions = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.value.page,
      limit: 10,
      sort: sortBy.value
    }
    
    if (searchQuery.value) {
      params.search = searchQuery.value
    }

    // Get all questions first, then filter by current user
    const response = await $fetch('/api/questions', { query: params })
    
    if (response.success) {
      // Get current user
      const userResponse = await $fetch('/api/auth/me')
      const currentUserId = userResponse.user?.id
      
      // Filter questions by current user
      const allQuestions = response.data.questions || []
      const userQuestions = allQuestions.filter(q => q.author.id === currentUserId)
      
      // Apply status filter
      let filteredQuestions = userQuestions
      if (statusFilter.value === 'answered') {
        filteredQuestions = userQuestions.filter(q => q.answerCount > 0)
      } else if (statusFilter.value === 'pending') {
        filteredQuestions = userQuestions.filter(q => q.answerCount === 0)
      } else if (statusFilter.value === 'accepted') {
        filteredQuestions = userQuestions.filter(q => q.hasAcceptedAnswer)
      }
      
      questions.value = filteredQuestions
      stats.value = {
        total: userQuestions.length,
        answered: userQuestions.filter(q => q.answerCount > 0).length,
        pending: userQuestions.filter(q => q.answerCount === 0).length,
        totalVotes: userQuestions.reduce((sum, q) => sum + q.voteScore, 0)
      }

      pagination.value = {
        page: 1,
        totalPages: 1,
        hasPrev: false,
        hasNext: false
      }
    } else {
      questions.value = []
      stats.value = { total: 0, answered: 0, pending: 0, totalVotes: 0 }
    }
  } catch (error) {
    console.error('Error fetching questions:', error)
    questions.value = []
    stats.value = { total: 0, answered: 0, pending: 0, totalVotes: 0 }
  } finally {
    loading.value = false
  }
}

const goToPage = (page) => {
  pagination.value.page = page
  fetchQuestions()
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

const getPreview = (description) => {
  if (!description) return ''
  // Simple preview - truncate at 150 characters
  return description.length > 150 ? description.substring(0, 150) + '...' : description
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Fetch questions on component mount
onMounted(() => {
  fetchQuestions()
})
</script> 