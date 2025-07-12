<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Tags</h1>
      <p class="text-gray-600">Browse and discover topics by tags</p>
    </div>

    <!-- Search -->
    <div class="mb-8">
      <div class="relative max-w-md">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search tags..."
          class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          @input="debouncedSearch"
        >
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <!-- Tags Grid -->
    <div v-else-if="tags.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <div
        v-for="tag in tags"
        :key="tag.id"
        class="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
        @click="navigateToTag(tag.name)"
      >
        <div class="flex items-center justify-between mb-3">
          <span
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
            :style="{ backgroundColor: tag.color || '#3B82F6' }"
          >
            {{ tag.name }}
          </span>
          <span class="text-sm text-gray-500">
            {{ tag.questionCount }} {{ tag.questionCount === 1 ? 'question' : 'questions' }}
          </span>
        </div>
        <p v-if="tag.description" class="text-gray-600 text-sm line-clamp-3">
          {{ tag.description }}
        </p>
        <p v-else class="text-gray-400 text-sm italic">
          No description available
        </p>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">No tags found</h3>
      <p class="mt-1 text-sm text-gray-500">
        {{ searchQuery ? 'Try searching for different keywords.' : 'No tags have been created yet.' }}
      </p>
    </div>

    <!-- Load More Button -->
    <div v-if="!loading && tags.length > 0 && canLoadMore" class="mt-8 flex justify-center">
      <button
        @click="loadMore"
        :disabled="loadingMore"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg v-if="loadingMore" class="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        {{ loadingMore ? 'Loading...' : 'Load More' }}
      </button>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'auth'
})

const searchQuery = ref('')
const tags = ref([])
const loading = ref(true)
const loadingMore = ref(false)
const canLoadMore = ref(true)
const currentLimit = ref(20)

// Debounced search
let searchTimeout
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchTags(true)
  }, 300)
}

const fetchTags = async (reset = false) => {
  if (reset) {
    loading.value = true
    currentLimit.value = 20
    canLoadMore.value = true
  }
  
  try {
    const params = {
      limit: currentLimit.value
    }
    
    if (searchQuery.value) {
      params.search = searchQuery.value
    }
    
    const response = await $fetch('/api/tags', {
      query: params
    })
    
    if (response.success) {
      tags.value = response.data
      // If we got fewer tags than requested, we can't load more
      canLoadMore.value = response.data.length === currentLimit.value
    }
  } catch (error) {
    console.error('Error fetching tags:', error)
    tags.value = []
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

const loadMore = async () => {
  if (loadingMore.value) return
  
  loadingMore.value = true
  currentLimit.value += 20
  await fetchTags()
}

const navigateToTag = (tagName) => {
  navigateTo(`/questions?tag=${encodeURIComponent(tagName)}`)
}

// Fetch tags on component mount
onMounted(() => {
  fetchTags()
})

// Watch for search query changes
watch(searchQuery, () => {
  debouncedSearch()
})
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style> 