import { useLocalStorage } from '@vueuse/core';
import { computed, ref } from 'vue';
import {
  createChatSession,
  deleteChatSession,
  getChatSession,
  getChatSessions,
  searchChatSessions,
  sendMessageToSession,
  updateChatSession,
} from '../services/chatSessionApi';
import type { Authority, ChatSession, Message } from '../types/chat';

export const useChat = () => {
  // Store chat sessions (synced with backend)
  const chatSessions = ref<ChatSession[]>([]);
  const currentSessionId = ref<string | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const isOnline = ref(true); // Track online/offline status

  // Local storage for offline mode
  const localSessions = useLocalStorage<ChatSession[]>('chat-sessions-local', []);
  const localCurrentSessionId = useLocalStorage<string | null>('current-session-id', null);

  // Get current active session
  const currentSession = computed(() => {
    if (!currentSessionId.value) {
      return null;
    }

    const sessions = isOnline.value ? chatSessions.value : localSessions.value;
    return sessions.find(session => session.id === currentSessionId.value) || null;
  });

  // Get current messages
  const messages = computed(() => {
    return currentSession.value?.messages || [];
  });

  // Generate unique ID
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  };

  // Load sessions from backend
  const loadSessions = async () => {
    try {
      isLoading.value = true;
      error.value = null;

      const sessions = await getChatSessions();
      chatSessions.value = sessions;
      isOnline.value = true;

      // Sync with local storage
      localSessions.value = sessions;

      return sessions;
    } catch (err) {
      console.error('Failed to load sessions from backend:', err);
      error.value = 'Failed to load chat sessions';
      isOnline.value = false;

      // Fallback to local storage
      chatSessions.value = localSessions.value;

      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Create new chat session
  const createNewSession = async (sessionData?: { title?: string; authority?: Authority; user_id?: string }) => {
    try {
      isLoading.value = true;
      error.value = null;

      const newSessionData = {
        session_id: generateId(),
        title: sessionData?.title || 'New Chat',
        authority: sessionData?.authority || 'SDM',
        user_id: sessionData?.user_id,
      };

      if (isOnline.value) {
        // Create session on backend
        const newSession = await createChatSession(newSessionData);

        // Add to local state
        chatSessions.value.unshift(newSession);
        currentSessionId.value = newSession.id;

        // Update local storage
        localSessions.value = chatSessions.value;
        localCurrentSessionId.value = newSession.id;

        return newSession;
      } else {
        // Offline mode - create locally
        const newSession: ChatSession = {
          id: newSessionData.session_id,
          title: newSessionData.title,
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          authority: newSessionData.authority,
          messageCount: 0,
        };

        localSessions.value.unshift(newSession);
        chatSessions.value = localSessions.value;
        currentSessionId.value = newSession.id;
        localCurrentSessionId.value = newSession.id;

        return newSession;
      }
    } catch (err) {
      console.error('Failed to create session:', err);
      error.value = 'Failed to create new chat session';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Switch to existing session
  const switchToSession = async (sessionId: string) => {
    try {
      currentSessionId.value = sessionId;
      localCurrentSessionId.value = sessionId;

      if (isOnline.value) {
        // Load full session with messages from backend
        const session = await getChatSession(sessionId);

        // Update the session in our local state
        const index = chatSessions.value.findIndex(s => s.id === sessionId);
        if (index !== -1) {
          chatSessions.value[index] = session;
        }

        // Update local storage
        localSessions.value = chatSessions.value;
      }
    } catch (err) {
      console.error('Failed to switch to session:', err);
      error.value = 'Failed to load chat session';
    }
  };

  // Delete a session
  const deleteSession = async (sessionId: string) => {
    try {
      if (isOnline.value) {
        await deleteChatSession(sessionId);
      }

      // Remove from local state
      const sessions = isOnline.value ? chatSessions.value : localSessions.value;
      const index = sessions.findIndex(session => session.id === sessionId);

      if (index !== -1) {
        sessions.splice(index, 1);

        if (isOnline.value) {
          localSessions.value = chatSessions.value;
        } else {
          chatSessions.value = localSessions.value;
        }

        // If we deleted the current session, switch to the first available or create new
        if (currentSessionId.value === sessionId) {
          if (sessions.length > 0) {
            await switchToSession(sessions[0].id);
          } else {
            await createNewSession();
          }
        }
      }
    } catch (err) {
      console.error('Failed to delete session:', err);
      error.value = 'Failed to delete chat session';
      throw err;
    }
  };

  // Update session title
  const updateSessionTitle = async (sessionId: string, title: string) => {
    try {
      if (isOnline.value) {
        await updateChatSession(sessionId, { title });
      }

      // Update local state
      const sessions = isOnline.value ? chatSessions.value : localSessions.value;
      const session = sessions.find(s => s.id === sessionId);
      if (session) {
        session.title = title.slice(0, 50); // Limit title length
        session.updatedAt = new Date();

        if (isOnline.value) {
          localSessions.value = chatSessions.value;
        } else {
          chatSessions.value = localSessions.value;
        }
      }
    } catch (err) {
      console.error('Failed to update session title:', err);
      error.value = 'Failed to update session title';
    }
  };

  // Add message to current session (local only)
  const addMessage = (content: string, role: 'user' | 'assistant', isTyping = false): Message | null => {
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

    // Update local storage
    if (isOnline.value) {
      localSessions.value = chatSessions.value;
    } else {
      chatSessions.value = localSessions.value;
    }

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

      // Update local storage
      if (isOnline.value) {
        localSessions.value = chatSessions.value;
      } else {
        chatSessions.value = localSessions.value;
      }
    }
  };

  // Send message using backend API
  const sendMessage = async (userMessage: string, category: string = 'general', authority: Authority = 'SDM') => {
    if (!currentSession.value) {
      await createNewSession({ authority });
    }

    if (!currentSession.value) {
      throw new Error('No active session');
    }

    try {
      isLoading.value = true;
      error.value = null;

      if (isOnline.value) {
        // Use backend API
        const messageData = {
          content: userMessage,
          category,
          authority,
          message_id: generateId(),
        };

        const result = await sendMessageToSession(currentSession.value.id, messageData);

        // Add messages to local state
        currentSession.value.messages.push(result.userMessage);
        if (result.assistantMessage) {
          currentSession.value.messages.push(result.assistantMessage);
        }

        // Update session title if this is the first user message
        if (currentSession.value.messages.filter(m => m.role === 'user').length === 1) {
          await updateSessionTitle(currentSession.value.id, userMessage);
        }

        // Update local storage
        localSessions.value = chatSessions.value;

        return result;
      } else {
        // Offline mode - use mock response
        return await sendMessageMock(userMessage);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      isOnline.value = false;
      error.value = 'Failed to send message. Check your connection.';

      // Fallback to mock in offline mode
      return await sendMessageMock(userMessage);
    } finally {
      isLoading.value = false;
    }
  };

  // Mock API call for offline mode
  const sendMessageMock = async (userMessage: string) => {
    if (!currentSession.value) {
      await createNewSession();
    }

    try {
      isLoading.value = true;
      error.value = null;

      // Add user message
      const userMsg = addMessage(userMessage, 'user');

      // Add typing indicator
      const assistantMessage = addMessage('', 'assistant', true);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

      // Mock response
      const mockResponses = [
        "I'm a mock ChatBot response. The backend server might be offline.",
        'This is a simulated response for offline mode.',
        "Here's a mock response while the server is unavailable.",
        'Mock response: I understand your question. Please check your connection.',
        'Offline mode: This is how the chat bot will respond once connected to the backend.',
      ];

      const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];

      // Update assistant message
      if (assistantMessage) {
        updateMessage(assistantMessage.id, randomResponse, false);
      }

      // Update session title if this is the first user message
      if (currentSession.value?.messages.filter(m => m.role === 'user').length === 1) {
        await updateSessionTitle(currentSession.value.id, userMessage);
      }

      return {
        userMessage: userMsg,
        assistantMessage,
      };
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Search sessions
  const searchSessions = async (query: string, userId?: string) => {
    try {
      if (isOnline.value) {
        return await searchChatSessions(query, userId);
      } else {
        // Local search
        const sessions = localSessions.value.filter(
          session =>
            session.title.toLowerCase().includes(query.toLowerCase()) ||
            session.messages.some(message => message.content.toLowerCase().includes(query.toLowerCase()))
        );

        return {
          sessions,
          count: sessions.length,
          query,
        };
      }
    } catch (err) {
      console.error('Search failed:', err);
      error.value = 'Search failed';
      throw err;
    }
  };

  // Initialize the chat system
  const initialize = async () => {
    try {
      // Try to load from backend
      await loadSessions();

      // Restore current session
      if (localCurrentSessionId.value) {
        currentSessionId.value = localCurrentSessionId.value;

        // Try to load the session if online
        if (isOnline.value && currentSessionId.value) {
          try {
            await switchToSession(currentSessionId.value);
          } catch (err) {
            console.error('Failed to restore session:', err);
          }
        }
      }

      // Create a session if none exists
      if (chatSessions.value.length === 0) {
        await createNewSession();
      } else if (!currentSessionId.value) {
        currentSessionId.value = chatSessions.value[0].id;
        localCurrentSessionId.value = chatSessions.value[0].id;
      }
    } catch (err) {
      console.error('Failed to initialize chat system:', err);

      // Fallback to local storage in offline mode
      chatSessions.value = localSessions.value;

      if (chatSessions.value.length === 0) {
        await createNewSession();
      } else if (!currentSessionId.value && localCurrentSessionId.value) {
        currentSessionId.value = localCurrentSessionId.value;
      }
    }
  };

  return {
    // State
    chatSessions: computed(() => (isOnline.value ? chatSessions.value : localSessions.value)),
    currentSession,
    messages,
    isLoading,
    error,
    currentSessionId,
    isOnline,

    // Actions
    createNewSession,
    switchToSession,
    deleteSession,
    sendMessage,
    sendMessageMock,
    addMessage,
    updateMessage,
    updateSessionTitle,
    searchSessions,
    loadSessions,
    initialize,
  };
};
