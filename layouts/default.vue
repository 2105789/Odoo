<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo and Main Navigation -->
          <div class="flex items-center">
            <NuxtLink to="/" class="flex items-center">
              <svg class="h-8 w-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd"></path>
              </svg>
              <span class="ml-2 text-xl font-bold text-gray-900">StackIt</span>
            </NuxtLink>
            
            <!-- Main Navigation Links -->
            <div class="ml-10 flex items-baseline space-x-8">
              <NuxtLink
                to="/questions"
                class="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                activeClass="text-blue-600 bg-blue-50"
              >
                Questions
              </NuxtLink>
              <NuxtLink
                to="/tags"
                class="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                activeClass="text-blue-600 bg-blue-50"
              >
                Tags
              </NuxtLink>
              <NuxtLink
                v-if="user && user.role === 'ADMIN'"
                to="/admin"
                class="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                activeClass="text-blue-600 bg-blue-50"
              >
                Admin
              </NuxtLink>
            </div>
          </div>

          <!-- Right Side Navigation -->
          <div class="flex items-center space-x-4">
            <!-- Ask Question Button -->
            <NuxtLink
              v-if="isLoggedIn"
              to="/questions/ask"
              class="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Ask Question
            </NuxtLink>

            <!-- Authenticated User Menu -->
            <div v-if="isLoggedIn" class="flex items-center space-x-3">
              <!-- Notifications -->
              <NotificationDropdown />

              <!-- User Menu -->
              <div class="relative">
                <button
                  @click="showUserMenu = !showUserMenu"
                  class="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span class="text-white font-medium">
                      {{ user?.firstName?.charAt(0) || 'U' }}
                    </span>
                  </div>
                </button>

                <!-- User Dropdown -->
                <div
                  v-if="showUserMenu"
                  class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200"
                >
                  <div class="px-4 py-3 border-b border-gray-200">
                    <p class="text-sm font-medium text-gray-900">{{ user?.firstName }} {{ user?.lastName }}</p>
                    <p class="text-sm text-gray-500">{{ user?.email }}</p>
                  </div>
                  <div class="py-1">
                    <NuxtLink
                      to="/profile"
                      class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      @click="showUserMenu = false"
                    >
                      Profile
                    </NuxtLink>
                    <NuxtLink
                      to="/dashboard"
                      class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      @click="showUserMenu = false"
                    >
                      Dashboard
                    </NuxtLink>
                    <NuxtLink
                      to="/my-questions"
                      class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      @click="showUserMenu = false"
                    >
                      My Questions
                    </NuxtLink>
                    <NuxtLink
                      to="/my-answers"
                      class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      @click="showUserMenu = false"
                    >
                      My Answers
                    </NuxtLink>
                    <div class="border-t border-gray-200"></div>
                    <button
                      @click="handleLogout"
                      class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Guest Menu -->
            <div v-else class="flex items-center space-x-3">
              <NuxtLink
                to="/login"
                class="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Login
              </NuxtLink>
              <NuxtLink
                to="/register"
                class="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Register
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="flex-1">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t border-gray-200 mt-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div class="flex items-center mb-4">
              <svg class="h-6 w-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd"></path>
              </svg>
              <span class="ml-2 text-lg font-bold text-gray-900">StackIt</span>
            </div>
            <p class="text-gray-600 text-sm">
              A minimal Q&A platform for collaborative learning and knowledge sharing.
            </p>
          </div>
          
          <div>
            <h3 class="text-sm font-semibold text-gray-900 mb-4">Community</h3>
            <ul class="space-y-2">
              <li>
                <NuxtLink to="/questions" class="text-gray-600 hover:text-gray-900 text-sm">Questions</NuxtLink>
              </li>
              <li>
                <NuxtLink to="/tags" class="text-gray-600 hover:text-gray-900 text-sm">Tags</NuxtLink>
              </li>
              <li>
                <NuxtLink to="/users" class="text-gray-600 hover:text-gray-900 text-sm">Users</NuxtLink>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 class="text-sm font-semibold text-gray-900 mb-4">Support</h3>
            <ul class="space-y-2">
              <li>
                <NuxtLink to="/help" class="text-gray-600 hover:text-gray-900 text-sm">Help Center</NuxtLink>
              </li>
              <li>
                <NuxtLink to="/guidelines" class="text-gray-600 hover:text-gray-900 text-sm">Guidelines</NuxtLink>
              </li>
              <li>
                <NuxtLink to="/contact" class="text-gray-600 hover:text-gray-900 text-sm">Contact Us</NuxtLink>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 class="text-sm font-semibold text-gray-900 mb-4">Legal</h3>
            <ul class="space-y-2">
              <li>
                <NuxtLink to="/privacy" class="text-gray-600 hover:text-gray-900 text-sm">Privacy Policy</NuxtLink>
              </li>
              <li>
                <NuxtLink to="/terms" class="text-gray-600 hover:text-gray-900 text-sm">Terms of Service</NuxtLink>
              </li>
            </ul>
          </div>
        </div>
        
        <div class="mt-8 pt-8 border-t border-gray-200 text-center">
          <p class="text-gray-600 text-sm">
            &copy; 2024 StackIt. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const { user, isLoggedIn, logout } = useAuth()
const showUserMenu = ref(false)

const handleLogout = async () => {
  showUserMenu.value = false
  await logout()
}

// Close user menu when clicking outside
onMounted(() => {
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement
    if (!target.closest('.relative')) {
      showUserMenu.value = false
    }
  })
})
</script>

<style scoped>
/* Additional styles if needed */
</style> 