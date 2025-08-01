<template>
  <div class="upload-training-container">
    <!-- Header -->
    <div class="upload-header">
      <div class="header-content">
        <v-btn icon variant="text" @click="$emit('close')" class="close-btn">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <div class="header-text">
          <h1 class="page-title">Upload Files for AI Training</h1>
          <p class="page-subtitle">Upload documents to train the AI chatbot for {{ currentAuthorityName }}</p>
        </div>
      </div>
    </div>

    <div class="upload-content">
      <v-row>
        <!-- Upload Section -->
        <v-col cols="12" lg="8">
          <v-card class="upload-card" elevation="2">
            <v-card-title class="card-title">
              <v-icon start color="primary">mdi-cloud-upload</v-icon>
              Upload New Files
            </v-card-title>

            <v-card-text>
              <!-- Authority Selection (for ALL, ADMIN, SDM, HUKUM authority users) -->
              <div
                v-if="
                  userAuthority === 'ALL' ||
                  userAuthority === 'ADMIN' ||
                  userAuthority === 'SDM' ||
                  userAuthority === 'HUKUM'
                "
                class="mb-6"
              >
                <v-select
                  v-model="selectedTargetAuthority"
                  :items="targetAuthorityOptions"
                  item-title="name"
                  item-value="code"
                  label="Select Target Authority"
                  variant="outlined"
                  dense
                  :error-messages="errors.targetAuthority"
                  class="mb-4"
                >
                  <template #prepend-inner>
                    <v-icon>mdi-shield-account</v-icon>
                  </template>
                </v-select>
              </div>

              <!-- File Upload Zone -->
              <div
                class="file-drop-zone"
                :class="{ 'drag-over': isDragOver, 'has-files': selectedFiles.length > 0 }"
                @drop="handleDrop"
                @dragover.prevent="isDragOver = true"
                @dragleave="isDragOver = false"
                @click="triggerFileInput"
              >
                <input
                  ref="fileInput"
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt,.md,.xlsx,.xls,.zip"
                  @change="handleFileSelect"
                  style="display: none"
                />

                <div v-if="selectedFiles.length === 0" class="drop-zone-content">
                  <v-icon size="64" color="primary" class="mb-4">mdi-cloud-upload-outline</v-icon>
                  <h3 class="drop-zone-title">Drop files here or click to browse</h3>
                  <p class="drop-zone-subtitle">
                    Supported formats: PDF, DOC, DOCX, TXT, MD, XLSX, XLS, ZIP<br />
                    Maximum file size: 10MB per file
                  </p>
                </div>

                <div v-else class="selected-files">
                  <h4 class="mb-3">Selected Files ({{ selectedFiles.length }})</h4>
                  <v-list density="compact">
                    <v-list-item v-for="(file, index) in selectedFiles" :key="index" class="file-item">
                      <template #prepend>
                        <v-icon :color="getFileIconColor(file.type)">
                          {{ getFileIcon(file.type) }}
                        </v-icon>
                      </template>

                      <v-list-item-title>{{ file.name }}</v-list-item-title>
                      <v-list-item-subtitle>{{ formatFileSize(file.size) }}</v-list-item-subtitle>

                      <template #append>
                        <v-btn icon size="small" variant="text" @click.stop="removeFile(index)">
                          <v-icon>mdi-close</v-icon>
                        </v-btn>
                      </template>
                    </v-list-item>
                  </v-list>
                </div>
              </div>

              <!-- Upload Description -->
              <v-textarea
                v-model="uploadDescription"
                label="Description (Optional)"
                placeholder="Describe the content and purpose of these files..."
                variant="outlined"
                rows="3"
                class="mt-4"
                :error-messages="errors.description"
              />

              <!-- Upload Actions -->
              <div class="upload-actions mt-4">
                <v-btn
                  color="primary"
                  size="large"
                  :disabled="!canUpload"
                  :loading="uploading"
                  @click="uploadFiles"
                  class="upload-btn"
                >
                  <v-icon start>mdi-upload</v-icon>
                  Upload Files
                </v-btn>

                <v-btn variant="text" :disabled="uploading" @click="clearFiles" class="ml-2"> Clear All </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Uploaded Files List -->
        <v-col cols="12" lg="4">
          <v-card class="files-list-card" elevation="2">
            <v-card-title class="card-title">
              <v-icon start color="success">mdi-file-check</v-icon>
              Uploaded Files
              <v-spacer />
              <v-btn icon size="small" variant="text" @click="refreshFilesList" :loading="loadingFilesList">
                <v-icon>mdi-refresh</v-icon>
              </v-btn>
            </v-card-title>

            <v-card-text>
              <!-- Filter by Authority (for ALL authority users) -->
              <div v-if="userAuthority === 'ALL'" class="mb-4">
                <v-select
                  v-model="filterAuthority"
                  :items="filterAuthorityOptions"
                  item-title="name"
                  item-value="code"
                  label="Filter by Authority"
                  variant="outlined"
                  dense
                  clearable
                  @update:model-value="refreshFilesList"
                >
                  <template #prepend-inner>
                    <v-icon>mdi-filter</v-icon>
                  </template>
                </v-select>
              </div>

              <div v-if="loadingFilesList" class="text-center py-4">
                <v-progress-circular indeterminate color="primary" />
                <p class="mt-2">Loading files...</p>
              </div>

              <div v-else-if="uploadedFiles.length === 0" class="text-center py-8">
                <v-icon size="48" color="grey" class="mb-2">mdi-file-outline</v-icon>
                <p class="text-grey">No files uploaded yet</p>
              </div>

              <v-list v-else density="compact">
                <v-list-item v-for="file in uploadedFiles" :key="file.id" class="uploaded-file-item">
                  <template #prepend>
                    <v-icon :color="getFileIconColor(file.type)">
                      {{ getFileIcon(file.type) }}
                    </v-icon>
                  </template>

                  <div class="file-info">
                    <v-list-item-title class="file-name">{{ file.name }}</v-list-item-title>
                    <v-list-item-subtitle class="file-details">
                      {{ formatFileSize(file.size) }} • {{ file.authority }}
                    </v-list-item-subtitle>
                    <v-list-item-subtitle class="file-date">
                      {{ formatUploadDate(file.uploadedAt) }}
                    </v-list-item-subtitle>
                    <div v-if="file.description" class="file-description mt-1">
                      {{ file.description }}
                    </div>
                  </div>

                  <template #append>
                    <v-menu>
                      <template #activator="{ props }">
                        <v-btn icon size="small" variant="text" v-bind="props">
                          <v-icon>mdi-dots-vertical</v-icon>
                        </v-btn>
                      </template>
                      <v-list>
                        <v-list-item @click="downloadFile(file)">
                          <v-list-item-title>
                            <v-icon start>mdi-download</v-icon>
                            Download
                          </v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="deleteFile(file)" class="text-error">
                          <v-list-item-title>
                            <v-icon start>mdi-delete</v-icon>
                            Delete
                          </v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </template>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Upload Progress Dialog -->
    <v-dialog v-model="showUploadProgress" persistent max-width="400">
      <v-card class="upload-progress-dialog">
        <v-card-title class="text-center upload-progress-title">
          <v-icon start color="primary">mdi-upload</v-icon>
          Uploading Files
        </v-card-title>
        <v-card-text class="upload-progress-content">
          <div class="text-center mb-4">
            <v-progress-circular :model-value="uploadProgress" size="80" width="8" color="primary">
              {{ Math.round(uploadProgress) }}%
            </v-progress-circular>
          </div>
          <p class="text-center upload-progress-text">
            Uploading {{ currentUploadIndex + 1 }} of {{ selectedFiles.length }} files...
          </p>
          <p class="text-center text-caption upload-progress-filename">
            {{ currentUploadFile }}
          </p>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-error">
          <v-icon start>mdi-alert</v-icon>
          Confirm Delete
        </v-card-title>
        <v-card-text>
          Are you sure you want to delete "{{ fileToDelete?.name }}"? This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showDeleteDialog = false">Cancel</v-btn>
          <v-btn color="error" @click="confirmDelete" :loading="deleting">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Success Snackbar -->
    <v-snackbar v-model="showSuccessMessage" color="success" timeout="4000">
      <v-icon start>mdi-check-circle</v-icon>
      {{ successMessage }}
    </v-snackbar>

    <!-- Error Snackbar -->
    <v-snackbar v-model="showErrorMessage" color="error" timeout="6000">
      <v-icon start>mdi-alert-circle</v-icon>
      {{ errorMessage }}
    </v-snackbar>
  </div>
