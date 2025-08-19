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
import { useAuth } from './useAuth';

export const useChat = () => {
  // Store chat sessions (fully backend-driven)
  const chatSessions = ref<ChatSession[]>([]);
  const currentSessionId = ref<string | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Get auth data including user profile
  const { userProfile } = useAuth();

  // Get userId from userProfile.givenName
  const userId = computed(() => {
    return userProfile.value?.givenName || 'default-user';
  });

  // Get current active session
  const currentSession = computed(() => {
    if (!currentSessionId.value) {
      return null;
    }

    return chatSessions.value.find((session: ChatSession) => session.id === currentSessionId.value) || null;
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

      // Use userId from userProfile.givenName
      console.log('🔍 Loading sessions for userId:', userId.value);
      const sessions = await getChatSessions(userId.value);
      chatSessions.value = sessions;

      console.log('✅ Loaded sessions:', sessions.length, 'for user:', userId.value);
      return sessions;
    } catch (err) {
      console.error('Failed to load sessions from backend:', err);
      error.value = 'Failed to load chat sessions';
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
        user_id: sessionData?.user_id || userId.value, // Use userId from userProfile.givenName
      };

      console.log('🆕 Creating new session for userId:', newSessionData.user_id);

      // Create session on backend
      const newSession = await createChatSession(newSessionData);

      // Add to local state
      chatSessions.value.unshift(newSession);
      currentSessionId.value = newSession.id;

      console.log('✅ Created new session:', newSession.id, 'for user:', newSessionData.user_id);
      return newSession;
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

      // Load full session with messages from backend
      const session = await getChatSession(sessionId);

      // Update the session in our local state
      const index = chatSessions.value.findIndex((s: ChatSession) => s.id === sessionId);
      if (index !== -1) {
        chatSessions.value[index] = session;
      }
    } catch (err) {
      console.error('Failed to switch to session:', err);
      error.value = 'Failed to load chat session';
    }
  };

  // Delete a session
  const deleteSession = async (sessionId: string) => {
    try {
      // Delete from backend
      await deleteChatSession(sessionId);

      // Remove from local state
      const index = chatSessions.value.findIndex((session: ChatSession) => session.id === sessionId);

      if (index !== -1) {
        chatSessions.value.splice(index, 1);

        // If we deleted the current session, switch to the first available or create new
        if (currentSessionId.value === sessionId) {
          if (chatSessions.value.length > 0) {
            await switchToSession(chatSessions.value[0].id);
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
      // Update on backend
      await updateChatSession(sessionId, { title });

      // Update local state
      const session = chatSessions.value.find((s: ChatSession) => s.id === sessionId);
      if (session) {
        session.title = title.slice(0, 50); // Limit title length
        session.updatedAt = new Date();
      }
    } catch (err) {
      console.error('Failed to update session title:', err);
      error.value = 'Failed to update session title';
      throw err;
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

    return message;
  };

  // Update message content (useful for typing animation)
  const updateMessage = (messageId: string, content: string, isTyping = false) => {
    if (!currentSession.value) {
      return;
    }

    const message = currentSession.value.messages.find((m: Message) => m.id === messageId);
    if (message) {
      message.content = content;
      message.isTyping = isTyping;
      currentSession.value.updatedAt = new Date();
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
      if (currentSession.value.messages.filter((m: Message) => m.role === 'user').length === 1) {
        await updateSessionTitle(currentSession.value.id, userMessage);
      }

      return result;
    } catch (err) {
      console.error('Error sending message:', err);
      error.value = 'Failed to send message. Check your connection.';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Search sessions
  const searchSessions = async (query: string, searchUserId?: string) => {
    try {
      // Use provided userId or default to current user's userId
      const targetUserId = searchUserId || userId.value;
      return await searchChatSessions(query, targetUserId);
    } catch (err) {
      console.error('Search failed:', err);
      error.value = 'Search failed';
      throw err;
    }
  };

  // Initialize the chat system
  const initialize = async () => {
    try {
      // Load sessions from backend
      await loadSessions();

      // Create a session if none exists
      if (chatSessions.value.length === 0) {
        await createNewSession();
      } else if (!currentSessionId.value) {
        currentSessionId.value = chatSessions.value[0].id;
      }
    } catch (err) {
      console.error('Failed to initialize chat system:', err);
      error.value = 'Failed to initialize chat system';
      throw err;
    }
  };

  return {
    // State
    chatSessions: computed(() => chatSessions.value),
    currentSession,
    messages,
    isLoading,
    error,
    currentSessionId,
    userId, // Export userId for debugging/usage

    // Actions
    createNewSession,
    switchToSession,
    deleteSession,
    sendMessage,
    addMessage,
    updateMessage,
    updateSessionTitle,
    searchSessions,
    loadSessions,
    initialize,
  };
};
