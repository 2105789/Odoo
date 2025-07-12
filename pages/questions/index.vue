<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Questions</h1>
        <p class="text-gray-600 mt-1">Ask questions and get answers from the community</p>
      </div>
      <NuxtLink
        to="/questions/ask"
        class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Ask Question
      </NuxtLink>
    </div>

    <!-- Search and Filter Bar -->
    <div class="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <div class="flex flex-col md:flex-row gap-4">
        <!-- Search Input -->
        <div class="flex-1">
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search questions..."
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

        <!-- Tag Filter -->
        <div class="w-full md:w-64">
          <select
            v-model="selectedTag"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            @change="fetchQuestions"
          >
            <option value="">All Tags</option>
            <option v-for="tag in tags" :key="tag.id" :value="tag.name">
              {{ tag.name }} ({{ tag.questionCount }})
            </option>
          </select>
        </div>

        <!-- Sort Options -->
        <div class="w-full md:w-48">
          <select
            v-model="sortBy"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            @change="fetchQuestions"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
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
          Loading questions...
        </div>
      </div>

      <div v-else-if="questions.length === 0" class="text-center py-8">
        <div class="text-gray-500">
          <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <p class="text-lg font-medium">No questions found</p>
          <p class="text-sm text-gray-400">Try adjusting your search or filters</p>
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
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 cursor-pointer hover:bg-blue-200"
                  @click="filterByTag(tag.name)"
                >
                  {{ tag.name }}
                </span>
              </div>

              <!-- Author and Time -->
              <div class="flex items-center text-sm text-gray-500">
                <span class="mr-4">
                  Asked by {{ question.author.firstName }} {{ question.author.lastName }}
                </span>
                <span>{{ formatDate(question.createdAt) }}</span>
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

              <!-- Accepted Answer Indicator -->
              <div v-if="question.hasAcceptedAnswer" class="text-center">
                <svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                </svg>
                <div class="text-xs text-green-600 font-medium">Answered</div>
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

<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

interface Question {
  id: string
  title: string
  description: string
  author: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  tags: Array<{
    id: string
    name: string
    color: string
  }>
  answerCount: number
  voteScore: number
  hasAcceptedAnswer: boolean
  createdAt: string
  updatedAt: string
}

interface Tag {
  id: string
  name: string
  questionCount: number
}

interface Pagination {
  page: number
  limit: number
  totalCount: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

const questions = ref<Question[]>([])
const tags = ref<Tag[]>([])
const pagination = ref<Pagination>({
  page: 1,
  limit: 10,
  totalCount: 0,
  totalPages: 0,
  hasNext: false,
  hasPrev: false
})

const searchQuery = ref('')
const selectedTag = ref('')
const sortBy = ref('newest')
const loading = ref(false)

// Debounced search
const debouncedSearch = debounce(() => {
  pagination.value.page = 1
  fetchQuestions()
}, 300)

const fetchQuestions = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams({
      page: pagination.value.page.toString(),
      limit: pagination.value.limit.toString(),
      sort: sortBy.value
    })
    
    if (searchQuery.value) {
      params.append('search', searchQuery.value)
    }
    
    if (selectedTag.value) {
      params.append('tag', selectedTag.value)
    }
    
    const response = await $fetch(`/api/questions?${params.toString()}`) as {
      success: boolean
      data: {
        questions: Question[]
        pagination: Pagination
      }
    }
    
    if (response.success) {
      questions.value = response.data.questions
      pagination.value = response.data.pagination
    }
  } catch (error) {
    console.error('Error fetching questions:', error)
  } finally {
    loading.value = false
  }
}

const fetchTags = async () => {
  try {
    const response = await $fetch('/api/tags') as {
      success: boolean
      data: Tag[]
    }
    if (response.success) {
      tags.value = response.data
    }
  } catch (error) {
    console.error('Error fetching tags:', error)
  }
}

const filterByTag = (tagName: string) => {
  selectedTag.value = tagName
  pagination.value.page = 1
  fetchQuestions()
}

const goToPage = (page: number) => {
  pagination.value.page = page
  fetchQuestions()
}

const getPreview = (html: string) => {
  // Strip HTML tags and limit to 150 characters
  const text = html.replace(/<[^>]*>/g, '')
  return text.length > 150 ? text.substring(0, 150) + '...' : text
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

const visiblePages = computed(() => {
  const total = pagination.value.totalPages
  const current = pagination.value.page
  const range = 2
  
  const start = Math.max(1, current - range)
  const end = Math.min(total, current + range)
  
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
})

// Utility function for debouncing
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Fetch data on component mount
onMounted(() => {
  fetchQuestions()
  fetchTags()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}</style> 