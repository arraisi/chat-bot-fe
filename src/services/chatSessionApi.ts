import axios from 'axios';
import type { Authority, ChatSession, Message } from '../types/chat';

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.PROD ? '/api' : 'http://localhost:8000/api',
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token if needed
api.interceptors.request.use(config => {
  // Add your auth token here if needed
  // const token = localStorage.getItem('auth-token')
  // if (token) {
  //   config.headers.Authorization = `Bearer ${token}`
  // }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    console.error('Chat Session API Error:', error);
    return Promise.reject(error);
  }
);

interface ChatSessionApiResponse {
  success: boolean;
  message: string;
  session?: any;
  sessions?: any[];
  count?: number;
}

interface SendMessageResponse {
  success: boolean;
  message: string;
  session_id: string;
  user_message: any;
  assistant_message?: any;
  bot_response?: any;
  error?: string;
}

interface SearchResponse {
  success: boolean;
  message: string;
  sessions: any[];
  count: number;
  query: string;
}

interface StatsResponse {
  success: boolean;
  message: string;
  stats: {
    total_sessions: number;
    total_messages: number;
    by_authority: Record<string, number>;
    average_messages_per_session: number;
  };
}

/**
 * Get all chat sessions for a user
 */
export const getChatSessions = async (userId?: string, limit: number = 50): Promise<ChatSession[]> => {
  try {
    const params = new URLSearchParams();
    if (userId) params.append('user_id', userId);
    params.append('limit', limit.toString());

    const response = await api.get<ChatSessionApiResponse>(`/chat-sessions?${params}`);

    if (response.data.success && response.data.sessions) {
      return response.data.sessions.map(transformSessionFromApi);
    }

    throw new Error(response.data.message || 'Failed to fetch chat sessions');
  } catch (error) {
    console.error('Error fetching chat sessions:', error);
    throw error;
  }
};

/**
 * Create a new chat session
 */
export const createChatSession = async (sessionData: {
  session_id?: string;
  title?: string;
  authority?: Authority;
  user_id?: string;
}): Promise<ChatSession> => {
  try {
    const response = await api.post<ChatSessionApiResponse>('/chat-sessions', sessionData);

    if (response.data.success && response.data.session) {
      return transformSessionFromApi(response.data.session);
    }

    throw new Error(response.data.message || 'Failed to create chat session');
  } catch (error) {
    console.error('Error creating chat session:', error);
    throw error;
  }
};

/**
 * Get a specific chat session with all messages
 */
export const getChatSession = async (sessionId: string): Promise<ChatSession> => {
  try {
    const response = await api.get<ChatSessionApiResponse>(`/chat-sessions/${sessionId}`);

    if (response.data.success && response.data.session) {
      return transformSessionFromApi(response.data.session);
    }

    throw new Error(response.data.message || 'Failed to fetch chat session');
  } catch (error) {
    console.error('Error fetching chat session:', error);
    throw error;
  }
};

/**
 * Update a chat session
 */
export const updateChatSession = async (
  sessionId: string,
  updateData: {
    title?: string;
    authority?: Authority;
  }
): Promise<ChatSession> => {
  try {
    const response = await api.put<ChatSessionApiResponse>(`/chat-sessions/${sessionId}`, updateData);

    if (response.data.success && response.data.session) {
      return transformSessionFromApi(response.data.session);
    }

    throw new Error(response.data.message || 'Failed to update chat session');
  } catch (error) {
    console.error('Error updating chat session:', error);
    throw error;
  }
};

/**
 * Delete a chat session
 */
export const deleteChatSession = async (sessionId: string): Promise<void> => {
  try {
    const response = await api.delete<{ success: boolean; message: string }>(`/chat-sessions/${sessionId}`);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete chat session');
    }
  } catch (error) {
    console.error('Error deleting chat session:', error);
    throw error;
  }
};

/**
 * Send a message to a chat session
 */
export const sendMessageToSession = async (
  sessionId: string,
  messageData: {
    content: string;
    category?: string;
    authority?: Authority;
    message_id?: string;
    metadata?: any;
  }
): Promise<{
  userMessage: Message;
  assistantMessage?: Message;
  botResponse?: any;
}> => {
  try {
    const response = await api.post<SendMessageResponse>(`/chat-sessions/${sessionId}/messages`, messageData);

    if (response.data.success) {
      return {
        userMessage: transformMessageFromApi(response.data.user_message),
        assistantMessage: response.data.assistant_message
          ? transformMessageFromApi(response.data.assistant_message)
          : undefined,
        botResponse: response.data.bot_response,
      };
    }

    throw new Error(response.data.message || 'Failed to send message');
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

/**
 * Search chat sessions
 */
export const searchChatSessions = async (
  query: string,
  userId?: string,
  limit: number = 20
): Promise<{
  sessions: ChatSession[];
  count: number;
  query: string;
}> => {
  try {
    const params = new URLSearchParams();
    params.append('q', query);
    if (userId) params.append('user_id', userId);
    params.append('limit', limit.toString());

    const response = await api.get<SearchResponse>(`/chat-sessions-search?${params}`);

    if (response.data.success) {
      return {
        sessions: response.data.sessions.map(transformSessionFromApi),
        count: response.data.count,
        query: response.data.query,
      };
    }

    throw new Error(response.data.message || 'Failed to search chat sessions');
  } catch (error) {
    console.error('Error searching chat sessions:', error);
    throw error;
  }
};

/**
 * Get chat session statistics
 */
export const getChatSessionStats = async (userId?: string): Promise<StatsResponse['stats']> => {
  try {
    const params = new URLSearchParams();
    if (userId) params.append('user_id', userId);

    const response = await api.get<StatsResponse>(`/chat-sessions-stats?${params}`);

    if (response.data.success) {
      return response.data.stats;
    }

    throw new Error(response.data.message || 'Failed to fetch chat session stats');
  } catch (error) {
    console.error('Error fetching chat session stats:', error);
    throw error;
  }
};

/**
 * Transform session data from API format to frontend format
 */
function transformSessionFromApi(apiSession: any): ChatSession {
  return {
    id: apiSession.id,
    title: apiSession.title,
    messages: apiSession.messages ? apiSession.messages.map(transformMessageFromApi) : [],
    createdAt: new Date(apiSession.created_at),
    updatedAt: new Date(apiSession.updated_at),
    authority: apiSession.authority,
    messageCount: apiSession.message_count,
    lastActivityAt: apiSession.last_activity_at ? new Date(apiSession.last_activity_at) : null,
  };
}

/**
 * Transform message data from API format to frontend format
 */
function transformMessageFromApi(apiMessage: any): Message {
  return {
    id: apiMessage.id,
    content: apiMessage.content,
    role: apiMessage.role,
    timestamp: new Date(apiMessage.timestamp),
    isTyping: apiMessage.is_typing || false,
    category: apiMessage.category,
    authority: apiMessage.authority,
    metadata: apiMessage.metadata,
  };
}

export default api;
