<template>
  <div class="relative">
    <!-- Notification Bell -->
    <button
      @click="toggleDropdown"
      class="relative p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full"
    >
      <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
      </svg>
      
      <!-- Notification Badge -->
      <span
        v-if="unreadCount > 0"
        class="absolute top-0 right-0 -mt-1 -mr-1 px-2 py-1 text-xs font-bold text-white bg-red-500 rounded-full min-w-[1.25rem] text-center"
      >
        {{ unreadCount > 99 ? '99+' : unreadCount }}
      </span>
    </button>

    <!-- Dropdown Menu -->
    <div
      v-if="showDropdown"
      class="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50 border border-gray-200"
    >
      <!-- Header -->
      <div class="px-4 py-3 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">Notifications</h3>
          <button
            v-if="unreadCount > 0"
            @click="markAllAsRead"
            class="text-sm text-blue-600 hover:text-blue-800"
          >
            Mark all read
          </button>
        </div>
      </div>

      <!-- Notifications List -->
      <div class="max-h-96 overflow-y-auto">
        <!-- Loading -->
        <div v-if="loading" class="px-4 py-8 text-center text-gray-500">
          <svg class="animate-spin h-5 w-5 mx-auto mb-2" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
          Loading notifications...
        </div>

        <!-- Empty State -->
        <div v-else-if="notifications.length === 0" class="px-4 py-8 text-center text-gray-500">
          <svg class="h-8 w-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
          </svg>
          <p class="text-sm">No notifications yet</p>
        </div>

        <!-- Notifications -->
        <div v-else>
          <div
            v-for="notification in notifications"
            :key="notification.id"
            class="px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
            :class="{ 'bg-blue-50': !notification.isRead }"
            @click="handleNotificationClick(notification)"
          >
            <div class="flex items-start">
              <!-- Icon -->
              <div class="flex-shrink-0 mr-3">
                <div
                  class="w-8 h-8 rounded-full flex items-center justify-center"
                  :class="getNotificationIconClass(notification.type)"
                >
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path v-if="notification.type === 'QUESTION_ANSWERED'" fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd"></path>
                    <path v-else-if="notification.type === 'ANSWER_ACCEPTED'" fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                    <path v-else-if="notification.type === 'MENTION'" fill-rule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clip-rule="evenodd"></path>
                    <path v-else fill-rule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clip-rule="evenodd"></path>
                  </svg>
                </div>
              </div>

              <!-- Content -->
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900">{{ notification.title }}</p>
                <p class="text-sm text-gray-600 mt-1">{{ notification.message }}</p>
                <p class="text-xs text-gray-500 mt-1">{{ formatDate(notification.createdAt) }}</p>
              </div>

              <!-- Unread Indicator -->
              <div v-if="!notification.isRead" class="flex-shrink-0 ml-2">
                <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-4 py-3 border-t border-gray-200 bg-gray-50">
        <button
          @click="viewAllNotifications"
          class="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          View all notifications
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Notification {
  id: string
  type: 'QUESTION_ANSWERED' | 'ANSWER_ACCEPTED' | 'MENTION' | 'QUESTION_COMMENTED'
  title: string
  message: string
  isRead: boolean
  entityId: string | null
  entityType: string | null
  createdAt: string
}

const { user } = useAuth()
const showDropdown = ref(false)
const notifications = ref<Notification[]>([])
const unreadCount = ref(0)
const loading = ref(false)

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
  if (showDropdown.value) {
    fetchNotifications()
  }
}

const fetchNotifications = async () => {
  if (!user.value) return
  
  loading.value = true
  try {
    const response = await $fetch('/api/notifications?limit=10') as {
      success: boolean
      data: {
        notifications: Notification[]
        unreadCount: number
      }
    }
    
    if (response.success) {
      notifications.value = response.data.notifications
      unreadCount.value = response.data.unreadCount
    }
  } catch (error) {
    console.error('Error fetching notifications:', error)
  } finally {
    loading.value = false
  }
}

const markAllAsRead = async () => {
  if (!user.value) return
  
  try {
    const response = await $fetch('/api/notifications/mark-read', {
      method: 'PATCH',
      body: { markAll: true }
    }) as {
      success: boolean
    }
    
    if (response.success) {
      // Mark all notifications as read in local state
      notifications.value = notifications.value.map(n => ({ ...n, isRead: true }))
      unreadCount.value = 0
    }
  } catch (error) {
    console.error('Error marking notifications as read:', error)
  }
}

const handleNotificationClick = async (notification: Notification) => {
  // Mark notification as read if not already read
  if (!notification.isRead) {
    try {
      await $fetch('/api/notifications/mark-read', {
        method: 'PATCH',
        body: { notificationIds: [notification.id] }
      })
      
      // Update local state
      const index = notifications.value.findIndex(n => n.id === notification.id)
      if (index !== -1) {
        notifications.value[index].isRead = true
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }
  
  // Navigate to related content
  if (notification.entityType === 'question' && notification.entityId) {
    showDropdown.value = false
    await navigateTo(`/questions/${notification.entityId}`)
  }
}

const viewAllNotifications = () => {
  showDropdown.value = false
  navigateTo('/notifications')
}

const getNotificationIconClass = (type: string) => {
  switch (type) {
    case 'QUESTION_ANSWERED':
      return 'bg-blue-100 text-blue-600'
    case 'ANSWER_ACCEPTED':
      return 'bg-green-100 text-green-600'
    case 'MENTION':
      return 'bg-purple-100 text-purple-600'
    case 'QUESTION_COMMENTED':
      return 'bg-yellow-100 text-yellow-600'
    default:
      return 'bg-gray-100 text-gray-600'
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffMinutes = Math.ceil(diffTime / (1000 * 60))
  const diffHours = Math.ceil(diffTime / (1000 * 60 * 60))
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`
  } else if (diffHours < 24) {
    return `${diffHours}h ago`
  } else if (diffDays < 7) {
    return `${diffDays}d ago`
  } else {
    return date.toLocaleDateString()
  }
}

// Close dropdown when clicking outside
onMounted(() => {
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement
    if (!target.closest('.relative')) {
      showDropdown.value = false
    }
  })
})

// Fetch notifications on mount if user is logged in
watch(user, (newUser) => {
  if (newUser && !notifications.value.length) {
    fetchNotifications()
  }
}, { immediate: true })

// Periodically fetch notifications to update unread count
let notificationInterval: NodeJS.Timeout | null = null

onMounted(() => {
  if (user.value) {
    // Poll for new notifications every 30 seconds
    notificationInterval = setInterval(() => {
      if (user.value) {
        fetchNotifications()
      }
    }, 30000)
  }
})

onUnmounted(() => {
  if (notificationInterval) {
    clearInterval(notificationInterval)
  }
})
</script>

<style scoped>
/* Additional styles if needed */
</style> 