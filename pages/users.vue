<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Users</h1>
      <p class="text-gray-600">Browse community members and their contributions</p>
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
          placeholder="Search users..."
          class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          @input="debouncedSearch"
        >
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <!-- Users Grid -->
    <div v-else-if="users.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div
        v-for="user in users"
        :key="user.id"
        class="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
      >
        <div class="flex items-center mb-4">
          <div class="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
            <span class="text-white font-medium text-lg">
              {{ getUserInitials(user.firstName, user.lastName) }}
            </span>
          </div>
          <div class="ml-4">
            <h3 class="text-lg font-medium text-gray-900">
              {{ user.firstName }} {{ user.lastName }}
            </h3>
            <p class="text-sm text-gray-500">{{ user.email }}</p>
          </div>
        </div>
        
        <div class="flex items-center justify-between text-sm text-gray-600">
          <span class="flex items-center">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            {{ user.questionCount || 0 }} questions
          </span>
          <span class="flex items-center">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
            </svg>
            {{ user.answerCount || 0 }} answers
          </span>
        </div>
        
        <div class="mt-4 flex items-center justify-between">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                :class="user.role === 'ADMIN' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'">
            {{ user.role }}
          </span>
          <span class="text-xs text-gray-500">
            Joined {{ formatDate(user.createdAt) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">No users found</h3>
      <p class="mt-1 text-sm text-gray-500">
        {{ searchQuery ? 'Try searching for different keywords.' : 'No users have been registered yet.' }}
      </p>
    </div>

    <!-- Load More Button -->
    <div v-if="!loading && users.length > 0 && canLoadMore" class="mt-8 flex justify-center">
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
const users = ref([])
const loading = ref(true)
const loadingMore = ref(false)
const canLoadMore = ref(true)
const currentLimit = ref(20)

// Debounced search
let searchTimeout
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchUsers(true)
  }, 300)
}

const fetchUsers = async (reset = false) => {
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
    
    const response = await $fetch('/api/users', {
      query: params
    })
    
    if (response.success) {
      users.value = response.data
      // If we got fewer users than requested, we can't load more
      canLoadMore.value = response.data.length === currentLimit.value
    }
  } catch (error) {
    console.error('Error fetching users:', error)
    // Show mock data for now since we don't have a users API endpoint
    users.value = [
      {
        id: '1',
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        role: 'ADMIN',
        questionCount: 5,
        answerCount: 12,
        createdAt: new Date().toISOString()
      }
    ]
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

const loadMore = async () => {
  if (loadingMore.value) return
  
  loadingMore.value = true
  currentLimit.value += 20
  await fetchUsers()
}

const getUserInitials = (firstName, lastName) => {
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short'
  })
}

// Fetch users on component mount
onMounted(() => {
  fetchUsers()
})

// Watch for search query changes
watch(searchQuery, () => {
  debouncedSearch()
})
</script> 