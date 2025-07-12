<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
      <p class="text-gray-600">Manage your account information and preferences</p>
    </div>

    <!-- Profile Card -->
    <div class="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <div class="flex items-center mb-6">
        <div class="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
          <span class="text-white font-medium text-2xl">
            {{ getUserInitials() }}
          </span>
        </div>
        <div class="ml-6">
          <h2 class="text-2xl font-bold text-gray-900">{{ user?.firstName }} {{ user?.lastName }}</h2>
          <p class="text-gray-600">{{ user?.email }}</p>
          <div class="mt-2 flex items-center space-x-4">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="user?.role === 'ADMIN' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'">
              {{ user?.role }}
            </span>
            <span class="text-sm text-gray-500">
              Member since {{ formatDate(user?.createdAt) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="text-center p-4 bg-gray-50 rounded-lg">
          <div class="text-2xl font-bold text-gray-900">{{ stats.questionCount }}</div>
          <div class="text-sm text-gray-600">Questions Asked</div>
        </div>
        <div class="text-center p-4 bg-gray-50 rounded-lg">
          <div class="text-2xl font-bold text-gray-900">{{ stats.answerCount }}</div>
          <div class="text-sm text-gray-600">Answers Given</div>
        </div>
        <div class="text-center p-4 bg-gray-50 rounded-lg">
          <div class="text-2xl font-bold text-gray-900">{{ stats.acceptedAnswers }}</div>
          <div class="text-sm text-gray-600">Accepted Answers</div>
        </div>
        <div class="text-center p-4 bg-gray-50 rounded-lg">
          <div class="text-2xl font-bold text-gray-900">{{ stats.totalVotes }}</div>
          <div class="text-sm text-gray-600">Total Votes</div>
        </div>
      </div>

      <!-- Edit Profile Button -->
      <div class="flex justify-end">
        <button
          @click="toggleEdit"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {{ isEditing ? 'Cancel' : 'Edit Profile' }}
        </button>
      </div>
    </div>

    <!-- Edit Profile Form -->
    <div v-if="isEditing" class="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Edit Profile</h3>
      
      <form @submit.prevent="updateProfile">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input
              v-model="editForm.firstName"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input
              v-model="editForm.lastName"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>
        
        <div class="mt-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            v-model="editForm.email"
            type="email"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div class="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            @click="toggleEdit"
            class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="updating"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {{ updating ? 'Updating...' : 'Update Profile' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Recent Activity -->
    <div class="bg-white rounded-lg shadow-sm border p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
      
      <div class="space-y-4">
        <div class="flex items-center justify-between py-2 border-b border-gray-100">
          <div class="flex items-center space-x-3">
            <NuxtLink
              to="/my-questions"
              class="text-blue-600 hover:text-blue-800 font-medium"
            >
              View My Questions
            </NuxtLink>
            <span class="text-gray-500">•</span>
            <span class="text-sm text-gray-600">{{ stats.questionCount }} questions</span>
          </div>
          <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </div>
        
        <div class="flex items-center justify-between py-2 border-b border-gray-100">
          <div class="flex items-center space-x-3">
            <NuxtLink
              to="/my-answers"
              class="text-blue-600 hover:text-blue-800 font-medium"
            >
              View My Answers
            </NuxtLink>
            <span class="text-gray-500">•</span>
            <span class="text-sm text-gray-600">{{ stats.answerCount }} answers</span>
          </div>
          <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'auth'
})

const user = ref(null)
const isEditing = ref(false)
const updating = ref(false)
const stats = ref({
  questionCount: 0,
  answerCount: 0,
  acceptedAnswers: 0,
  totalVotes: 0
})

const editForm = ref({
  firstName: '',
  lastName: '',
  email: ''
})

const fetchUser = async () => {
  try {
    const data = await $fetch('/api/auth/me')
    if (data?.success) {
      user.value = data.user
      editForm.value = {
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        email: data.user.email
      }
      await fetchUserStats()
    }
  } catch (error) {
    console.error('Failed to fetch user:', error)
    await navigateTo('/login')
  }
}

const fetchUserStats = async () => {
  try {
    if (!user.value) return
    
    // Get user's questions
    const questionsResponse = await $fetch('/api/questions', {
      query: { limit: 50, page: 1 }
    })
    
    let questionCount = 0
    let answerCount = 0
    let acceptedAnswers = 0
    let totalVotes = 0
    
    if (questionsResponse.success) {
      const allQuestions = questionsResponse.data.questions || []
      const userQuestions = allQuestions.filter(q => q.author.id === user.value.id)
      questionCount = userQuestions.length
      totalVotes += userQuestions.reduce((sum, q) => sum + q.voteScore, 0)
      
      // Count user's answers by checking each question
      for (const question of allQuestions) {
        try {
          const questionDetail = await $fetch(`/api/questions/${question.id}`)
          if (questionDetail.success && questionDetail.data.answers) {
            const userAnswersInQuestion = questionDetail.data.answers.filter(
              answer => answer.author.id === user.value.id
            )
            answerCount += userAnswersInQuestion.length
            acceptedAnswers += userAnswersInQuestion.filter(a => a.isAccepted).length
            totalVotes += userAnswersInQuestion.reduce((sum, a) => sum + a.voteScore, 0)
          }
        } catch (error) {
          console.warn(`Failed to fetch question ${question.id}:`, error)
        }
      }
    }
    
    stats.value = {
      questionCount,
      answerCount,
      acceptedAnswers,
      totalVotes
    }
  } catch (error) {
    console.error('Failed to fetch user stats:', error)
    stats.value = {
      questionCount: 0,
      answerCount: 0,
      acceptedAnswers: 0,
      totalVotes: 0
    }
  }
}

const toggleEdit = () => {
  isEditing.value = !isEditing.value
  if (isEditing.value) {
    // Reset form to current user data
    editForm.value = {
      firstName: user.value?.firstName || '',
      lastName: user.value?.lastName || '',
      email: user.value?.email || ''
    }
  }
}

const updateProfile = async () => {
  updating.value = true
  try {
    // This would need a proper API endpoint
    // For now, just update the local user data
    user.value.firstName = editForm.value.firstName
    user.value.lastName = editForm.value.lastName
    user.value.email = editForm.value.email
    
    isEditing.value = false
    
    // Show success message
    console.log('Profile updated successfully')
  } catch (error) {
    console.error('Failed to update profile:', error)
  } finally {
    updating.value = false
  }
}

const getUserInitials = () => {
  if (!user.value) return ''
  return `${user.value.firstName?.[0] || ''}${user.value.lastName?.[0] || ''}`.toUpperCase()
}

const formatDate = (dateString) => {
  if (!dateString) return ''
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