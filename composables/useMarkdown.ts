import { marked } from 'marked'

export const useMarkdown = () => {
  const parseMarkdown = async (content: string): Promise<string> => {
    if (!content) return ''
    
    // Configure marked for security
    marked.setOptions({
      breaks: true,
      gfm: true
    })
    
    try {
      return await marked(content)
    } catch (error) {
      console.error('Error parsing markdown:', error)
      // Fallback to plain text if markdown parsing fails
      return content.replace(/\n/g, '<br>')
    }
  }
  
  return {
    parseMarkdown
  }
} 