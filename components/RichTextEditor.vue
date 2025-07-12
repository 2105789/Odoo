<template>
  <div class="rich-text-editor">
    <!-- Toolbar -->
    <div class="toolbar bg-gray-50 border border-gray-300 rounded-t-lg p-3 flex flex-wrap gap-2">
      <!-- Basic Formatting -->
      <div class="flex gap-1">
        <button
          @click="editor.chain().focus().toggleBold().run()"
          :class="{ 'bg-blue-500 text-white': editor.isActive('bold') }"
          class="px-2 py-1 rounded text-sm font-medium border hover:bg-gray-100"
          type="button"
        >
          Bold
        </button>
        <button
          @click="editor.chain().focus().toggleItalic().run()"
          :class="{ 'bg-blue-500 text-white': editor.isActive('italic') }"
          class="px-2 py-1 rounded text-sm font-medium border hover:bg-gray-100"
          type="button"
        >
          Italic
        </button>
        <button
          @click="editor.chain().focus().toggleStrike().run()"
          :class="{ 'bg-blue-500 text-white': editor.isActive('strike') }"
          class="px-2 py-1 rounded text-sm font-medium border hover:bg-gray-100"
          type="button"
        >
          Strike
        </button>
      </div>

      <!-- Lists -->
      <div class="flex gap-1">
        <button
          @click="editor.chain().focus().toggleBulletList().run()"
          :class="{ 'bg-blue-500 text-white': editor.isActive('bulletList') }"
          class="px-2 py-1 rounded text-sm font-medium border hover:bg-gray-100"
          type="button"
        >
          • List
        </button>
        <button
          @click="editor.chain().focus().toggleOrderedList().run()"
          :class="{ 'bg-blue-500 text-white': editor.isActive('orderedList') }"
          class="px-2 py-1 rounded text-sm font-medium border hover:bg-gray-100"
          type="button"
        >
          1. List
        </button>
      </div>

      <!-- Text Alignment -->
      <div class="flex gap-1">
        <button
          @click="editor.chain().focus().setTextAlign('left').run()"
          :class="{ 'bg-blue-500 text-white': editor.isActive({ textAlign: 'left' }) }"
          class="px-2 py-1 rounded text-sm font-medium border hover:bg-gray-100"
          type="button"
        >
          Left
        </button>
        <button
          @click="editor.chain().focus().setTextAlign('center').run()"
          :class="{ 'bg-blue-500 text-white': editor.isActive({ textAlign: 'center' }) }"
          class="px-2 py-1 rounded text-sm font-medium border hover:bg-gray-100"
          type="button"
        >
          Center
        </button>
        <button
          @click="editor.chain().focus().setTextAlign('right').run()"
          :class="{ 'bg-blue-500 text-white': editor.isActive({ textAlign: 'right' }) }"
          class="px-2 py-1 rounded text-sm font-medium border hover:bg-gray-100"
          type="button"
        >
          Right
        </button>
      </div>

      <!-- Link -->
      <button
        @click="addLink"
        :class="{ 'bg-blue-500 text-white': editor.isActive('link') }"
        class="px-2 py-1 rounded text-sm font-medium border hover:bg-gray-100"
        type="button"
      >
        Link
      </button>

      <!-- Image Upload -->
      <div class="relative">
        <input
          ref="imageInput"
          type="file"
          accept="image/*"
          @change="handleImageUpload"
          class="hidden"
        />
        <button
          @click="imageInput?.click()"
          class="px-2 py-1 rounded text-sm font-medium border hover:bg-gray-100"
          type="button"
        >
          Image
        </button>
      </div>

      <!-- Emoji -->
      <div class="relative">
        <button
          @click="showEmojiPicker = !showEmojiPicker"
          class="px-2 py-1 rounded text-sm font-medium border hover:bg-gray-100"
          type="button"
        >
          😀
        </button>
        <div
          v-if="showEmojiPicker"
          class="absolute top-8 left-0 bg-white border rounded shadow-lg p-2 z-10"
        >
          <div class="grid grid-cols-6 gap-1">
            <button
              v-for="emoji in emojis"
              :key="emoji"
              @click="insertEmoji(emoji)"
              class="p-1 hover:bg-gray-100 rounded text-lg"
              type="button"
            >
              {{ emoji }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Editor Content -->
    <div class="editor-content">
      <editor-content
        :editor="editor"
        class="border border-gray-300 rounded-b-lg min-h-[200px] p-4 focus-within:ring-2 focus-within:ring-blue-500"
      />
    </div>

    <!-- Image Upload Loading -->
    <div v-if="imageUploading" class="text-center py-2">
      <div class="inline-flex items-center">
        <svg class="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
        </svg>
        Uploading image...
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Editor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import Typography from '@tiptap/extension-typography'

interface Props {
  modelValue: string
  placeholder?: string
  readonly?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: 'Write your content here...',
  readonly: false
})

