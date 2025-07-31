export type Authority = 'ALL' | 'SDM' | 'HUKUM' | 'ADMIN';

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  isTyping?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ChatBotResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface ChatBotRequest {
  message: string;
  conversation_history?: Message[];
}

export interface UploadedFile {
  id: string;
  name: string;
  originalName: string;
  size: number;
  type: string;
  authority: Authority;
  description?: string;
  uploadedAt: Date | string;
  uploadedBy: string;
}

export interface UploadFileRequest {
  file: File;
  authority: Authority;
  description?: string;
}

export interface UploadFileResponse {
  id: string;
  name: string;
  size: number;
  uploadedAt: string;
  success: boolean;
  message?: string;
}
