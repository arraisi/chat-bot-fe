import type { Authority, UploadedFile, UploadFileResponse } from '../types/chat';

// Mock API service for file uploads
// In a real implementation, these would connect to your backend

// Mock storage for uploaded files
let uploadedFiles: UploadedFile[] = [
  {
    id: 'file_001',
    name: 'employee_handbook_2024.pdf',
    originalName: 'employee_handbook_2024.pdf',
    size: 2048576,
    type: 'application/pdf',
    authority: 'SDM',
    description: 'Updated employee handbook with new policies and procedures for 2024',
    uploadedAt: new Date('2024-01-15T10:30:00Z'),
    uploadedBy: 'john.doe@sdm.com',
  },
  {
    id: 'file_002',
    name: 'legal_compliance_guide.docx',
    originalName: 'legal_compliance_guide.docx',
    size: 1536000,
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    authority: 'HUKUM',
    description: 'Comprehensive legal compliance guide for corporate governance',
    uploadedAt: new Date('2024-01-20T14:15:00Z'),
    uploadedBy: 'sarah.legal@hukum.com',
  },
  {
    id: 'file_003',
    name: 'training_materials_2024.xlsx',
    originalName: 'training_materials_2024.xlsx',
    size: 512000,
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    authority: 'SDM',
    description: 'Annual training schedule and materials for employee development',
    uploadedAt: new Date('2024-01-25T09:45:00Z'),
    uploadedBy: 'maria.hr@sdm.com',
  },
  {
    id: 'file_004',
    name: 'contract_templates.zip',
    originalName: 'contract_templates.zip',
    size: 3072000,
    type: 'application/zip',
    authority: 'HUKUM',
    description: 'Standard contract templates for various business agreements',
    uploadedAt: new Date('2024-02-01T16:20:00Z'),
    uploadedBy: 'ahmad.law@hukum.com',
  },
  {
    id: 'file_005',
    name: 'performance_review_guidelines.pdf',
    originalName: 'performance_review_guidelines.pdf',
    size: 1024000,
    type: 'application/pdf',
    authority: 'SDM',
    description: 'Guidelines and templates for annual performance reviews',
    uploadedAt: new Date('2024-02-05T11:30:00Z'),
    uploadedBy: 'lisa.hr@sdm.com',
  },
  {
    id: 'file_006',
    name: 'regulatory_requirements.txt',
    originalName: 'regulatory_requirements.txt',
    size: 256000,
    type: 'text/plain',
    authority: 'HUKUM',
    description: 'Updated regulatory requirements and compliance checklist',
    uploadedAt: new Date('2024-02-10T13:45:00Z'),
    uploadedBy: 'david.compliance@hukum.com',
  },
  {
    id: 'file_007',
    name: 'recruitment_policy_2024.md',
    originalName: 'recruitment_policy_2024.md',
    size: 128000,
    type: 'text/markdown',
    authority: 'SDM',
    description: 'Updated recruitment and hiring policies for 2024',
    uploadedAt: new Date('2024-02-12T08:15:00Z'),
    uploadedBy: 'tom.recruiter@sdm.com',
  },
  {
    id: 'file_008',
    name: 'intellectual_property_guide.pdf',
    originalName: 'intellectual_property_guide.pdf',
    size: 3584000,
    type: 'application/pdf',
    authority: 'HUKUM',
    description: 'Comprehensive guide on intellectual property rights and protection',
    uploadedAt: new Date('2024-02-15T15:30:00Z'),
    uploadedBy: 'nina.ip@hukum.com',
  },
];

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

  // Create new file entry
  const newFile: UploadedFile = {
    id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: file.name,
    originalName: file.name,
    size: file.size,
    type: file.type,
    authority: authority,
    description: description,
    uploadedAt: new Date(),
    uploadedBy: 'current_user@example.com', // In real app, get from auth context
  };

  // Add to mock storage
  uploadedFiles.push(newFile);

  // Mock response
  return {
    id: newFile.id,
    name: file.name,
    size: file.size,
    uploadedAt: newFile.uploadedAt instanceof Date ? newFile.uploadedAt.toISOString() : newFile.uploadedAt,
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

  // Filter files by authority if specified
  if (authority && authority !== 'ALL') {
    return uploadedFiles.filter(file => file.authority === authority);
  }

  // Return all files if no authority filter or 'ALL' is specified
  return [...uploadedFiles];
};

/**
 * Delete an uploaded file
 * @param fileId - The ID of the file to delete
 * @returns Promise<void>
 */
export const deleteUploadedFile = async (fileId: string): Promise<void> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Remove file from mock storage
  const fileIndex = uploadedFiles.findIndex(file => file.id === fileId);
  if (fileIndex !== -1) {
    uploadedFiles.splice(fileIndex, 1);
    console.log(`Deleted file with ID: ${fileId}`);
  } else {
    console.log(`File with ID: ${fileId} not found`);
  }
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

  // Find the file in mock storage
  const file = uploadedFiles.find(f => f.id === fileId);
  if (!file) {
    throw new Error(`File with ID: ${fileId} not found`);
  }

  // Mock implementation - create a dummy download
  console.log(`Downloading file: ${fileName} (ID: ${fileId})`);

  // In a real implementation, you would:
  // 1. Fetch the file blob from your backend
  // 2. Create a download link
  // 3. Trigger the download

  // For demo purposes, we'll create a dummy download link
  const dummyContent = `This is a mock download for ${fileName}.\nFile ID: ${fileId}\nSize: ${file.size} bytes\nAuthority: ${file.authority}`;
  const blob = new Blob([dummyContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
