import type { ChatBotResponse, ChatSession, Message } from '../types/chat'

import { useLocalStorage } from '@vueuse/core'
import { computed, ref } from 'vue'

export const useChat = () => {
  // Store chat sessions in localStorage
  const chatSessions = useLocalStorage<ChatSession[]>('chat-sessions', [])
  const currentSessionId = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Get current active session
  const currentSession = computed(() => {
    if (!currentSessionId.value) {
      return null
    }
    return chatSessions.value.find(session => session.id === currentSessionId.value) || null
  })

  // Get current messages
  const messages = computed(() => {
    return currentSession.value?.messages || []
  })

  // Generate unique ID
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).slice(2)
  }

  // Create new chat session
  const createNewSession = () => {
    const newSession: ChatSession = {
      id: generateId(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    chatSessions.value.unshift(newSession)
    currentSessionId.value = newSession.id
    return newSession
  }

  // Switch to existing session
  const switchToSession = (sessionId: string) => {
    currentSessionId.value = sessionId
  }

  // Delete a session
  const deleteSession = (sessionId: string) => {
    const index = chatSessions.value.findIndex(session => session.id === sessionId)
    if (index !== -1) {
      chatSessions.value.splice(index, 1)
      
      // If we deleted the current session, switch to the first available or create new
      if (currentSessionId.value === sessionId) {
        if (chatSessions.value.length > 0) {
          currentSessionId.value = chatSessions.value[0].id
        } else {
          createNewSession()
        }
      }
    }
  }

  // Update session title based on first message
  const updateSessionTitle = (sessionId: string, title: string) => {
    const session = chatSessions.value.find(s => s.id === sessionId)
    if (session) {
      session.title = title.slice(0, 50) // Limit title length
      session.updatedAt = new Date()
    }
  }

  // Add message to current session
  const addMessage = (content: string, role: 'user' | 'assistant', isTyping = false) => {
    if (!currentSession.value) {
      return null
    }

    const message: Message = {
      id: generateId(),
      content,
      role,
      timestamp: new Date(),
      isTyping,
    }

    currentSession.value.messages.push(message)
    currentSession.value.updatedAt = new Date()

    // Update session title if this is the first user message
    if (role === 'user' && currentSession.value.messages.filter(m => m.role === 'user').length === 1) {
      updateSessionTitle(currentSession.value.id, content)
    }

    return message
  }

  // Update message content (useful for typing animation)
  const updateMessage = (messageId: string, content: string, isTyping = false) => {
    if (!currentSession.value) {
      return
    }

    const message = currentSession.value.messages.find(m => m.id === messageId)
    if (message) {
      message.content = content
      message.isTyping = isTyping
      currentSession.value.updatedAt = new Date()
    }
  }

  // Send message to ChatBot API
  const sendMessage = async (userMessage: string, apiEndpoint = '/api/chat') => {
    if (!currentSession.value) {
      createNewSession()
    }

    try {
      isLoading.value = true
      error.value = null

      // Add user message
      addMessage(userMessage, 'user')

      // Add typing indicator for assistant
      const assistantMessage = addMessage('', 'assistant', true)
      
      // Prepare conversation history (last 10 messages for context)
      const conversationHistory = currentSession.value!.messages
        .slice(-10)
        .filter(m => !m.isTyping)
        .map(m => ({ content: m.content, role: m.role }))

      // Make API call (replace with your actual ChatBot API)
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          conversation_history: conversationHistory,
        }),
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }

      const data: ChatBotResponse = await response.json()
      
      // Update assistant message with actual response
      if (assistantMessage) {
        updateMessage(assistantMessage.id, data.content, false)
      }
    } catch (error_) {
      error.value = error_ instanceof Error ? error_.message : 'An error occurred'
      
      // Remove typing indicator on error
      if (currentSession.value) {
        const lastMessage = currentSession.value.messages[currentSession.value.messages.length - 1]
        if (lastMessage?.isTyping) {
          currentSession.value.messages.pop()
        }
      }
    } finally {
      isLoading.value = false
    }
  }

  // Mock API call for development (remove when you have real API)
  const sendMessageMock = async (userMessage: string) => {
    if (!currentSession.value) {
      createNewSession()
    }

    try {
      isLoading.value = true
      error.value = null

      // Add user message
      addMessage(userMessage, 'user')

      // Add typing indicator
      const assistantMessage = addMessage('', 'assistant', true)

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))

      // Mock response
      const mockResponses = [
        'I\'m a mock ChatBot response. Replace this with your actual API integration.',
        'This is a simulated response to demonstrate the chat interface functionality.',
        'Here\'s another example response. The real ChatBot would provide more meaningful answers.',
        'I understand your question. This mock response shows how the chat system works.',
        'Thank you for your message. This is how the chat bot will respond once connected to a real API.',
      ]
      
      const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)]
      
      // Update assistant message
      if (assistantMessage) {
        updateMessage(assistantMessage.id, randomResponse, false)
      }
    } catch (error_) {
      error.value = error_ instanceof Error ? error_.message : 'An error occurred'
    } finally {
      isLoading.value = false
    }
  }

  // Initialize with a session if none exists
  const initialize = () => {
    if (chatSessions.value.length === 0 || !currentSessionId.value) {
      createNewSession()
    } else if (currentSessionId.value) {
      // Ensure current session exists
      const exists = chatSessions.value.find(s => s.id === currentSessionId.value)
      if (!exists) {
        currentSessionId.value = chatSessions.value[0]?.id || null
        if (!currentSessionId.value) {
          createNewSession()
        }
      }
    }
  }

  return {
    // State
    chatSessions,
    currentSession,
    messages,
    isLoading,
    error,
    currentSessionId,

    // Actions
    createNewSession,
    switchToSession,
    deleteSession,
    sendMessage,
    sendMessageMock, // Remove this when you have real API
    addMessage,
    updateMessage,
    initialize,
  }
}
