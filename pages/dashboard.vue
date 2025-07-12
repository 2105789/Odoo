<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <h1 class="text-xl font-semibold text-gray-900">Dashboard</h1>
            </div>
          </div>
          <div class="flex items-center">
            <button
              @click="handleLogout"
              class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>

    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4">Welcome back!</h2>
            
            <div v-if="user" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Email</label>
                  <p class="mt-1 text-sm text-gray-900">{{ user.email }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Role</label>
                  <p class="mt-1 text-sm text-gray-900">{{ user.role }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">First Name</label>
                  <p class="mt-1 text-sm text-gray-900">{{ user.firstName }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Last Name</label>
                  <p class="mt-1 text-sm text-gray-900">{{ user.lastName }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Account Status</label>
                  <span class="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        :class="user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                    {{ user.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Member Since</label>
                  <p class="mt-1 text-sm text-gray-900">{{ formatDate(user.createdAt) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: ['auth']
})

const user = ref(null)

const fetchUser = async () => {
  try {
    const data = await $fetch('/api/auth/me')
    if (data?.success) {
      user.value = data.user
    }
  } catch (error) {
    console.error('Failed to fetch user:', error)
    await navigateTo('/login')
  }
}

const { logout } = useAuth()

const handleLogout = async () => {
  await logout()
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Fetch user data on mount
onMounted(() => {
  fetchUser()
})
</script> 