export type Authority = 'ALL' | 'SDM' | 'HUKUM' | 'ADMIN';

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  isTyping?: boolean;
  category?: string;
  authority?: Authority;
  metadata?: any;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date | string;
  updatedAt: Date | string;
  authority?: Authority;
  messageCount?: number;
  lastActivityAt?: Date | string | null;
}

export interface ChatBotResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface ChatAPIResponse {
  success: boolean;
  message: string;
  response: string;
  raw_data: {
    prompt: string;
    otoritas: string;
    kategori: string;
    mock?: boolean;
  };
  timestamp: string;
}

export interface ChatBotRequest {
  message: string;
  conversation_history?: Message[];
}

export interface UploadedFile {
  id: string | number;
  name?: string;
  originalName?: string;
  filename: string;
  path: string;
  size: number;
  type?: string;
  authority: Authority;
  category?: string;
  description?: string;
  uploadedAt?: Date | string;
  uploadedBy?: string;
  created_at: string;
  updated_at: string | null;
}

export interface UploadedFilesResponse {
  draw: number;
  recordsTotal: number;
  recordsFiltered: number;
  data: UploadedFile[];
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
