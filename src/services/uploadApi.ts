import type { Authority, UploadedFile, UploadFileResponse } from '../types/chat';

// Mock API service for file uploads
// In a real implementation, these would connect to your backend

/**
 * Upload a file for AI training
 * @param file - The file to upload
 * @param authority - The authority this file belongs to
 * @param description - Optional description of the file
 * @returns Promise<UploadFileResponse>
 */
export const uploadFileForTraining = async (
  file: File,
  authority: Authority,
  description?: string
): Promise<UploadFileResponse> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Mock response
  return {
    id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: file.name,
    size: file.size,
    uploadedAt: new Date().toISOString(),
    success: true,
    message: 'File uploaded successfully',
  };
};

/**
 * Get list of uploaded files
 * @param authority - Filter by authority (optional, for ALL authority users)
 * @returns Promise<UploadedFile[]>
 */
export const getUploadedFiles = async (authority?: Authority | null): Promise<UploadedFile[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Mock data - return empty array for now
  // In a real implementation, this would fetch from your backend
  return [];
};

/**
 * Delete an uploaded file
 * @param fileId - The ID of the file to delete
 * @returns Promise<void>
 */
export const deleteUploadedFile = async (fileId: string): Promise<void> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Mock implementation - just log for now
  console.log(`Deleting file with ID: ${fileId}`);
};

/**
 * Download an uploaded file
 * @param fileId - The ID of the file to download
 * @param fileName - The original filename for the download
 * @returns Promise<void>
 */
export const downloadUploadedFile = async (fileId: string, fileName: string): Promise<void> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Mock implementation - create a dummy download
  console.log(`Downloading file: ${fileName} (ID: ${fileId})`);

  // In a real implementation, you would fetch the file blob from your backend
  // and create a download link
};
