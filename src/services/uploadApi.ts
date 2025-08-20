import axios from 'axios';
import type { Authority, UploadedFile, UploadFileResponse } from '../types/chat';

// Create axios instance for upload API
// Use VITE_API_BASE_URL + '/api' for consistent API endpoint configuration
const uploadApi = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api`,
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
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
    formData.append('otoritas', authority);
    formData.append('category', category);
    if (description) {
      formData.append('description', description);
    }

    const response = await uploadApi.post<UploadFileResponse>('/api/upload', formData, {
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
 * Pagination parameters interface
 */
export interface PaginationParams {
  page?: number;
  perPage?: number;
  search?: string;
  authority?: Authority | null;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated response interface
 */
export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

/**
 * DataTables style pagination parameters
 */
export interface DataTablesParams {
  start?: number;
  length?: number;
  search?: {
    value?: string;
  };
  order?: Array<{
    column: number;
    dir: 'asc' | 'desc';
  }>;
  authority?: Authority | null;
}

/**
 * DataTables style response
 */
export interface DataTablesResponse {
  draw: number;
  recordsTotal: number;
  recordsFiltered: number;
  data: UploadedFile[];
}

/**
 * Get list of uploaded files with pagination (DataTables style)
 * @param params - Pagination and filter parameters
 * @returns Promise<DataTablesResponse>
 */
export const getUploadedFiles = async (params: DataTablesParams = {}): Promise<DataTablesResponse> => {
  try {
    const queryParams = new URLSearchParams();

    // Add pagination parameters
    if (params.start !== undefined) {
      queryParams.append('start', params.start.toString());
    }
    if (params.length !== undefined) {
      queryParams.append('length', params.length.toString());
    }

    // Add search parameter
    if (params.search?.value) {
      queryParams.append('search[value]', params.search.value);
    }

    // Add authority filter
    if (params.authority && params.authority !== 'ALL') {
      queryParams.append('authority', params.authority);
    }

    // Add sorting parameters
    if (params.order && params.order.length > 0) {
      const order = params.order[0];
      queryParams.append('order[0][column]', order.column.toString());
      queryParams.append('order[0][dir]', order.dir);
    }

    const response = await uploadApi.get<DataTablesResponse>(`/uploaded-files?${queryParams.toString()}`);

    // Transform the data to match frontend expectations
    const transformedData = response.data.data.map(file => ({
      ...file,
      name: file.filename,
      originalName: file.filename,
      uploadedAt: file.created_at,
      uploadedBy: 'user', // Default value since API doesn't provide this
    }));

    return {
      ...response.data,
      data: transformedData,
    };
  } catch (error) {
    console.error('Error fetching uploaded files:', error);
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to fetch files: ${error.response?.statusText || error.message}`);
    }
    throw error;
  }
};

/**
 * Get list of uploaded files (simple version for backward compatibility)
 * @param authority - Filter by authority (optional, for ALL authority users)
 * @returns Promise<UploadedFile[]>
 */
export const getUploadedFilesSimple = async (authority?: Authority | null): Promise<UploadedFile[]> => {
  try {
    const response = await getUploadedFiles({
      authority,
      length: -1, // Get all records
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching uploaded files:', error);
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