</template>

<script lang="ts" setup>
  import { computed, onMounted, ref } from 'vue';
  import { useAuth } from '../composables/useAuth';
  import {
    deleteUploadedFile,
    downloadUploadedFile,
    getUploadedFiles,
    uploadFileForTraining,
  } from '../services/uploadApi';
  import type { Authority, UploadedFile } from '../types/chat';

  interface Emits {
    close: [];
  }

  const emit = defineEmits<Emits>();
  const { userAuthority } = useAuth();

  // Reactive state
  const selectedFiles = ref<File[]>([]);
  const uploadDescription = ref('');
  const selectedTargetAuthority = ref<Authority | null>(null);
  const filterAuthority = ref<Authority | null>(null);
  const uploadedFiles = ref<UploadedFile[]>([]);
  const isDragOver = ref(false);
  const uploading = ref(false);
  const loadingFilesList = ref(false);
  const deleting = ref(false);
  const fileInput = ref<HTMLInputElement | null>(null);

  // Upload progress
  const showUploadProgress = ref(false);
  const uploadProgress = ref(0);
  const currentUploadIndex = ref(0);
  const currentUploadFile = ref('');

  // Delete dialog
  const showDeleteDialog = ref(false);
  const fileToDelete = ref<UploadedFile | null>(null);

  // Messages
  const showSuccessMessage = ref(false);
  const showErrorMessage = ref(false);
  const successMessage = ref('');
  const errorMessage = ref('');

  // Validation errors
  const errors = ref({
    targetAuthority: '',
    description: '',
  });

  // Authority options based on user authority
  const targetAuthorityOptions = computed(() => {
    if (userAuthority.value === 'ALL' || userAuthority.value === 'ADMIN') {
      return [
        { code: 'SDM', name: 'SDM - Sumber Daya Manusia' },
        { code: 'HUKUM', name: 'Hukum - Legal Department' },
      ];
    } else if (userAuthority.value === 'SDM') {
      return [{ code: 'SDM', name: 'SDM - Sumber Daya Manusia' }];
    } else if (userAuthority.value === 'HUKUM') {
      return [{ code: 'HUKUM', name: 'Hukum - Legal Department' }];
    }
    return [];
  });

  const filterAuthorityOptions = computed(() => [
    { code: 'ALL', name: 'All Authorities' },
    ...targetAuthorityOptions.value,
  ]);

  // Computed properties
  const currentAuthorityName = computed(() => {
    if (userAuthority.value === 'ALL') {
      return 'All Authorities';
    }
    const authority = targetAuthorityOptions.value.find(a => a.code === userAuthority.value);
    return authority?.name || userAuthority.value;
  });

  const canUpload = computed(() => {
    const hasFiles = selectedFiles.value.length > 0;
    const hasValidAuthority =
      userAuthority.value === 'ALL' || userAuthority.value === 'ADMIN' ? selectedTargetAuthority.value : true; // For SDM and HUKUM users, authority is automatically set
    return hasFiles && hasValidAuthority && !uploading.value;
  });

  const effectiveAuthority = computed(() => {
    if (userAuthority.value === 'ALL' || userAuthority.value === 'ADMIN') {
      return selectedTargetAuthority.value;
    }
    return userAuthority.value; // For SDM and HUKUM users, use their own authority
  });

  // Methods
  const triggerFileInput = () => {
    fileInput.value?.click();
  };

  const handleFileSelect = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files) {
      addFiles(Array.from(target.files));
    }
  };

  const handleDrop = (event: DragEvent) => {
    event.preventDefault();
    isDragOver.value = false;

    if (event.dataTransfer?.files) {
      addFiles(Array.from(event.dataTransfer.files));
    }
  };

  const addFiles = (files: File[]) => {
    const validFiles = files.filter(file => {
      const validTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'text/markdown',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/zip',
      ];

      const maxSize = 10 * 1024 * 1024; // 10MB

      if (!validTypes.includes(file.type) && !file.name.match(/\.(pdf|doc|docx|txt|md|xlsx|xls|zip)$/i)) {
        showError(`File ${file.name} has an unsupported format.`);
        return false;
      }

      if (file.size > maxSize) {
        showError(`File ${file.name} is too large. Maximum size is 10MB.`);
        return false;
      }

      return true;
    });

    selectedFiles.value.push(...validFiles);
  };

  const removeFile = (index: number) => {
    selectedFiles.value.splice(index, 1);
  };

  const clearFiles = () => {
    selectedFiles.value = [];
    uploadDescription.value = '';
    clearErrors();
  };

  const validateForm = (): boolean => {
    clearErrors();
    let isValid = true;

    if ((userAuthority.value === 'ALL' || userAuthority.value === 'ADMIN') && !selectedTargetAuthority.value) {
      errors.value.targetAuthority = 'Please select a target authority';
      isValid = false;
    }

    return isValid;
  };

  const uploadFiles = async () => {
    if (!validateForm()) return;

    uploading.value = true;
    showUploadProgress.value = true;
    uploadProgress.value = 0;
    currentUploadIndex.value = 0;

    try {
      const authority = effectiveAuthority.value!;
      const totalFiles = selectedFiles.value.length;

      for (let i = 0; i < totalFiles; i++) {
        const file = selectedFiles.value[i];
        currentUploadIndex.value = i;
        currentUploadFile.value = file.name;

        // Use the actual upload service
        await uploadFileForTraining(file, authority, uploadDescription.value);

        uploadProgress.value = ((i + 1) / totalFiles) * 100;
      }

      showSuccess(`Successfully uploaded ${totalFiles} file${totalFiles > 1 ? 's' : ''}`);
      clearFiles();
      await refreshFilesList();
    } catch (error) {
      console.error('Upload error:', error);
      showError('Failed to upload files. Please try again.');
    } finally {
      uploading.value = false;
      showUploadProgress.value = false;
      uploadProgress.value = 0;
    }
  };

  const refreshFilesList = async () => {
    loadingFilesList.value = true;
    try {
      const authority = userAuthority.value === 'ALL' ? filterAuthority.value : userAuthority.value;
      uploadedFiles.value = await getUploadedFiles(authority);
    } catch (error) {
      console.error('Failed to load files:', error);
      showError('Failed to load uploaded files');
    } finally {
      loadingFilesList.value = false;
    }
  };

  const deleteFile = (file: UploadedFile) => {
    fileToDelete.value = file;
    showDeleteDialog.value = true;
  };

  const confirmDelete = async () => {
    if (!fileToDelete.value) return;

    deleting.value = true;
    try {
      await deleteUploadedFile(fileToDelete.value.id);
      showSuccess('File deleted successfully');
      await refreshFilesList();
    } catch (error) {
      console.error('Delete error:', error);
      showError('Failed to delete file');
    } finally {
      deleting.value = false;
      showDeleteDialog.value = false;
      fileToDelete.value = null;
    }
  };

  const downloadFile = async (file: UploadedFile) => {
    try {
      await downloadUploadedFile(file.id, file.name);
      showSuccess(`Downloaded ${file.name}`);
    } catch (error) {
      console.error('Download error:', error);
      showError('Failed to download file');
    }
  };

  const getFileIcon = (fileType: string): string => {
    if (fileType.includes('pdf')) return 'mdi-file-pdf-box';
    if (fileType.includes('word') || fileType.includes('document')) return 'mdi-file-word-box';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'mdi-file-excel-box';
    if (fileType.includes('text') || fileType.includes('markdown')) return 'mdi-file-document-outline';
    if (fileType.includes('zip')) return 'mdi-folder-zip';
    return 'mdi-file-outline';
  };

  const getFileIconColor = (fileType: string): string => {
    if (fileType.includes('pdf')) return 'red';
    if (fileType.includes('word') || fileType.includes('document')) return 'blue';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'green';
    if (fileType.includes('text') || fileType.includes('markdown')) return 'grey';
    if (fileType.includes('zip')) return 'orange';
    return 'grey';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUploadDate = (date: Date | string): string => {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString();
  };

  const showSuccess = (message: string) => {
    successMessage.value = message;
    showSuccessMessage.value = true;
  };

  const showError = (message: string) => {
    errorMessage.value = message;
    showErrorMessage.value = true;
  };

  const clearErrors = () => {
    errors.value = {
      targetAuthority: '',
      description: '',
    };
  };

  // Initialize
  onMounted(() => {
    // Set default target authority for SDM and HUKUM users
    if (userAuthority.value === 'SDM' || userAuthority.value === 'HUKUM') {
      selectedTargetAuthority.value = userAuthority.value;
    }

    refreshFilesList();
  });
</script>

<style scoped>
  .upload-training-container {
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: #fafafa;
  }

  .upload-header {
    background: linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%);
    color: #202887;
    padding: 1rem;
    flex-shrink: 0;
  }

  .header-content {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .close-btn {
    color: primary;
  }

  .header-text h1 {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0;
  }

  .header-text p {
    font-size: 0.9rem;
    opacity: 0.9;
    margin: 0.25rem 0 0 0;
  }

  .upload-content {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem;
  }

  .upload-card,
  .files-list-card {
    height: fit-content;
    background-color: #ffffff;
    border: 1px solid #e9ecef;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
  }

  .upload-card:hover,
  .files-list-card:hover {
    box-shadow: 0 4px 20px rgba(32, 40, 135, 0.08);
    border-color: #dee2e6;
  }

  .card-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #2c3e50;
    background-color: #f8f9fa;
    padding: 1rem;
    margin: -1rem -1rem 1rem -1rem;
    border-radius: 12px 12px 0 0;
    border-bottom: 1px solid #e9ecef;
  }

  .file-drop-zone {
    border: 2px dashed #e0e0e0;
    border-radius: 12px;
    padding: 2rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
    min-height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .file-drop-zone:hover,
  .file-drop-zone.drag-over {
    border-color: #202887;
    background-color: #f8f9ff;
  }

  .file-drop-zone.has-files {
    border-color: #4caf50;
    background-color: #f8fff8;
    text-align: left;
    align-items: flex-start;
    justify-content: flex-start;
  }

  .drop-zone-content {
    max-width: 300px;
  }

  .drop-zone-title {
    color: #202887;
    font-size: 1.125rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  .drop-zone-subtitle {
    color: #666;
    font-size: 0.875rem;
    line-height: 1.4;
  }

  .selected-files {
    width: 100%;
    background: #fff;
    color: #222;
  }

  .selected-files h4 {
    color: #222;
  }

  .selected-files .v-list {
    background: #fff;
    color: #222;
  }

  .selected-files .v-list-item-title {
    color: #222;
  }

  .selected-files .v-list-item-subtitle {
    color: #444;
  }

  .file-item {
    background: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    margin-bottom: 0.5rem;
    transition: all 0.2s ease;
    color: #222;
  }

  .file-item:hover {
    background: #f5f5f5;
    border-color: #202887;
    box-shadow: 0 2px 8px rgba(32, 40, 135, 0.1);
  }

  /* Light Mode Uploaded Files List Styling */
  .uploaded-file-item {
    border-bottom: 1px solid #e9ecef;
    padding: 1rem 0;
    transition: all 0.2s ease;
    background-color: #ffffff;
    border-radius: 8px;
    margin: 2px 0;
  }

  .uploaded-file-item:hover {
    background-color: #f8f9fa;
    border-radius: 8px;
    padding: 1rem;
    margin: 2px -0.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    border: 1px solid #dee2e6;
  }

  .uploaded-file-item:last-child {
    border-bottom: none;
  }

  .file-info {
    flex: 1;
  }

  .file-name {
    font-weight: 600;
    color: #2c3e50;
    font-size: 0.95rem;
  }

  .file-details {
    color: #6c757d;
    font-size: 0.75rem;
    font-weight: 500;
  }

  .file-date {
    color: #adb5bd;
    font-size: 0.7rem;
    font-weight: 400;
  }

  .file-description {
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    padding: 0.5rem;
    border-radius: 6px;
    font-size: 0.75rem;
    color: #495057;
    font-style: italic;
    margin-top: 0.25rem;
  }

  /* Light Mode V-List Styling */
  :deep(.v-list) {
    background-color: #ffffff !important;
    border-radius: 8px !important;
  }

  :deep(.v-list-item) {
    background-color: #ffffff !important;
    color: #2c3e50 !important;
  }

  :deep(.v-list-item:hover) {
    background-color: #f8f9fa !important;
  }

  :deep(.v-list-item-title) {
    color: #2c3e50 !important;
    font-weight: 500 !important;
  }

  :deep(.v-list-item-subtitle) {
    color: #6c757d !important;
  }

  .upload-actions {
    display: flex;
    align-items: center;
    justify-content: flex-start;
  }

  .upload-btn {
    font-weight: 600;
  }

  /* Upload Progress Dialog Styling */
  .upload-progress-dialog {
    background-color: #ffffff;
    border: 1px solid #e0e0e0;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  }

  .upload-progress-title {
    background-color: #f8f9ff;
    color: #202887;
    font-weight: 600;
    border-bottom: 1px solid #e3f2fd;
  }

  .upload-progress-content {
    background-color: #ffffff;
    color: #333;
  }

  .upload-progress-text {
    color: #555;
    font-weight: 500;
  }

  .upload-progress-filename {
    color: #777;
    font-style: italic;
    background-color: #f5f5f5;
    padding: 0.5rem;
    border-radius: 6px;
    margin: 0.5rem 0;
  }

  /* Light Mode Theme for Select Components */
  :deep(.v-select) {
    background-color: #ffffff !important;
  }

  :deep(.v-select .v-field) {
    background-color: #ffffff !important;
    border-radius: 8px !important;
  }

  :deep(.v-select .v-field__input) {
    color: #2c3e50 !important;
    font-weight: 500 !important;
  }

  :deep(.v-select .v-field__append-inner) {
    color: #202887 !important;
  }

  :deep(.v-select .v-field__prepend-inner) {
    color: #202887 !important;
  }

  :deep(.v-select .v-field__label) {
    color: #6c757d !important;
    font-weight: 500 !important;
  }

  :deep(.v-select .v-field--focused .v-field__label) {
    color: #202887 !important;
    font-weight: 600 !important;
  }

  :deep(.v-select .v-field__placeholder) {
    color: #adb5bd !important;
  }

  :deep(.v-select .v-field__outline) {
    color: #dee2e6 !important;
  }

  :deep(.v-select .v-field--focused .v-field__outline) {
    color: #202887 !important;
  }

  :deep(.v-select .v-field--variant-outlined .v-field__outline__start) {
    border-color: #dee2e6 !important;
  }

  :deep(.v-select .v-field--variant-outlined .v-field__outline__end) {
    border-color: #dee2e6 !important;
  }

  :deep(.v-select .v-field--variant-outlined .v-field__outline__notch) {
    border-color: #dee2e6 !important;
  }

  :deep(.v-select .v-field--focused .v-field__outline__start) {
    border-color: #202887 !important;
  }

  :deep(.v-select .v-field--focused .v-field__outline__end) {
    border-color: #202887 !important;
  }

  :deep(.v-select .v-field--focused .v-field__outline__notch) {
    border-color: #202887 !important;
  }

  /* Light Mode Dropdown Menu Styling */
  :deep(.v-select .v-list) {
    background-color: #ffffff !important;
    color: #2c3e50 !important;
    border-radius: 8px !important;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1) !important;
  }

  :deep(.v-select .v-list-item) {
    color: #2c3e50 !important;
    background-color: #ffffff !important;
    border-radius: 4px !important;
    margin: 2px 4px !important;
  }

  :deep(.v-select .v-list-item:hover) {
    background-color: #f8f9fa !important;
    color: #202887 !important;
  }

  :deep(.v-select .v-list-item--active) {
    background-color: #e3f2fd !important;
    color: #202887 !important;
    font-weight: 600 !important;
  }

  :deep(.v-select .v-list-item-title) {
    color: inherit !important;
    font-weight: 500 !important;
  }

  :deep(.v-select .v-list-item-subtitle) {
    color: #6c757d !important;
  }

  /* Light Mode Menu Overlay Styling */
  :deep(.v-overlay__content .v-list) {
    background-color: #ffffff !important;
    color: #2c3e50 !important;
    border: 1px solid #e9ecef !important;
    border-radius: 8px !important;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12) !important;
  }

  :deep(.v-overlay__content .v-list-item) {
    color: #2c3e50 !important;
    background-color: #ffffff !important;
    border-radius: 4px !important;
    margin: 2px 4px !important;
  }

  :deep(.v-overlay__content .v-list-item:hover) {
    background-color: #f8f9fa !important;
    color: #202887 !important;
  }

  :deep(.v-overlay__content .v-list-item--active) {
    background-color: #e3f2fd !important;
    color: #202887 !important;
    font-weight: 600 !important;
  }

  /* Responsive adjustments */
  @media (max-width: 960px) {
    .upload-header {
      padding: 1rem 0.5rem;
    }

    .header-text h1 {
      font-size: 1.25rem;
    }

    .upload-content {
      padding: 1rem 0.5rem;
    }

    .file-drop-zone {
      padding: 1.5rem 1rem;
      min-height: 150px;
    }
  }
</style>
