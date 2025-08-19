import {
  createChatSession,
  deleteChatSession,
  getChatSession,
  getChatSessions,
  sendMessageToSession,
  updateChatSession,
} from '../services/chatSessionApi';
import type { Authority, ChatSession, Message } from '../types/chat';

import { computed, ref } from 'vue';

export const useChatLegacy = () => {
  // Store chat sessions in localStorage with API sync
  const chatSessions = ref<ChatSession[]>([]);
  const currentSessionId = ref<string | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const userId = ref<string>('default-user'); // You can integrate with auth later

  // Get current active session
  const currentSession = computed(() => {
    if (!currentSessionId.value) {
      return null;
    }
    return chatSessions.value.find(session => session.id === currentSessionId.value) || null;
  });

  // Get current messages
  const messages = computed(() => {
    console.log('Current messages:', currentSession.value?.messages);
    return currentSession.value?.messages || [];
  });

  // Generate unique ID
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  };

  // Load chat sessions from API
  const loadChatSessions = async () => {
    try {
      isLoading.value = true;
      error.value = null;

      const sessions = await getChatSessions(userId.value, 50);
      chatSessions.value = sessions;

      console.log('✅ Loaded chat sessions:', sessions.length);
    } catch (err) {
      console.error('❌ Failed to load chat sessions:', err);
      error.value = err instanceof Error ? err.message : 'Failed to load chat sessions';
    } finally {
      isLoading.value = false;
    }
  };

  // Create new chat session
  const createNewSession = async (authority: Authority = 'SDM') => {
    try {
      isLoading.value = true;
      error.value = null;

      const newSession = await createChatSession({
        title: 'New Chat',
        authority,
        user_id: userId.value,
      });

      chatSessions.value.unshift(newSession);
      currentSessionId.value = newSession.id;

      console.log('✅ Created new session:', newSession.id);
      return newSession;
    } catch (err) {
      console.error('❌ Failed to create session:', err);
      error.value = err instanceof Error ? err.message : 'Failed to create session';

      // Fallback to local session creation if API fails
      const fallbackSession: ChatSession = {
        id: generateId(),
        title: 'New Chat (Offline)',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        authority,
        messageCount: 0,
        lastActivityAt: new Date(),
      };

      chatSessions.value.unshift(fallbackSession);
      currentSessionId.value = fallbackSession.id;
      return fallbackSession;
    } finally {
      isLoading.value = false;
    }
  };

  // Switch to existing session and load full details
  const switchToSession = async (sessionId: string) => {
    try {
      currentSessionId.value = sessionId;

      // Check if we need to load session details
      const existingSession = chatSessions.value.find(s => s.id === sessionId);
      if (!existingSession || !existingSession.messages || existingSession.messages.length === 0) {
        // Load full session with messages from API
        const fullSession = await getChatSession(sessionId);

        // Update the session in our local array
        const index = chatSessions.value.findIndex(s => s.id === sessionId);
        if (index !== -1) {
          chatSessions.value[index] = fullSession;
        }

        console.log('✅ Loaded full session:', sessionId, 'messages:', fullSession.messages.length);
      }
    } catch (err) {
      console.error('❌ Failed to switch to session:', err);
      error.value = err instanceof Error ? err.message : 'Failed to load session';
    }
  };

  // Delete a session
  const deleteSession = async (sessionId: string) => {
    try {
      await deleteChatSession(sessionId);

      const index = chatSessions.value.findIndex(session => session.id === sessionId);
      if (index !== -1) {
        chatSessions.value.splice(index, 1);
      }

      // If we deleted the current session, switch to the first available or create new
      if (currentSessionId.value === sessionId) {
        if (chatSessions.value.length > 0) {
          await switchToSession(chatSessions.value[0].id);
        } else {
          await createNewSession();
        }
      }

      console.log('✅ Deleted session:', sessionId);
    } catch (err) {
      console.error('❌ Failed to delete session:', err);
      error.value = err instanceof Error ? err.message : 'Failed to delete session';
    }
  };

  // Update session title
  const updateSessionTitle = async (sessionId: string, title: string) => {
    try {
      await updateChatSession(sessionId, { title: title.slice(0, 50) });

      const session = chatSessions.value.find(s => s.id === sessionId);
      if (session) {
        session.title = title.slice(0, 50);
        session.updatedAt = new Date();
      }

      console.log('✅ Updated session title:', sessionId);
    } catch (err) {
      console.error('❌ Failed to update session title:', err);
      // Don't show error to user for title updates
    }
  };

  // Add message to current session (local helper)
  const addMessageLocal = (content: string, role: 'user' | 'assistant', isTyping = false) => {
    if (!currentSession.value) {
      return null;
    }

    const message: Message = {
      id: generateId(),
      content,
      role,
      timestamp: new Date(),
      isTyping,
    };

    currentSession.value.messages.push(message);
    currentSession.value.updatedAt = new Date();
    currentSession.value.messageCount = currentSession.value.messages.length;

    return message;
  };

  // Update message content (useful for typing animation)
  const updateMessage = (messageId: string, content: string, isTyping = false) => {
    if (!currentSession.value) {
      return;
    }

    const message = currentSession.value.messages.find(m => m.id === messageId);
    if (message) {
      message.content = content;
      message.isTyping = isTyping;
      currentSession.value.updatedAt = new Date();
    }
  };

  // Send message using real Chat Session API
  const sendMessage = async (userMessage: string, category: string = 'general', authority: Authority = 'SDM') => {
    if (!currentSession.value) {
      await createNewSession(authority);
    }

    if (!currentSession.value) {
      throw new Error('Failed to create or find current session');
    }

    try {
      isLoading.value = true;
      error.value = null;

      console.log(
        `🚀 Sending message to session ${currentSession.value.id} with authority: ${authority}, category: ${category}`
      );

      // Send message to backend API
      const result = await sendMessageToSession(currentSession.value.id, {
        content: userMessage,
        category,
        authority,
        metadata: {
          timestamp: new Date().toISOString(),
          source: 'web',
        },
      });

      // Add messages to local session
      const userMsg = addMessageLocal(userMessage, 'user');
      let assistantMsg = null;

      if (result.assistantMessage) {
        assistantMsg = addMessageLocal(result.assistantMessage.content, 'assistant');
      }

      // Update session title if this is the first user message
      if (currentSession.value.messages.filter(m => m.role === 'user').length === 1) {
        await updateSessionTitle(currentSession.value.id, userMessage);
      }

      console.log('✅ Message sent successfully');

      return {
        userMessage: userMsg,
        assistantMessage: assistantMsg,
        botResponse: result.botResponse,
      };
    } catch (error_) {
      console.error('❌ Chat API Error:', error_);

      // Provide user-friendly error messages
      let errorMessage = 'An error occurred while processing your message.';

      if (error_ instanceof TypeError && error_.message.includes('fetch')) {
        errorMessage =
          'Unable to connect to the chat service. Please check if the backend server is running on http://localhost:8000';
      } else if (error_ instanceof Error) {
        errorMessage = error_.message;
      }

      error.value = errorMessage;

      // Add error message to chat
      addMessageLocal(`❌ Error: ${errorMessage}`, 'assistant');

      throw error_; // Re-throw for component-level handling
    } finally {
      isLoading.value = false;
    }
  };

  // Mock API call for development (remove when you have real API)
  const sendMessageMock = async (userMessage: string) => {
    if (!currentSession.value) {
      await createNewSession();
    }

    try {
      isLoading.value = true;
      error.value = null;

      // Add user message
      addMessageLocal(userMessage, 'user');

      // Add typing indicator
      const assistantMessage = addMessageLocal('', 'assistant', true);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

      // Mock response
      const mockResponses = [
        "I'm a mock ChatBot response. Replace this with your actual API integration.",
        'This is a simulated response to demonstrate the chat interface functionality.',
        "Here's another example response. The real ChatBot would provide more meaningful answers.",
        'I understand your question. This mock response shows how the chat system works.',
        'Thank you for your message. This is how the chat bot will respond once connected to a real API.',
      ];

      const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];

      // Update assistant message
      if (assistantMessage) {
        updateMessage(assistantMessage.id, randomResponse, false);
      }
    } catch (error_) {
      error.value = error_ instanceof Error ? error_.message : 'An error occurred';
    } finally {
      isLoading.value = false;
    }
  };

  // Initialize by loading sessions from API
  const initialize = async () => {
    try {
      await loadChatSessions();

      // If no sessions or no current session, create a new one
      if (chatSessions.value.length === 0) {
        await createNewSession();
      } else if (!currentSessionId.value) {
        // Set the first session as current
        currentSessionId.value = chatSessions.value[0].id;
      } else {
        // Ensure current session exists
        const exists = chatSessions.value.find(s => s.id === currentSessionId.value);
        if (!exists) {
          currentSessionId.value = chatSessions.value[0]?.id || null;
          if (!currentSessionId.value) {
            await createNewSession();
          }
        }
      }
    } catch (err) {
      console.error('❌ Failed to initialize chat:', err);
      // Fallback to creating a local session
      const fallbackSession: ChatSession = {
        id: generateId(),
        title: 'New Chat (Offline)',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        authority: 'SDM',
        messageCount: 0,
        lastActivityAt: new Date(),
      };
      chatSessions.value = [fallbackSession];
      currentSessionId.value = fallbackSession.id;
    }
  };

  return {
    // State
    chatSessions,
    currentSession,
    messages,
    isLoading,
    error,
    currentSessionId,
    userId,

    // Actions
    loadChatSessions,
    createNewSession,
    switchToSession,
    deleteSession,
    sendMessage,
    sendMessageMock, // Keep for fallback
    addMessage: addMessageLocal,
    updateMessage,
    updateSessionTitle,
    initialize,
  };
};
