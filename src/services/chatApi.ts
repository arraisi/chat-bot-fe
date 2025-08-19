import type { ChatBotRequest, ChatBotResponse } from '../types/chat';

import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.PROD ? '/api' : 'http://localhost:3000/api',
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
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

/**
 * Send a message to the ChatBot API
 *
 * Example usage:
 * const response = await sendChatMessage({
 *   message: "Hello, how are you?",
 *   conversation_history: previousMessages
 * })
 */
export const sendChatMessage = async (request: ChatBotRequest): Promise<ChatBotResponse> => {
  try {
    const response = await api.post<ChatBotResponse>('/chat', request);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Chat API Error: ${error.response?.status} ${error.response?.statusText}`);
    }
    throw error;
  }
};

/**
 * Example ChatGPT API integration
 * Replace this with your actual ChatGPT API implementation
 */
export const sendToChatGPT = async (request: ChatBotRequest): Promise<ChatBotResponse> => {
  try {
    // Example for OpenAI ChatGPT API
    const openAIResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo', // or 'gpt-4'
        messages: [
          ...(request.conversation_history || []).map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
          {
            role: 'user',
            content: request.message,
          },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      content: openAIResponse.data.choices[0].message.content,
      usage: openAIResponse.data.usage,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`OpenAI API Error: ${error.response?.status} ${error.response?.statusText}`);
    }
    throw error;
  }
};

export default api;
