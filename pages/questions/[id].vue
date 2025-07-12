<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <div class="inline-flex items-center">
        <svg class="animate-spin h-6 w-6 mr-3" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
        </svg>
        Loading question...
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-8">
      <div class="text-red-600">
        <svg class="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z"></path>
        </svg>
        <p class="text-lg font-medium">Question not found</p>
        <p class="text-sm text-gray-500">The question you're looking for doesn't exist or has been removed.</p>
        <NuxtLink
          to="/questions"
          class="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Questions
        </NuxtLink>
      </div>
    </div>

    <!-- Question Content -->
    <div v-else-if="question" class="space-y-6">
      <!-- Breadcrumb -->
      <nav class="text-sm text-gray-500">
        <NuxtLink to="/questions" class="hover:text-blue-600">Questions</NuxtLink>
        <span class="mx-2">›</span>
        <span class="text-gray-900">{{ question.title }}</span>
      </nav>

      <!-- Question -->
      <div class="bg-white rounded-lg shadow-sm border p-6">
        <div class="flex gap-6">
          <!-- Vote Controls -->
          <div class="flex flex-col items-center space-y-2">
            <button
              @click="voteOnQuestion('UPVOTE')"
              :disabled="!user || votingQuestion"
              :class="[
                'p-2 rounded-full transition-colors',
                question.userVote === 'UPVOTE' 
                  ? 'bg-green-100 text-green-600' 
                  : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'
              ]"
            >
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
              </svg>
            </button>
            
            <span class="text-lg font-semibold text-gray-900">{{ question.voteScore }}</span>
            
            <button
              @click="voteOnQuestion('DOWNVOTE')"
              :disabled="!user || votingQuestion"
              :class="[
                'p-2 rounded-full transition-colors',
                question.userVote === 'DOWNVOTE' 
                  ? 'bg-red-100 text-red-600' 
                  : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'
              ]"
            >
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 112 0v11.586l4.293-4.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
              </svg>
            </button>
          </div>

          <!-- Question Content -->
          <div class="flex-1">
            <h1 class="text-2xl font-bold text-gray-900 mb-4">{{ question.title }}</h1>
            
            <!-- Question Description -->
            <div class="prose max-w-none mb-6" v-html="question.description"></div>
            
            <!-- Tags -->
            <div class="flex flex-wrap gap-2 mb-4">
              <span
                v-for="tag in question.tags"
                :key="tag.id"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {{ tag.name }}
              </span>
            </div>
            
            <!-- Question Meta -->
            <div class="flex items-center justify-between text-sm text-gray-500">
              <div class="flex items-center space-x-4">
                <span>Asked by {{ question.author.firstName }} {{ question.author.lastName }}</span>
                <span>{{ formatDate(question.createdAt) }}</span>
              </div>
              <div v-if="question.canEdit" class="flex items-center space-x-2">
                <button class="text-blue-600 hover:text-blue-800">Edit</button>
                <button class="text-red-600 hover:text-red-800">Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- AI Answer Trigger -->
      <AIAnswerTrigger 
        :question-id="question.id" 
        :answers="question.answers"
        @answer-generated="fetchQuestion"
      />

      <!-- Answers Section -->
      <div class="bg-white rounded-lg shadow-sm border p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-6">
          {{ question.answerCount }} {{ question.answerCount === 1 ? 'Answer' : 'Answers' }}
        </h2>
        
        <!-- No Answers -->
        <div v-if="question.answers.length === 0" class="text-center py-8">
          <div class="text-gray-500">
            <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.471c-2.603 1.204-6.094.094-6.094-2.529s3.49-3.733 6.094-2.529A8.959 8.959 0 0113 4c4.418 0 8 3.582 8 8z"></path>
            </svg>
            <p class="text-lg font-medium">No answers yet</p>
            <p class="text-sm text-gray-400">Be the first to answer this question!</p>
          </div>
        </div>

        <!-- Answers List -->
        <div v-else class="space-y-6">
          <div
            v-for="answer in question.answers"
            :key="answer.id"
            class="border-l-4 pl-6"
            :class="answer.isAccepted ? 'border-green-500 bg-green-50' : 'border-gray-200'"
          >
            <div class="flex gap-6">
              <!-- Answer Vote Controls -->
              <div class="flex flex-col items-center space-y-2">
                <button
                  @click="voteOnAnswer(answer.id, 'UPVOTE')"
                  :disabled="!user || votingAnswer === answer.id"
                  :class="[
                    'p-2 rounded-full transition-colors',
                    answer.userVote === 'UPVOTE' 
                      ? 'bg-green-100 text-green-600' 
                      : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'
                  ]"
                >
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
                  </svg>
                </button>
                
                <span class="text-lg font-semibold text-gray-900">{{ answer.voteScore }}</span>
                
                <button
                  @click="voteOnAnswer(answer.id, 'DOWNVOTE')"
                  :disabled="!user || votingAnswer === answer.id"
                  :class="[
                    'p-2 rounded-full transition-colors',
                    answer.userVote === 'DOWNVOTE' 
                      ? 'bg-red-100 text-red-600' 
                      : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'
                  ]"
                >
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 112 0v11.586l4.293-4.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                  </svg>
                </button>
                
                <!-- Accept Answer Button -->
                <button
                  v-if="user && user.id === question.author.id && !answer.isAccepted"
                  @click="acceptAnswer(answer.id)"
                  :disabled="acceptingAnswer === answer.id"
                  class="p-2 rounded-full text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                  title="Accept this answer"
                >
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                  </svg>
                </button>
                
                <!-- Accepted Answer Indicator -->
                <div v-if="answer.isAccepted" class="text-green-600" title="Accepted answer">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                  </svg>
                </div>
              </div>

              <!-- Answer Content -->
              <div class="flex-1">
                <div class="prose max-w-none mb-4" v-html="getAnswerContent(answer)"></div>
                
                <div class="flex items-center justify-between text-sm text-gray-500">
                  <div class="flex items-center space-x-4">
                    <span>Answered by {{ answer.author.firstName }} {{ answer.author.lastName }}</span>
                    <span>{{ formatDate(answer.createdAt) }}</span>
                    <span v-if="answer.isAccepted" class="text-green-600 font-medium">✓ Accepted</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Add Answer Form -->
      <div v-if="user" class="bg-white rounded-lg shadow-sm border p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Your Answer</h3>
        
        <form @submit.prevent="submitAnswer" class="space-y-4">
          <div>
            <RichTextEditor
              v-model="answerForm.content"
              placeholder="Write your answer here. Be clear and helpful!"
            />
            <p v-if="answerForm.error" class="text-red-600 text-sm mt-1">{{ answerForm.error }}</p>
          </div>
          
          <div class="flex justify-end">
            <button
              type="submit"
              :disabled="answerForm.submitting"
              class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span v-if="answerForm.submitting">
                <svg class="animate-spin h-4 w-4 mr-2 inline" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
                Posting...
              </span>
              <span v-else>Post Answer</span>
            </button>
          </div>
        </form>
      </div>

      <!-- Login Prompt -->
      <div v-else class="bg-gray-50 rounded-lg border p-6 text-center">
        <p class="text-gray-600 mb-4">You must be logged in to post an answer.</p>
        <NuxtLink
          to="/login"
          class="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Login to Answer
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

