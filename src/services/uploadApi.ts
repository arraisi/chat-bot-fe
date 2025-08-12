import axios from 'axios';
import type { Authority, UploadedFile, UploadedFilesResponse, UploadFileResponse } from '../types/chat';

// Create axios instance for upload API
// Use VITE_API_BASE_URL or fallback to '/api' for production and 'http://localhost:8000/api' for development
const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.MODE === 'production' ? '/api' : 'http://localhost:8000/api');

const uploadApi = axios.create({
  baseURL: apiBaseUrl,
  timeout: 30_000,
  headers: {
    Accept: 'application/json',
  },
});

// Add request interceptor to include auth token if needed
uploadApi.interceptors.request.use(config => {
  // Add your auth token here if needed
  // const token = localStorage.getItem('auth-token')
  // if (token) {
  //   config.headers.Authorization = `Bearer ${token}`
  // }
  return config;
});

// Add response interceptor for error handling
uploadApi.interceptors.response.use(
  response => response,
  error => {
    console.error('Upload API Error:', error);
    return Promise.reject(error);
  }
);

/**
 * Upload a file for AI training
 * @param file - The file to upload
 * @param authority - The authority this file belongs to
 * @param category - The category this file belongs to
 * @param description - Optional description of the file
 * @returns Promise<UploadFileResponse>
 */
export const uploadFileForTraining = async (
  file: File,
  authority: Authority,
  category: string,
  description?: string
): Promise<UploadFileResponse> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('authority', authority);
    formData.append('category', category);
    if (description) {
      formData.append('description', description);
    }

    const response = await uploadApi.post<UploadFileResponse>('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('File upload error:', error);
    if (axios.isAxiosError(error)) {
      throw new Error(`Upload failed: ${error.response?.statusText || error.message}`);
    }
    throw error;
  }
};

/**
 * Get list of uploaded files
 * @param authority - Filter by authority (optional, for ALL authority users)
 * @returns Promise<UploadedFile[]>
 */
export const getUploadedFiles = async (authority?: Authority | null): Promise<UploadedFile[]> => {
  try {
    const response = await uploadApi.get<UploadedFilesResponse>('/uploaded-files');

    let files = response.data.data;

    // Filter files by authority if specified
    if (authority && authority !== 'ALL') {
      files = files.filter(file => file.authority === authority);
    }

    // Transform the data to match frontend expectations
    return files.map(file => ({
      ...file,
      name: file.filename,
      originalName: file.filename,
      uploadedAt: file.created_at,
      uploadedBy: 'user', // Default value since API doesn't provide this
    }));
  } catch (error) {
    console.error('Error fetching uploaded files:', error);
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to fetch files: ${error.response?.statusText || error.message}`);
    }
    throw error;
  }
};

/**
 * Delete an uploaded file
 * @param fileId - The ID of the file to delete
 * @returns Promise<void>
 */
export const deleteUploadedFile = async (fileId: string | number): Promise<void> => {
  try {
    await uploadApi.delete(`/uploaded-files/${fileId}`);
    console.log(`Deleted file with ID: ${fileId}`);
  } catch (error) {
    console.error('Error deleting file:', error);
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to delete file: ${error.response?.statusText || error.message}`);
    }
    throw error;
  }
};

/**
 * Download an uploaded file
 * @param fileId - The ID of the file to download
 * @param fileName - The original filename for the download
 * @returns Promise<void>
 */
export const downloadUploadedFile = async (fileId: string | number, fileName: string): Promise<void> => {
  try {
    const response = await uploadApi.get(`/uploaded-files/${fileId}/download`, {
      responseType: 'blob',
    });

    // Create a download link
    const blob = new Blob([response.data]);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log(`Downloaded file: ${fileName} (ID: ${fileId})`);
  } catch (error) {
    console.error('Error downloading file:', error);
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to download file: ${error.response?.statusText || error.message}`);
    }
    throw error;
  }
};
