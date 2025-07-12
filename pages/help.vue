<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Help Center</h1>
      <p class="text-gray-600">Get help with using StackIt Q&A platform</p>
    </div>

    <div class="space-y-8">
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Getting Started</h2>
        <div class="space-y-4">
          <div>
            <h3 class="text-lg font-medium text-gray-800 mb-2">How do I ask a question?</h3>
            <p class="text-gray-600">
              Click the "Ask Question" button in the navigation bar or go to the questions page. Make sure to provide a clear title and detailed description. Don't forget to add relevant tags to help others find your question.
            </p>
          </div>
          <div>
            <h3 class="text-lg font-medium text-gray-800 mb-2">How do I answer a question?</h3>
            <p class="text-gray-600">
              Click on any question to view its details. Scroll down to the bottom of the page and use the rich text editor to provide a detailed answer. You can format your text, add images, and include links.
            </p>
          </div>
          <div>
            <h3 class="text-lg font-medium text-gray-800 mb-2">What are tags?</h3>
            <p class="text-gray-600">
              Tags help categorize questions and make them easier to find. When asking a question, add relevant tags that describe the topic. You can browse all tags on the tags page.
            </p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Voting System</h2>
        <div class="space-y-4">
          <div>
            <h3 class="text-lg font-medium text-gray-800 mb-2">How does voting work?</h3>
            <p class="text-gray-600">
              You can upvote or downvote questions and answers. Upvotes indicate that the content is helpful, while downvotes suggest it's not useful or needs improvement. This helps the community identify the best content.
            </p>
          </div>
          <div>
            <h3 class="text-lg font-medium text-gray-800 mb-2">Can I vote on my own content?</h3>
            <p class="text-gray-600">
              No, you cannot vote on your own questions or answers. The voting system is designed for community evaluation.
            </p>
          </div>
          <div>
            <h3 class="text-lg font-medium text-gray-800 mb-2">What does accepting an answer mean?</h3>
            <p class="text-gray-600">
              As the question author, you can accept an answer that best solves your problem. This is indicated by a green checkmark and helps other users find the best solution.
            </p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Rich Text Editor</h2>
        <div class="space-y-4">
          <div>
            <h3 class="text-lg font-medium text-gray-800 mb-2">What formatting options are available?</h3>
            <p class="text-gray-600">
              The rich text editor supports bold, italic, strikethrough, bullet lists, numbered lists, links, images, emojis, and text alignment. Use the toolbar to access these formatting options.
            </p>
          </div>
          <div>
            <h3 class="text-lg font-medium text-gray-800 mb-2">How do I add images?</h3>
            <p class="text-gray-600">
              Click the image icon in the editor toolbar. You can upload images from your device, and they will be hosted on Cloudinary. Make sure your images are relevant to your question or answer.
            </p>
          </div>
          <div>
            <h3 class="text-lg font-medium text-gray-800 mb-2">How do I add links?</h3>
            <p class="text-gray-600">
              Select the text you want to link and click the link icon in the toolbar. Enter the URL and the text will become a clickable link.
            </p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Notifications</h2>
        <div class="space-y-4">
          <div>
            <h3 class="text-lg font-medium text-gray-800 mb-2">What notifications will I receive?</h3>
            <p class="text-gray-600">
              You'll receive notifications when someone answers your question, when your answer is accepted, and when you're mentioned in a question or answer. Check the bell icon in the navigation bar to see your notifications.
            </p>
          </div>
          <div>
            <h3 class="text-lg font-medium text-gray-800 mb-2">How do I mark notifications as read?</h3>
            <p class="text-gray-600">
              Click on the notification dropdown and then click "Mark all as read" to clear all notifications at once.
            </p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">User Roles</h2>
        <div class="space-y-4">
          <div>
            <h3 class="text-lg font-medium text-gray-800 mb-2">What are the different user roles?</h3>
            <p class="text-gray-600">
              There are three user roles: Guest (can only view content), User (can ask questions, post answers, and vote), and Admin (can moderate content and manage users).
            </p>
          </div>
          <div>
            <h3 class="text-lg font-medium text-gray-800 mb-2">How do I become a registered user?</h3>
            <p class="text-gray-600">
              Click the "Register" link in the navigation bar and fill out the registration form. You'll need to provide your email address, name, and create a password.
            </p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Search and Filtering</h2>
        <div class="space-y-4">
          <div>
            <h3 class="text-lg font-medium text-gray-800 mb-2">How do I search for questions?</h3>
            <p class="text-gray-600">
              Use the search bar on the questions page to search for questions by title or content. You can also filter questions by tags, sort by date, votes, or answers.
            </p>
          </div>
          <div>
            <h3 class="text-lg font-medium text-gray-800 mb-2">Can I filter questions by tags?</h3>
            <p class="text-gray-600">
              Yes, you can filter questions by selecting tags from the filter dropdown on the questions page. You can also browse all tags on the tags page and click on any tag to see related questions.
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-12 bg-gray-50 rounded-lg p-6">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">Still need help?</h2>
      <p class="text-gray-600 mb-4">
        If you can't find the answer to your question in this help center, please don't hesitate to ask a question on the platform. Our community is here to help!
      </p>
      <div class="flex space-x-4">
        <NuxtLink
          to="/questions/ask"
          class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Ask a Question
        </NuxtLink>
        <NuxtLink
          to="/questions"
          class="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
        >
          Browse Questions
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'auth'
})
</script> 