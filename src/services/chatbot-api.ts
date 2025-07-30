import type { ChatBotRequest, ChatBotResponse } from '../types/chat';

// Configuration for different API providers
export interface APIConfig {
  endpoint: string;
  apiKey?: string;
  model?: string;
  headers?: Record<string, string>;
}

// Default configurations for popular AI APIs
export const API_CONFIGS = {
  openai: {
    endpoint: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-3.5-turbo',
    headers: {
      'Content-Type': 'application/json',
    },
  },
  anthropic: {
    endpoint: 'https://api.anthropic.com/v1/messages',
    model: 'claude-3-sonnet-20240229',
    headers: {
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
    },
  },
  // Add your custom API configuration here
  custom: {
    endpoint: '/api/chat',
    headers: {
      'Content-Type': 'application/json',
    },
  },
};

export class ChatBotAPI {
  private config: APIConfig;

  constructor(config: APIConfig) {
    this.config = config;
  }

  async sendMessage(request: ChatBotRequest): Promise<ChatBotResponse> {
    try {
      const response = await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          ...this.config.headers,
          ...(this.config.apiKey && { Authorization: `Bearer ${this.config.apiKey}` }),
        },
        body: JSON.stringify(this.formatRequest(request)),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return this.formatResponse(data);
    } catch (error) {
      console.error('ChatBot API Error:', error);
      throw error;
    }
  }

  private formatRequest(request: ChatBotRequest): any {
    // Format for OpenAI-style APIs
    const messages = [...(request.conversation_history || []), { role: 'user', content: request.message }];

    return {
      model: this.config.model,
      messages,
      max_tokens: 1000,
      temperature: 0.7,
    };
  }

  private formatResponse(data: any): ChatBotResponse {
    // Handle different API response formats
    if (data.choices && data.choices[0]?.message?.content) {
      // OpenAI format
      return {
        content: data.choices[0].message.content,
        usage: data.usage,
      };
    } else if (data.content && Array.isArray(data.content)) {
      // Anthropic format
      return {
        content: data.content[0]?.text || '',
        usage: data.usage,
      };
    } else if (data.content) {
      // Simple format
      return {
        content: data.content,
      };
    } else {
      throw new Error('Invalid API response format');
    }
  }
}

// Factory function to create API instances
export const createChatBotAPI = (provider: keyof typeof API_CONFIGS, apiKey?: string): ChatBotAPI => {
  const config = { ...API_CONFIGS[provider], ...(apiKey && { apiKey }) };
  return new ChatBotAPI(config);
};

// Example usage:
// const api = createChatBotAPI('openai', 'your-api-key-here')
// const response = await api.sendMessage({ message: 'Hello!', conversation_history: [] })
