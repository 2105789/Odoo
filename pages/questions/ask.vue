<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Ask a Question</h1>
      <p class="text-gray-600 mt-2">Get help from the community by asking your question</p>
    </div>

    <!-- Question Form -->
    <div class="bg-white rounded-lg shadow-sm border p-6">
      <form @submit.prevent="submitQuestion" class="space-y-6">
        <!-- Title -->
        <div>
          <label for="title" class="block text-sm font-medium text-gray-700 mb-2">
            Title
          </label>
          <input
            id="title"
            v-model="form.title"
            type="text"
            placeholder="What's your question? Be specific and concise."
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            :class="{ 'border-red-300': errors.title }"
          />
          <p v-if="errors.title" class="text-red-600 text-sm mt-1">{{ errors.title }}</p>
          <p class="text-gray-500 text-sm mt-1">
            {{ form.title.length }}/200 characters
          </p>
        </div>

        <!-- Description -->
        <div>
          <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <div :class="{ 'border-red-300': errors.description }">
            <RichTextEditor
              v-model="form.description"
              placeholder="Provide details about your question. Include what you've tried, what you expected, and what actually happened."
            />
          </div>
          <p v-if="errors.description" class="text-red-600 text-sm mt-1">{{ errors.description }}</p>
        </div>

        <!-- Tags -->
        <div>
          <label for="tags" class="block text-sm font-medium text-gray-700 mb-2">
            Tags (1-5 tags)
          </label>
          <div class="space-y-3">
            <!-- Tag Input -->
            <div class="flex gap-2">
              <input
                v-model="newTag"
                type="text"
                placeholder="Enter a tag (e.g., javascript, react, nodejs)"
                class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                @keydown.enter.prevent="addTag"
                @keydown.comma.prevent="addTag"
                :disabled="form.tags.length >= 5"
              />
              <button
                type="button"
                @click="addTag"
                :disabled="!newTag.trim() || form.tags.length >= 5"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Add Tag
              </button>
            </div>

            <!-- Selected Tags -->
            <div v-if="form.tags.length > 0" class="flex flex-wrap gap-2">
              <span
                v-for="(tag, index) in form.tags"
                :key="index"
                class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
              >
                {{ tag }}
                <button
                  type="button"
                  @click="removeTag(index)"
                  class="ml-2 hover:text-blue-600"
                >
                  <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                  </svg>
                </button>
              </span>
            </div>

            <!-- Popular Tags -->
            <div v-if="popularTags.length > 0">
              <p class="text-sm text-gray-600 mb-2">Popular tags:</p>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="tag in popularTags"
                  :key="tag.id"
                  type="button"
                  @click="addPopularTag(tag.name)"
                  :disabled="form.tags.includes(tag.name) || form.tags.length >= 5"
                  class="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {{ tag.name }} ({{ tag.questionCount }})
                </button>
              </div>
            </div>
          </div>
          <p v-if="errors.tags" class="text-red-600 text-sm mt-1">{{ errors.tags }}</p>
        </div>

        <!-- Guidelines -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 class="font-semibold text-blue-900 mb-2">Writing a good question</h3>
          <ul class="text-sm text-blue-800 space-y-1">
            <li>• Be specific and clear in your title</li>
            <li>• Provide context and background information</li>
            <li>• Include what you've tried and what didn't work</li>
            <li>• Add relevant tags to help others find your question</li>
            <li>• Use proper formatting and include code examples when relevant</li>
          </ul>
        </div>

        <!-- Submit Button -->
        <div class="flex justify-end gap-3">
          <NuxtLink
            to="/questions"
            class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </NuxtLink>
          <button
            type="submit"
            :disabled="submitting"
            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span v-if="submitting">
              <svg class="animate-spin h-4 w-4 mr-2 inline" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
              Posting...
            </span>
            <span v-else>Post Question</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  layout: 'default'
})

interface Tag {
  id: string
  name: string
  questionCount: number
}

const form = reactive({
  title: '',
  description: '',
  tags: [] as string[]
})

const errors = reactive({
  title: '',
  description: '',
  tags: ''
})

const newTag = ref('')
const popularTags = ref<Tag[]>([])
const submitting = ref(false)

const addTag = () => {
  const tag = newTag.value.trim().toLowerCase()
  
  if (!tag) return
  
  if (form.tags.length >= 5) {
    alert('Maximum 5 tags allowed')
    return
  }
  
  if (form.tags.includes(tag)) {
    alert('Tag already added')
    return
  }
  
  if (tag.length > 20) {
    alert('Tag must be 20 characters or less')
    return
  }
  
  form.tags.push(tag)
  newTag.value = ''
}

const removeTag = (index: number) => {
  form.tags.splice(index, 1)
}

const addPopularTag = (tagName: string) => {
  if (form.tags.includes(tagName) || form.tags.length >= 5) return
  form.tags.push(tagName)
}

const validateForm = () => {
  // Reset errors
  errors.title = ''
  errors.description = ''
  errors.tags = ''
  
  let isValid = true
  
  // Title validation
  if (!form.title.trim()) {
    errors.title = 'Title is required'
    isValid = false
  } else if (form.title.length < 10) {
    errors.title = 'Title must be at least 10 characters'
    isValid = false
  } else if (form.title.length > 200) {
    errors.title = 'Title must be less than 200 characters'
    isValid = false
  }
  
  // Description validation
  if (!form.description.trim()) {
    errors.description = 'Description is required'
    isValid = false
  } else {
    const textContent = form.description.replace(/<[^>]*>/g, '').trim()
    if (textContent.length < 20) {
      errors.description = 'Description must be at least 20 characters'
      isValid = false
    }
  }
  
  // Tags validation
  if (form.tags.length === 0) {
    errors.tags = 'At least one tag is required'
    isValid = false
  } else if (form.tags.length > 5) {
    errors.tags = 'Maximum 5 tags allowed'
    isValid = false
  }
  
  return isValid
}

const submitQuestion = async () => {
  if (!validateForm()) return
  
  submitting.value = true
  
  try {
    const response = await $fetch('/api/questions', {
      method: 'POST',
      body: {
        title: form.title.trim(),
        description: form.description,
        tags: form.tags
      }
    }) as {
      success: boolean
      data: {
        id: string
      }
    }
    
    if (response.success) {
      // Redirect to the new question
      await navigateTo(`/questions/${response.data.id}`)
    }
  } catch (error: any) {
    console.error('Error creating question:', error)
    
    if (error.data?.data) {
      // Handle validation errors
      const validationErrors = error.data.data
      validationErrors.forEach((err: any) => {
        if (err.path?.[0] === 'title') {
          errors.title = err.message
        } else if (err.path?.[0] === 'description') {
          errors.description = err.message
        } else if (err.path?.[0] === 'tags') {
          errors.tags = err.message
        }
      })
    } else {
      alert('Failed to create question. Please try again.')
    }
  } finally {
    submitting.value = false
  }
}

const fetchPopularTags = async () => {
  try {
    const response = await $fetch('/api/tags?limit=10') as {
      success: boolean
      data: Tag[]
    }
    if (response.success) {
      popularTags.value = response.data
    }
  } catch (error) {
    console.error('Error fetching popular tags:', error)
  }
}

// Watch for title changes to update character count
watch(() => form.title, (newValue) => {
  if (newValue.length > 200) {
    form.title = newValue.substring(0, 200)
  }
})

// Fetch popular tags on component mount
onMounted(() => {
  fetchPopularTags()
})
</script>

<style scoped>
/* Additional styling if needed */
</style> 