interface Answer {
  id: string
  content: string
  author: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  isAccepted: boolean
  voteScore: number
  userVote: 'UPVOTE' | 'DOWNVOTE' | null
  createdAt: string
  updatedAt: string
}

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
  answers: Answer[]
  answerCount: number
  voteScore: number
  userVote: 'UPVOTE' | 'DOWNVOTE' | null
  hasAcceptedAnswer: boolean
  canEdit: boolean
  createdAt: string
  updatedAt: string
}

const route = useRoute()
const { user } = useAuth()
const { parseMarkdown } = useMarkdown()

const question = ref<Question | null>(null)
const parsedAnswers = ref<Map<string, string>>(new Map())
const loading = ref(true)
const error = ref(false)
const votingQuestion = ref(false)
const votingAnswer = ref<string | null>(null)
const acceptingAnswer = ref<string | null>(null)

const answerForm = reactive({
  content: '',
  submitting: false,
  error: ''
})

const fetchQuestion = async () => {
  loading.value = true
  error.value = false
  
  try {
    const response = await $fetch(`/api/questions/${route.params.id}`) as {
      success: boolean
      data: Question
    }
    
    if (response.success) {
      question.value = response.data
      // Clear parsed answers cache for new/updated answers
      parsedAnswers.value.clear()
    } else {
      error.value = true
    }
  } catch (err) {
    console.error('Error fetching question:', err)
    error.value = true
  } finally {
    loading.value = false
  }
}

