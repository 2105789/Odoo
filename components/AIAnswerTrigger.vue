<template>
  <div class="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
    <div class="flex items-start space-x-3">
      <div class="flex-shrink-0">
        <svg class="h-5 w-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
        </svg>
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-sm font-medium text-indigo-800">AI Assistant Available</h3>
            <p class="text-sm text-indigo-600 mt-1">
              <span v-if="!loading && !aiAnswerExists && !generating">
                Get an instant AI-generated answer to help get you started.
              </span>
              <span v-else-if="generating">
                AI Assistant is working on an answer...
              </span>
              <span v-else-if="aiAnswerExists">
                AI Assistant has already provided an answer for this question.
              </span>
              <span v-else-if="loading">
                Checking AI answer status...
              </span>
            </p>
          </div>
          <button
            v-if="!aiAnswerExists && !generating"
            @click="triggerAIAnswer"
            :disabled="loading"
            class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg v-if="loading" class="animate-spin -ml-1 mr-1 h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ loading ? 'Checking...' : 'Ask AI' }}
          </button>
          <div v-else-if="generating" class="flex items-center space-x-2">
            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
            <span class="text-xs text-indigo-600">{{ generateTimeLeft }}s</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  questionId: {
    type: String,
    required: true
  },
  answers: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['answerGenerated'])

const loading = ref(false)
const generating = ref(false)
const generateTimeLeft = ref(0)
let countdownInterval = null

// Check if AI bot has already answered
const aiAnswerExists = computed(() => {
  return props.answers.some(answer => 
    answer.author.email === 'aibot@stackit.ai'
  )
})

const triggerAIAnswer = async () => {
  if (loading.value || generating.value) return
  
  loading.value = true
  
  try {
    const response = await $fetch('/api/ai/generate-answer', {
      method: 'POST',
      body: {
        questionId: props.questionId,
        delay: Math.floor(Math.random() * 10000) + 5000 // 5-15 seconds delay
      }
    })
    
    if (response.success) {
      if (response.delay) {
        // Start countdown for delayed generation
        generating.value = true
        generateTimeLeft.value = Math.ceil(response.delay / 1000)
        
        countdownInterval = setInterval(() => {
          generateTimeLeft.value--
          if (generateTimeLeft.value <= 0) {
            generating.value = false
            if (countdownInterval) {
              clearInterval(countdownInterval)
              countdownInterval = null
            }
            // Emit event to refresh answers
            emit('answerGenerated')
          }
        }, 1000)
        
        // Also set a timeout to stop generating state
        setTimeout(() => {
          generating.value = false
          if (countdownInterval) {
            clearInterval(countdownInterval)
            countdownInterval = null
          }
          emit('answerGenerated')
        }, response.delay + 2000) // Add 2 seconds buffer
      } else {
        // Immediate generation completed
        emit('answerGenerated')
      }
    } else {
      console.warn('AI answer generation:', response.message)
    }
  } catch (error) {
    console.error('Error triggering AI answer:', error)
  } finally {
    loading.value = false
  }
}

// Cleanup on unmount
onUnmounted(() => {
  if (countdownInterval) {
    clearInterval(countdownInterval)
  }
})
</script> 