const emit = defineEmits<Emits>()

const showEmojiPicker = ref(false)
const imageUploading = ref(false)
const imageInput = ref<HTMLInputElement>()

const emojis = [
  '😀', '😁', '😂', '🤣', '😃', '😄', '😅', '😆', '😉', '😊', '😋', '😎',
  '🤔', '🤗', '🤐', '🤨', '😐', '😑', '😶', '🙄', '😏', '😣', '😥', '😮',
  '🤐', '😯', '😪', '😫', '😴', '😌', '😛', '😜', '😝', '🤤', '😒', '😓',
  '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇',
  '💪', '🙏', '👏', '🙌', '👐', '🤲', '🤝', '👍', '❤️', '💙', '💚', '💛'
]

const editor = new Editor({
  extensions: [
    StarterKit,
    Image.configure({
      HTMLAttributes: {
        class: 'max-w-full h-auto rounded-lg'
      }
    }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: 'text-blue-500 underline hover:text-blue-600'
      }
    }),
    TextAlign.configure({
      types: ['heading', 'paragraph']
    }),
    Typography
  ],
  content: props.modelValue,
  editable: !props.readonly,
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  }
})

const addLink = () => {
  const previousUrl = editor.getAttributes('link').href
  const url = window.prompt('URL', previousUrl)

  if (url === null) {
    return
  }

  if (url === '') {
    editor.chain().focus().extendMarkRange('link').unsetLink().run()
    return
  }

  editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
}

const insertEmoji = (emoji: string) => {
  editor.chain().focus().insertContent(emoji).run()
  showEmojiPicker.value = false
}

const handleImageUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  if (!file.type.startsWith('image/')) {
    alert('Please select an image file')
    return
  }
  
  try {
    imageUploading.value = true
    
    // Convert file to base64
    const reader = new FileReader()
    reader.onload = async (e) => {
      const base64String = e.target?.result as string
      
             try {
         const response = await $fetch('/api/upload/image', {
           method: 'POST',
           body: {
             image: base64String,
             folder: 'stackit'
           }
         }) as { success: boolean; data: { url: string } }
         
         if (response.success) {
           editor.chain().focus().setImage({ src: response.data.url }).run()
         } else {
           alert('Failed to upload image')
         }
       } catch (error) {
        console.error('Error uploading image:', error)
        alert('Failed to upload image')
      } finally {
        imageUploading.value = false
      }
    }
    
    reader.readAsDataURL(file)
  } catch (error) {
    console.error('Error processing image:', error)
    alert('Failed to process image')
    imageUploading.value = false
  }
  
  // Reset input
  if (target) {
    target.value = ''
  }
}

watch(() => props.modelValue, (newValue) => {
  const isSame = editor.getHTML() === newValue
  if (!isSame) {
    editor.commands.setContent(newValue, false)
  }
})

watch(() => props.readonly, (newValue) => {
  editor.setEditable(!newValue)
})

onBeforeUnmount(() => {
  editor.destroy()
})

// Close emoji picker when clicking outside
onMounted(() => {
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement
    if (!target.closest('.relative')) {
      showEmojiPicker.value = false
    }
  })
})
</script>

<style scoped>
.rich-text-editor {
  @apply w-full;
}

.toolbar {
  @apply border-b-0;
}

.editor-content {
  @apply w-full;
}

/* TipTap Editor Styles */
:deep(.ProseMirror) {
  @apply outline-none;
}

:deep(.ProseMirror h1) {
  @apply text-2xl font-bold mb-4;
}

:deep(.ProseMirror h2) {
  @apply text-xl font-bold mb-3;
}

:deep(.ProseMirror h3) {
  @apply text-lg font-bold mb-2;
}

:deep(.ProseMirror p) {
  @apply mb-2;
}

:deep(.ProseMirror ul) {
  @apply list-disc list-inside mb-2;
}

:deep(.ProseMirror ol) {
  @apply list-decimal list-inside mb-2;
}

:deep(.ProseMirror li) {
  @apply mb-1;
}

:deep(.ProseMirror a) {
  @apply text-blue-500 underline hover:text-blue-600;
}

:deep(.ProseMirror img) {
  @apply max-w-full h-auto rounded-lg my-2;
}

:deep(.ProseMirror strong) {
  @apply font-bold;
}

:deep(.ProseMirror em) {
  @apply italic;
}

:deep(.ProseMirror s) {
  @apply line-through;
}

:deep(.ProseMirror code) {
  @apply bg-gray-100 px-1 py-0.5 rounded text-sm font-mono;
}

:deep(.ProseMirror pre) {
  @apply bg-gray-100 p-4 rounded overflow-x-auto;
}

:deep(.ProseMirror blockquote) {
  @apply border-l-4 border-gray-300 pl-4 italic;
}
</style> 