const voteOnQuestion = async (voteType: 'UPVOTE' | 'DOWNVOTE') => {
  if (!user.value || !question.value) return
  
  votingQuestion.value = true
  
  try {
    const response = await $fetch('/api/votes', {
      method: 'POST',
      body: {
        type: voteType,
        questionId: question.value.id
      }
    }) as {
      success: boolean
      data: {
        action: string
        type: string | null
      }
    }
    
    if (response.success) {
      // Update question vote score and user vote
      await fetchQuestion()
    }
  } catch (err) {
    console.error('Error voting on question:', err)
  } finally {
    votingQuestion.value = false
  }
}

const voteOnAnswer = async (answerId: string, voteType: 'UPVOTE' | 'DOWNVOTE') => {
  if (!user.value || !question.value) return
  
  votingAnswer.value = answerId
  
  try {
    const response = await $fetch('/api/votes', {
      method: 'POST',
      body: {
        type: voteType,
        answerId: answerId
      }
    }) as {
      success: boolean
      data: {
        action: string
        type: string | null
      }
    }
    
    if (response.success) {
      // Update answer vote score and user vote
      await fetchQuestion()
    }
  } catch (err) {
    console.error('Error voting on answer:', err)
  } finally {
    votingAnswer.value = null
  }
}

const acceptAnswer = async (answerId: string) => {
  if (!user.value || !question.value) return
  
  acceptingAnswer.value = answerId
  
  try {
    const response = await $fetch(`/api/answers/${answerId}/accept`, {
      method: 'PATCH'
    }) as {
      success: boolean
    }
    
    if (response.success) {
      // Refresh question data
      await fetchQuestion()
    }
  } catch (err) {
    console.error('Error accepting answer:', err)
  } finally {
    acceptingAnswer.value = null
  }
}

const submitAnswer = async () => {
  if (!user.value || !question.value) return
  
  answerForm.error = ''
  
  // Validate answer
  const textContent = answerForm.content.replace(/<[^>]*>/g, '').trim()
  if (textContent.length < 20) {
    answerForm.error = 'Answer must be at least 20 characters'
    return
  }
  
  answerForm.submitting = true
  
  try {
    const response = await $fetch('/api/answers', {
      method: 'POST',
      body: {
        content: answerForm.content,
        questionId: question.value.id
      }
    }) as {
      success: boolean
    }
    
    if (response.success) {
      // Clear form and refresh question
      answerForm.content = ''
      await fetchQuestion()
    }
  } catch (err: any) {
    console.error('Error submitting answer:', err)
    answerForm.error = err.data?.message || 'Failed to post answer'
  } finally {
    answerForm.submitting = false
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

const getAnswerContent = (answer: Answer) => {
  // Check if this answer is already parsed
  if (parsedAnswers.value.has(answer.id)) {
    return parsedAnswers.value.get(answer.id)
  }
  
  // Check if it's likely markdown content (AI answers)
  const content = answer.content
  const isMarkdown = content.includes('**') || content.includes('###') || content.includes('---') || content.includes('*This answer was generated by AI Assistant')
  
  if (isMarkdown) {
    // Parse markdown asynchronously
    parseMarkdown(content).then(parsed => {
      parsedAnswers.value.set(answer.id, parsed)
    })
    // Return original content while parsing
    return content.replace(/\n/g, '<br>')
  }
  
  // Return HTML content as-is
  return content
}

// Fetch question on component mount
onMounted(() => {
  fetchQuestion()
})
</script>

<style scoped>
.prose {
  @apply text-gray-700;
}

.prose h1 {
  @apply text-2xl font-bold mb-4;
}

.prose h2 {
  @apply text-xl font-bold mb-3;
}

.prose h3 {
  @apply text-lg font-bold mb-2;
}

.prose p {
  @apply mb-4;
}

.prose ul {
  @apply list-disc list-inside mb-4;
}

.prose ol {
  @apply list-decimal list-inside mb-4;
}

.prose li {
  @apply mb-2;
}

.prose a {
  @apply text-blue-600 hover:text-blue-800 underline;
}

.prose img {
  @apply max-w-full h-auto rounded-lg my-4;
}

.prose strong {
  @apply font-bold;
}

.prose em {
  @apply italic;
}

.prose code {
  @apply bg-gray-100 px-1 py-0.5 rounded text-sm font-mono;
}

.prose pre {
  @apply bg-gray-100 p-4 rounded overflow-x-auto mb-4;
}

.prose blockquote {
  @apply border-l-4 border-gray-300 pl-4 italic mb-4;
}
</style> 