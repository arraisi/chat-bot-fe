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
          <p class="page-subtitle">Upload documents to train the AIVA for {{ currentAuthorityName }}</p>
        </div>
      </div>
    </div>

    <div class="upload-content">
      <v-row>
        <!-- Uploaded Files List -->
        <v-col cols="12">
          <v-card class="files-list-card" elevation="1">
            <v-card-title class="card-title">
              <div class="d-flex align-center justify-space-between w-100">
                <div class="d-flex align-center">
                  <v-icon start color="success">mdi-file-document-multiple</v-icon>
                  Uploaded Files
                </div>
                <v-btn color="primary" size="small" @click="showUploadModal = true">
                  <v-icon start>mdi-plus</v-icon>
                  Add File
                </v-btn>
              </div>
            </v-card-title>

            <v-card-text class="card-content">
              <!-- Filter by Authority (for ALL authority users) -->
              <div v-if="userAuthority === 'ALL'" class="filter-section">
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

              <!-- Data Table -->
              <div class="data-table-container">
                <v-data-table
                  :headers="tableHeaders"
                  :items="uploadedFiles"
                  :loading="loadingFilesList"
                  item-value="id"
                  class="files-data-table"
                  :items-per-page="10"
                  :items-per-page-options="[5, 10, 25, 50]"
                  density="compact"
                >
                  <template #loading>
                    <v-skeleton-loader type="table-row@10"></v-skeleton-loader>
                  </template>

                  <template #no-data>
                    <div class="text-center py-8">
                      <v-icon size="48" color="grey" class="mb-2">mdi-file-outline</v-icon>
                      <p class="text-grey">No files uploaded yet</p>
                    </div>
                  </template>

                  <template #item.id="{ item }">
                    <span style="color: #000000; font-weight: 500">{{ item.id }}</span>
                  </template>

                  <template #item.filename="{ item }">
                    <div class="d-flex align-center">
                      <v-icon
                        :color="getFileIconColor(getFileTypeFromName(item.filename || item.name || ''))"
                        class="me-2"
                        size="20"
                      >
                        {{ getFileIcon(getFileTypeFromName(item.filename || item.name || '')) }}
                      </v-icon>
                      <span class="text-truncate" style="max-width: 200px; color: black">{{
                        item.filename || item.name
                      }}</span>
                    </div>
                  </template>

                  <template #item.authority="{ item }">
                    <v-chip :color="getAuthorityColor(item.authority)" size="small" variant="tonal">
                      {{ item.authority }}
                    </v-chip>
                  </template>

                  <template #item.category="{ item }">
                    <v-chip color="primary" size="small" variant="outlined">
                      {{ item.category }}
                    </v-chip>
                  </template>

                  <template #item.actions="{ item }">
                    <v-menu>
                      <template #activator="{ props }">
                        <v-btn icon size="small" variant="text" v-bind="props">
                          <v-icon>mdi-dots-vertical</v-icon>
                        </v-btn>
                      </template>
                      <v-list>
                        <v-list-item @click="downloadFile(item)">
                          <v-list-item-title>
                            <v-icon start>mdi-download</v-icon>
                            Download
                          </v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="deleteFile(item)" class="text-error">
                          <v-list-item-title>
                            <v-icon start>mdi-delete</v-icon>
                            Delete
                          </v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </template>
                </v-data-table>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Upload Modal -->
    <v-dialog v-model="showUploadModal" max-width="800px" persistent>
      <v-card class="upload-modal-card">
        <v-card-title class="upload-modal-title">
          <div class="d-flex align-center justify-space-between w-100">
            <div class="d-flex align-center">
              <v-icon start color="primary">mdi-cloud-upload</v-icon>
              Upload Files
            </div>
            <v-btn icon variant="text" @click="closeUploadModal" color="grey-darken-1">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>
        </v-card-title>

        <v-card-text class="upload-modal-content">
          <!-- Authority Selection -->
          <v-select
            v-model="modalSelectedAuthority"
            :items="targetAuthorityOptions"
            item-title="name"
            item-value="code"
            label="Target Authority"
            variant="outlined"
            class="mb-4"
            :error-messages="modalErrors.authority"
            :disabled="userAuthority !== 'ALL' && userAuthority !== 'ADMIN'"
          >
            <template #prepend-inner>
              <v-icon>mdi-shield-account</v-icon>
            </template>
          </v-select>

          <!-- Category Selection -->
          <v-select
            v-model="modalSelectedCategory"
            :items="categoryOptions"
            label="Category"
            variant="outlined"
            class="mb-4"
            :error-messages="modalErrors.category"
          >
            <template #prepend-inner>
              <v-icon>mdi-tag</v-icon>
            </template>
          </v-select>

          <!-- File Upload -->
          <div
            class="file-drop-zone"
            :class="{ 'drag-over': isModalDragOver, 'has-files': modalSelectedFiles.length > 0 }"
            @drop="handleModalDrop"
            @dragover.prevent="isModalDragOver = true"
            @dragleave="isModalDragOver = false"
            @click="triggerModalFileInput"
          >
            <input
              ref="modalFileInput"
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.txt,.md,.xlsx,.xls,.zip"
              @change="handleModalFileSelect"
              style="display: none"
            />

            <div v-if="modalSelectedFiles.length === 0" class="drop-zone-content">
              <v-icon size="48" color="primary" class="mb-3">mdi-cloud-upload-outline</v-icon>
              <h4 class="drop-zone-title">Drop files here or click to browse</h4>
              <p class="drop-zone-subtitle">
                Supported formats: PDF, DOC, DOCX, TXT, MD, XLSX, XLS, ZIP<br />
                Maximum file size: 10MB per file
              </p>
            </div>

            <div v-else class="selected-files">
              <h4 class="mb-3">Selected Files ({{ modalSelectedFiles.length }})</h4>
              <v-list density="compact">
                <v-list-item v-for="(file, index) in modalSelectedFiles" :key="index" class="file-item">
                  <template #prepend>
                    <v-icon :color="getFileIconColor(file.type)">
                      {{ getFileIcon(file.type) }}
                    </v-icon>
                  </template>

                  <v-list-item-title>{{ file.name }}</v-list-item-title>
                  <v-list-item-subtitle>{{ formatFileSize(file.size) }}</v-list-item-subtitle>

                  <template #append>
                    <v-btn icon size="small" variant="text" @click.stop="removeModalFile(index)">
                      <v-icon>mdi-close</v-icon>
                    </v-btn>
                  </template>
                </v-list-item>
              </v-list>
            </div>
          </div>
        </v-card-text>

        <v-card-actions class="upload-modal-actions">
          <v-spacer />
          <v-btn variant="text" @click="closeUploadModal" :disabled="modalUploading" color="grey-darken-1">
            Cancel
          </v-btn>
          <v-btn color="primary" @click="uploadModalFile" :disabled="!canUploadModal" :loading="modalUploading">
            <v-icon start>mdi-upload</v-icon>
            Upload {{ modalSelectedFiles.length > 1 ? `${modalSelectedFiles.length} Files` : 'File' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Upload Progress Dialog -->
    <v-dialog v-model="showUploadProgress" persistent max-width="600">
      <v-card class="upload-progress-dialog">
        <v-card-title class="text-center upload-progress-title">
          <v-icon start color="primary">mdi-upload</v-icon>
          Uploading Files ({{ currentUploadIndex + 1 }} of {{ modalSelectedFiles.length }})
        </v-card-title>
        <v-card-text class="upload-progress-content">
          <!-- Overall Progress -->
          <div class="text-center mb-4">
            <v-progress-circular :model-value="uploadProgress" size="80" width="8" color="primary">
              {{ Math.round(uploadProgress) }}%
            </v-progress-circular>
          </div>

          <!-- Current File Progress -->
          <div class="mb-4">
            <p class="text-center upload-progress-text mb-2">
              Currently uploading: <strong>{{ currentUploadFile }}</strong>
            </p>
          </div>

          <!-- Individual File Progress List -->
          <div class="file-progress-list">
            <v-list density="compact" class="file-progress-items">
              <v-list-item v-for="(fileStatus, index) in fileUploadStatuses" :key="index" class="file-progress-item">
                <template #prepend>
                  <v-icon :color="getStatusColor(fileStatus.status)" class="me-2">
                    {{ getStatusIcon(fileStatus.status) }}
                  </v-icon>
                </template>

                <v-list-item-title class="file-progress-name">
                  {{ fileStatus.name }}
                </v-list-item-title>

                <template #append>
                  <div class="file-progress-status">
                    <v-chip :color="getStatusColor(fileStatus.status)" size="small" variant="tonal">
                      {{ getStatusText(fileStatus.status) }}
                    </v-chip>
                  </div>
                </template>
              </v-list-item>
            </v-list>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card class="delete-modal-card">
        <v-card-title class="delete-modal-title">
          <div class="d-flex align-center">
            <v-icon start color="error">mdi-alert</v-icon>
            Confirm Delete
          </div>
        </v-card-title>
        <v-card-text class="delete-modal-content">
          Are you sure you want to delete "{{ fileToDelete?.name }}"? This action cannot be undone.
        </v-card-text>
        <v-card-actions class="delete-modal-actions">
          <v-spacer />
          <v-btn variant="text" @click="showDeleteDialog = false" color="grey-darken-1">Cancel</v-btn>
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
  const filterAuthority = ref<Authority | null>(null);
  const uploadedFiles = ref<UploadedFile[]>([]);
  const loadingFilesList = ref(false);
  const deleting = ref(false);

  // Modal state
  const showUploadModal = ref(false);
  const modalSelectedAuthority = ref<Authority | null>(null);
  const modalSelectedCategory = ref<string>('');
  const modalSelectedFiles = ref<File[]>([]);
  const isModalDragOver = ref(false);
  const modalUploading = ref(false);
  const modalFileInput = ref<HTMLInputElement | null>(null);

  // Modal validation errors
  const modalErrors = ref({
    authority: '',
    category: '',
  });

  // Upload progress
  const showUploadProgress = ref(false);
  const uploadProgress = ref(0);
  const currentUploadIndex = ref(0);
  const currentUploadFile = ref('');
  const fileUploadStatuses = ref<
    Array<{
      name: string;
      status: 'pending' | 'uploading' | 'success' | 'failed';
      progress: number;
    }>
  >([]);

  // Delete dialog
  const showDeleteDialog = ref(false);
  const fileToDelete = ref<UploadedFile | null>(null);

  // Messages
  const showSuccessMessage = ref(false);
  const showErrorMessage = ref(false);
  const successMessage = ref('');
  const errorMessage = ref('');

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

  // Category options
  const categoryOptions = ref([
    'performance',
    'hr-policies',
    'employee-handbook',
    'recruitment',
    'code-of-conduct',
    'compliance',
    'contracts',
    'legal-policies',
    'system-admin',
    'user-management',
    'security',
    'maintenance',
    'general',
    'procedures',
    'announcements',
    'resources',
  ]);

  // Data table headers
  const tableHeaders = ref([
    { title: 'ID', key: 'id', width: '80px', maxWidth: '80px', sortable: false },
    { title: 'Filename', key: 'filename', width: '250px', sortable: false },
    { title: 'Authority', key: 'authority', width: '120px', sortable: false },
    { title: 'Category', key: 'category', width: '150px', sortable: false },
    { title: 'Actions', key: 'actions', width: '80px', maxWidth: '80px', sortable: false },
  ]);

  // Computed properties
  const currentAuthorityName = computed(() => {
    if (userAuthority.value === 'ALL') {
      return 'All Authorities';
    }
    const authority = targetAuthorityOptions.value.find(a => a.code === userAuthority.value);
    return authority?.name || userAuthority.value;
  });

  const canUploadModal = computed(() => {
    return (
      modalSelectedFiles.value.length > 0 &&
      modalSelectedAuthority.value &&
      modalSelectedCategory.value &&
      !modalUploading.value
    );
  });

  // Methods
  const refreshFilesList = async () => {
    loadingFilesList.value = true;
    try {
      const authority = userAuthority.value === 'ALL' ? filterAuthority.value : userAuthority.value;
      uploadedFiles.value = await getUploadedFiles(authority);
      console.log('Uploaded files loaded:', uploadedFiles.value);
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
      await deleteUploadedFile(String(fileToDelete.value.id));
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
      await downloadUploadedFile(String(file.id), file.filename ?? file.name ?? 'download');
      showSuccess(`Downloaded ${file.filename || file.name}`);
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

  // Upload progress helper functions
  const getStatusIcon = (status: string): string => {
    switch (status) {
      case 'pending':
        return 'mdi-clock-outline';
      case 'uploading':
        return 'mdi-upload';
      case 'success':
        return 'mdi-check-circle';
      case 'failed':
        return 'mdi-alert-circle';
      default:
        return 'mdi-help-circle';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'pending':
        return 'grey';
      case 'uploading':
        return 'primary';
      case 'success':
        return 'success';
      case 'failed':
        return 'error';
      default:
        return 'grey';
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'uploading':
        return 'Uploading';
      case 'success':
        return 'Completed';
      case 'failed':
        return 'Failed';
      default:
        return 'Unknown';
    }
  };

  // New helper methods for data table
  const getFileTypeFromName = (filename: string): string => {
    const extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'application/pdf';
      case 'doc':
      case 'docx':
        return 'application/msword';
      case 'xls':
      case 'xlsx':
        return 'application/vnd.ms-excel';
      case 'txt':
        return 'text/plain';
      case 'md':
        return 'text/markdown';
      case 'zip':
        return 'application/zip';
      default:
        return 'application/octet-stream';
    }
  };

  const getAuthorityColor = (authority: string): string => {
    switch (authority) {
      case 'SDM':
        return 'blue';
      case 'HUKUM':
        return 'purple';
      case 'ADMIN':
        return 'orange';
      case 'ALL':
        return 'green';
      default:
        return 'grey';
    }
  };

  // Modal methods
  const closeUploadModal = () => {
    showUploadModal.value = false;
    modalSelectedFiles.value = [];
    modalSelectedAuthority.value = null;
    modalSelectedCategory.value = '';
    fileUploadStatuses.value = [];
    clearModalErrors();
  };

  const triggerModalFileInput = () => {
    modalFileInput.value?.click();
  };

  const handleModalFileSelect = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files) {
      addModalFiles(Array.from(target.files));
    }
  };

  const handleModalDrop = (event: DragEvent) => {
    event.preventDefault();
    isModalDragOver.value = false;

    if (event.dataTransfer?.files) {
      addModalFiles(Array.from(event.dataTransfer.files));
    }
  };

  const addModalFiles = (files: File[]) => {
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

    modalSelectedFiles.value.push(...validFiles);
  };

  const removeModalFile = (index: number) => {
    modalSelectedFiles.value.splice(index, 1);
  };

  const clearModalFiles = () => {
    modalSelectedFiles.value = [];
  };

  const clearModalErrors = () => {
    modalErrors.value = {
      authority: '',
      category: '',
    };
  };

  const validateModalForm = (): boolean => {
    clearModalErrors();
    let isValid = true;

    if (!modalSelectedAuthority.value) {
      modalErrors.value.authority = 'Please select an authority';
      isValid = false;
    }

    if (!modalSelectedCategory.value) {
      modalErrors.value.category = 'Please select a category';
      isValid = false;
    }

    return isValid;
  };

  const uploadModalFile = async () => {
    if (!validateModalForm() || modalSelectedFiles.value.length === 0) return;

    modalUploading.value = true;
    showUploadProgress.value = true;
    uploadProgress.value = 0;

    const totalFiles = modalSelectedFiles.value.length;
    const uploadResults: { success: string[]; failed: string[] } = {
      success: [],
      failed: [],
    };

    // Initialize file upload statuses
    fileUploadStatuses.value = modalSelectedFiles.value.map(file => ({
      name: file.name,
      status: 'pending' as const,
      progress: 0,
    }));

    // Process files one by one, continuing even if one fails
    for (let i = 0; i < totalFiles; i++) {
      const file = modalSelectedFiles.value[i];
      currentUploadIndex.value = i;
      currentUploadFile.value = file.name;

      // Update current file status to uploading
      fileUploadStatuses.value[i].status = 'uploading';

      try {
        // Use the actual upload API with category parameter
        await uploadFileForTraining(
          file,
          modalSelectedAuthority.value!,
          modalSelectedCategory.value,
          `Uploaded via modal - Category: ${modalSelectedCategory.value}`
        );

        // Update file status to success
        fileUploadStatuses.value[i].status = 'success';
        fileUploadStatuses.value[i].progress = 100;

        uploadResults.success.push(file.name);
        console.log(`Successfully uploaded: ${file.name}`);
      } catch (error) {
        // Update file status to failed
        fileUploadStatuses.value[i].status = 'failed';

        uploadResults.failed.push(file.name);
        console.error(`Failed to upload ${file.name}:`, error);
      }

      // Update overall progress regardless of success/failure
      uploadProgress.value = ((i + 1) / totalFiles) * 100;
    }

    // Show comprehensive results
    const successCount = uploadResults.success.length;
    const failedCount = uploadResults.failed.length;

    if (successCount > 0 && failedCount === 0) {
      // All files uploaded successfully
      showSuccess(`Successfully uploaded all ${successCount} file${successCount > 1 ? 's' : ''}`);
    } else if (successCount > 0 && failedCount > 0) {
      // Some files succeeded, some failed
      showSuccess(`Successfully uploaded ${successCount} file${successCount > 1 ? 's' : ''}`);
      showError(
        `Failed to upload ${failedCount} file${failedCount > 1 ? 's' : ''}: ${uploadResults.failed.join(', ')}`
      );
    } else if (failedCount > 0) {
      // All files failed
      showError(
        `Failed to upload all ${failedCount} file${failedCount > 1 ? 's' : ''}: ${uploadResults.failed.join(', ')}`
      );
    }

    // Close modal and refresh list if at least one file was successful
    if (successCount > 0) {
      closeUploadModal();
      // Refresh the files list to show the newly uploaded files
      await refreshFilesList();
    }

    // Always clean up the upload state
    modalUploading.value = false;
    showUploadProgress.value = false;
    uploadProgress.value = 0;
  };

  const showSuccess = (message: string) => {
    successMessage.value = message;
    showSuccessMessage.value = true;
  };

  const showError = (message: string) => {
    errorMessage.value = message;
    showErrorMessage.value = true;
  };

  // Initialize
  onMounted(async () => {
    // Set default target authority for SDM and HUKUM users
    if (userAuthority.value === 'SDM' || userAuthority.value === 'HUKUM') {
      modalSelectedAuthority.value = userAuthority.value;
    }

    // Load files from API on component mount
    await refreshFilesList();
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
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    color: #2c3e50;
    padding: 1rem;
    flex-shrink: 0;
    border-bottom: 1px solid #dee2e6;
  }

  .header-content {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .close-btn {
    color: #2c3e50 !important;
  }

  .header-text h1 {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0;
    color: #2c3e50;
  }

  .header-text p {
    font-size: 0.9rem;
    opacity: 0.8;
    margin: 0.25rem 0 0 0;
    color: #6c757d;
  }

  .upload-content {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem;
  }

  .files-list-card {
    height: fit-content;
    background-color: #ffffff;
    border: 1px solid #e9ecef;
    border-radius: 16px;
    box-shadow: 0 1px 8px rgba(0, 0, 0, 0.04);
    transition: all 0.3s ease;
    overflow: hidden;
  }

  .files-list-card:hover {
    box-shadow: 0 2px 16px rgba(25, 118, 210, 0.06);
    border-color: #dee2e6;
  }

  .card-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #2c3e50;
    background-color: #ffffff;
    padding: 1.5rem;
    border-bottom: 1px solid #f1f3f4;
  }

  .card-content {
    padding: 0 !important;
  }

  .filter-section {
    padding: 1.5rem 1.5rem 0 1.5rem;
    margin-bottom: 1rem;
  }

  .data-table-container {
    padding: 0 1.5rem 1.5rem 1.5rem;
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
    border-color: #1976d2;
    background-color: #f3f8ff;
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
    color: #1976d2;
    font-size: 1.125rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  .drop-zone-subtitle {
    color: #6c757d;
    font-size: 0.875rem;
    line-height: 1.4;
  }

  .selected-files {
    width: 100%;
    background: #ffffff;
    color: #2c3e50;
  }

  .selected-files h4 {
    color: #2c3e50;
    font-weight: 600;
  }

  .selected-files .v-list {
    background: #ffffff;
    color: #2c3e50;
  }

  .selected-files .v-list-item-title {
    color: #2c3e50;
    font-weight: 500;
  }

  .selected-files .v-list-item-subtitle {
    color: #6c757d;
  }

  .selected-file {
    display: flex;
    align-items: center;
    padding: 1rem;
    background: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    color: #2c3e50;
  }

  .selected-file h4 {
    margin: 0;
    color: #2c3e50;
    font-size: 1rem;
    font-weight: 600;
  }

  .selected-file p {
    margin: 0;
    color: #6c757d;
  }

  .file-item {
    background: #ffffff;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    margin-bottom: 0.5rem;
    transition: all 0.2s ease;
    color: #2c3e50;
  }

  .file-item:hover {
    background: #f8f9fa;
    border-color: #1976d2;
    box-shadow: 0 2px 8px rgba(25, 118, 210, 0.15);
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

  /* Upload Modal Light Theme Styling */
  .upload-modal-card {
    background-color: #ffffff !important;
    color: #2c3e50 !important;
    border-radius: 16px !important;
    overflow: hidden !important;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12) !important;
  }

  .upload-modal-title {
    background-color: #ffffff !important;
    color: #2c3e50 !important;
    font-size: 1.25rem !important;
    font-weight: 600 !important;
    padding: 1.5rem !important;
    border-bottom: 1px solid #f1f3f4 !important;
  }

  .upload-modal-content {
    background-color: #ffffff !important;
    color: #2c3e50 !important;
    padding: 1.5rem !important;
  }

  .upload-modal-actions {
    background-color: #ffffff !important;
    padding: 1rem 1.5rem 1.5rem 1.5rem !important;
    border-top: 1px solid #f1f3f4 !important;
  }

  /* Upload Progress Dialog Styling */
  .upload-progress-dialog {
    background-color: #ffffff !important;
    border: 1px solid #e0e0e0 !important;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1) !important;
    border-radius: 16px !important;
    overflow: hidden !important;
  }

  .upload-progress-title {
    background-color: #ffffff !important;
    color: #2c3e50 !important;
    font-weight: 600 !important;
    border-bottom: 1px solid #f1f3f4 !important;
    padding: 1.5rem !important;
  }

  .upload-progress-content {
    background-color: #ffffff !important;
    color: #2c3e50 !important;
    padding: 1.5rem !important;
  }

  /* File Progress List Styling */
  .file-progress-list {
    max-height: 300px;
    overflow-y: auto;
    border: 1px solid #f1f3f4;
    border-radius: 8px;
    background-color: #fafafa;
  }

  .file-progress-items {
    background-color: transparent !important;
  }

  .file-progress-item {
    background-color: #ffffff !important;
    border-bottom: 1px solid #f1f3f4 !important;
    margin: 2px 4px !important;
    border-radius: 6px !important;
    transition: all 0.2s ease !important;
  }

  .file-progress-item:last-child {
    border-bottom: none !important;
  }

  .file-progress-item:hover {
    background-color: #f8f9fa !important;
  }

  .file-progress-name {
    color: #2c3e50 !important;
    font-weight: 500 !important;
    font-size: 0.875rem !important;
  }

  .file-progress-status {
    min-width: 80px;
    text-align: right;
  }

  .upload-progress-text {
    color: #2c3e50;
    font-weight: 500;
  }

  .upload-progress-filename {
    color: #6c757d;
    font-style: italic;
    background-color: #f8f9fa;
    padding: 0.5rem;
    border-radius: 6px;
    margin: 0.5rem 0;
  }

  /* Delete Modal Light Theme Styling */
  .delete-modal-card {
    background-color: #ffffff !important;
    color: #2c3e50 !important;
    border-radius: 16px !important;
    overflow: hidden !important;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12) !important;
  }

  .delete-modal-title {
    background-color: #ffffff !important;
    color: #2c3e50 !important;
    font-weight: 600 !important;
    padding: 1.5rem !important;
    border-bottom: 1px solid #f1f3f4 !important;
  }

  .delete-modal-content {
    background-color: #ffffff !important;
    color: #2c3e50 !important;
    padding: 1.5rem !important;
    line-height: 1.5 !important;
  }

  .delete-modal-actions {
    background-color: #ffffff !important;
    padding: 1rem 1.5rem 1.5rem 1.5rem !important;
    border-top: 1px solid #f1f3f4 !important;
  }

  .upload-progress-text {
    color: #2c3e50;
    font-weight: 500;
  }

  .upload-progress-filename {
    color: #6c757d;
    font-style: italic;
    background-color: #f8f9fa;
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
    color: #1976d2 !important;
  }

  :deep(.v-select .v-field__prepend-inner) {
    color: #1976d2 !important;
  }

  :deep(.v-select .v-field__label) {
    color: #6c757d !important;
    font-weight: 500 !important;
  }

  :deep(.v-select .v-field--focused .v-field__label) {
    color: #1976d2 !important;
    font-weight: 600 !important;
  }

  :deep(.v-select .v-field__placeholder) {
    color: #adb5bd !important;
  }

  :deep(.v-select .v-field__outline) {
    color: #dee2e6 !important;
  }

  :deep(.v-select .v-field--focused .v-field__outline) {
    color: #1976d2 !important;
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
    border-color: #1976d2 !important;
  }

  :deep(.v-select .v-field--focused .v-field__outline__end) {
    border-color: #1976d2 !important;
  }

  :deep(.v-select .v-field--focused .v-field__outline__notch) {
    border-color: #1976d2 !important;
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
    color: #1976d2 !important;
  }

  :deep(.v-select .v-list-item--active) {
    background-color: #e3f2fd !important;
    color: #1976d2 !important;
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
    color: #1976d2 !important;
  }

  :deep(.v-overlay__content .v-list-item--active) {
    background-color: #e3f2fd !important;
    color: #1976d2 !important;
    font-weight: 600 !important;
  }

  /* Light Mode Textarea Styling */
  :deep(.v-textarea) {
    background-color: #ffffff !important;
  }

  :deep(.v-textarea .v-field) {
    background-color: #ffffff !important;
    border-radius: 8px !important;
  }

  :deep(.v-textarea .v-field__input) {
    color: #2c3e50 !important;
  }

  :deep(.v-textarea .v-field__label) {
    color: #6c757d !important;
  }

  :deep(.v-textarea .v-field--focused .v-field__label) {
    color: #1976d2 !important;
  }

  :deep(.v-textarea .v-field__outline) {
    color: #dee2e6 !important;
  }

  :deep(.v-textarea .v-field--focused .v-field__outline) {
    color: #1976d2 !important;
  }

  /* Light Mode Button Styling */
  :deep(.v-btn) {
    color: inherit !important;
  }

  :deep(.v-btn--variant-text) {
    color: #6c757d !important;
  }

  :deep(.v-btn--variant-text:hover) {
    color: #1976d2 !important;
    background-color: #f8f9fa !important;
  }

  /* Modal Dialog Light Theme Styling */
  :deep(.v-dialog .v-card) {
    background-color: #ffffff !important;
    color: #2c3e50 !important;
    border-radius: 16px !important;
  }

  :deep(.v-dialog .v-card-title) {
    background-color: #ffffff !important;
    color: #2c3e50 !important;
  }

  :deep(.v-dialog .v-card-text) {
    background-color: #ffffff !important;
    color: #2c3e50 !important;
  }

  :deep(.v-dialog .v-card-actions) {
    background-color: #ffffff !important;
  }

  /* Snackbar Styling */
  :deep(.v-snackbar) {
    color: #ffffff !important;
  }

  :deep(.v-snackbar .v-snackbar__wrapper) {
    color: #ffffff !important;
  }

  /* Progress Bar Styling */
  :deep(.v-progress-circular) {
    color: #1976d2 !important;
  }

  /* List Item Styling */
  :deep(.v-list-item) {
    color: #2c3e50 !important;
  }

  :deep(.v-list-item:hover) {
    background-color: #f8f9fa !important;
  }

  :deep(.v-list-item-title) {
    color: #2c3e50 !important;
  }

  :deep(.v-list-item-subtitle) {
    color: #6c757d !important;
  }

  /* Menu Styling */
  :deep(.v-menu .v-list) {
    background-color: #ffffff !important;
    border: 1px solid #e9ecef !important;
    border-radius: 8px !important;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
  }

  /* Chip Styling */
  :deep(.v-chip) {
    color: inherit !important;
  }

  :deep(.v-chip--variant-tonal) {
    background-color: rgba(25, 118, 210, 0.12) !important;
    color: #1976d2 !important;
  }

  :deep(.v-chip--variant-outlined) {
    border-color: #1976d2 !important;
    color: #1976d2 !important;
  }

  /* Data Table Light Theme Styling */
  .files-data-table {
    border-radius: 12px !important;
    overflow: hidden !important;
    border: 1px solid #f1f3f4 !important;
  }

  .files-data-table :deep(.v-data-table-header th) {
    font-weight: 600 !important;
    border-bottom: 2px solid #dee2e6 !important;
    font-size: 1rem !important;
    letter-spacing: 0.5px !important;
    text-transform: uppercase !important;
  }

  .files-data-table :deep(.v-table .v-table__wrapper > table > thead > tr > th) {
    font-weight: 600 !important;
    border-bottom: 2px solid #dee2e6 !important;
    font-size: 1rem !important;
    letter-spacing: 0.5px !important;
    text-transform: uppercase !important;
  }

  .files-data-table :deep(.v-data-table__th) {
    font-weight: 600 !important;
    border-bottom: 2px solid #dee2e6 !important;
    font-size: 1rem !important;
    letter-spacing: 0.5px !important;
    text-transform: uppercase !important;
  }

  /* Table Body Styling */
  .files-data-table :deep(.v-table .v-table__wrapper > table > tbody > tr) {
    transition: background-color 0.2s ease !important;
  }

  .files-data-table :deep(.v-table .v-table__wrapper > table > tbody > tr > td) {
    border-bottom: 1px solid #f1f3f4 !important;
    padding: 12px 16px !important;
  }

  /* Table Footer Styling */
  .files-data-table :deep(.v-data-table-footer) {
    border-top: 1px solid #dee2e6 !important;
  }

  /* Additional Header Text Visibility Fixes */
  .files-data-table :deep(.v-data-table-header__content) {
    color: #2c3e50 !important;
    font-weight: 600 !important;
  }

  .files-data-table :deep(.v-data-table__th .v-data-table-header__content) {
    color: #2c3e50 !important;
    font-weight: 600 !important;
  }

  .files-data-table :deep(.v-data-table__th span) {
    color: #2c3e50 !important;
    font-weight: 600 !important;
  }

  .files-data-table :deep(.v-data-table-header th span) {
    color: #2c3e50 !important;
    font-weight: 600 !important;
  }

  /* Force header text color on all possible elements */
  .files-data-table :deep(th) {
    background-color: #f8f9fa !important;
    color: #2c3e50 !important;
    font-weight: 600 !important;
  }

  .files-data-table :deep(th *) {
    color: #2c3e50 !important;
  }

  /* Loading and No Data Styling */
  .files-data-table :deep(.v-data-table__loading) {
    background-color: #ffffff !important;
    color: #2c3e50 !important;
  }

  .files-data-table :deep(.v-skeleton-loader) {
    background-color: #f8f9fa !important;
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
