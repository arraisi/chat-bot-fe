<template>
  <div class="chat-input-container">
    <v-form @submit.prevent="handleSubmit">
      <div class="input-wrapper">
        <!-- Category Selection Dropdown -->
        <div class="category-selector">
          <v-select
            v-model="selectedCategory"
            :items="availableCategories"
            item-title="label"
            item-value="value"
            placeholder="Select Category"
            variant="plain"
            density="compact"
            hide-details
            class="category-select"
          >
            <template #selection="{ item }">
              <div v-if="item.raw" class="category-chip">
                <v-icon size="14" class="me-1">{{ item.raw.icon }}</v-icon>
                {{ item.raw.label }}
              </div>
              <div v-else class="category-chip category-chip-placeholder">
                <v-icon size="14" class="me-1">mdi-tag-outline</v-icon>
                Category
              </div>
            </template>
            <template #item="{ item, props: itemProps }">
              <v-list-item v-bind="itemProps" class="category-item">
                <template #prepend>
                  <v-icon size="16">{{ item.raw.icon }}</v-icon>
                </template>
                <v-list-item-subtitle>{{ item.raw.description }}</v-list-item-subtitle>
              </v-list-item>
            </template>
          </v-select>
        </div>

        <v-divider vertical class="category-divider" />

        <v-textarea
          v-model="inputMessage"
          auto-grow
          class="flex-grow-1 chat-textarea"
          hide-details
          max-rows="3"
          :placeholder="placeholderText"
          rows="1"
          variant="outlined"
          density="compact"
          :disabled="!selectedCategory"
          @keydown.enter.exact.prevent="handleSubmit"
          @keydown.enter.shift.exact="addNewLine"
        />

        <div class="input-actions">
          <!-- <v-btn icon size="small" variant="text" color="grey" class="voice-btn" @click="handleVoiceInput">
            <v-icon>mdi-microphone</v-icon>
            <v-tooltip activator="parent" location="top">Voice Input</v-tooltip>
          </v-btn> -->

          <v-btn
            color="primary"
            icon
            size="small"
            variant="flat"
            class="send-btn"
            :disabled="!canSend"
            :loading="isLoading"
            @click="handleSubmit"
          >
            <v-icon>mdi-send</v-icon>
            <v-tooltip activator="parent" location="top">Send Message</v-tooltip>
          </v-btn>
        </div>
      </div>
    </v-form>

    <!-- Footer with disclaimer and branding -->
    <div class="chat-footer">
      <div class="disclaimer-text">PeruriBot can make mistakes. Check our Terms & Conditions.</div>
      <div class="powered-by">Powered by <strong>NUTANIX</strong></div>
    </div>

    <div v-if="error" class="text-error text-caption mt-2">
      {{ error }}
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed, ref, watch } from 'vue';
  import type { Authority } from '../types/chat';

  interface Props {
    isLoading?: boolean;
    error?: string | null;
    userAuthority?: Authority | null;
  }

  interface Emits {
    'send-message': [message: string, category?: string];
    'voice-input': [];
  }

  interface CategoryOption {
    value: string;
    label: string;
    description: string;
    icon: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    isLoading: false,
    error: null,
    userAuthority: null,
  });

  const emit = defineEmits<Emits>();

  const inputMessage = ref('');
  const selectedCategory = ref<string>('');

  // Define categories based on user authority
  const getCategoriesByAuthority = (authority: Authority | null): CategoryOption[] => {
    switch (authority) {
      case 'HUKUM':
        return [
          {
            value: 'code-of-conduct',
            label: 'Code of Conduct',
            description: 'Legal guidelines and ethical standards',
            icon: 'mdi-gavel',
          },
          {
            value: 'compliance',
            label: 'Compliance',
            description: 'Regulatory compliance matters',
            icon: 'mdi-shield-check',
          },
          {
            value: 'contracts',
            label: 'Contracts',
            description: 'Contract-related inquiries',
            icon: 'mdi-file-document',
          },
          {
            value: 'legal-policies',
            label: 'Legal Policies',
            description: 'Company legal policies',
            icon: 'mdi-scale-balance',
          },
        ];
      case 'SDM':
        return [
          {
            value: 'hr-policies',
            label: 'HR Policies',
            description: 'Human resources policies and procedures',
            icon: 'mdi-account-group',
          },
          {
            value: 'employee-handbook',
            label: 'Employee Handbook',
            description: 'Employee guidelines and benefits',
            icon: 'mdi-book-open',
          },
          {
            value: 'performance',
            label: 'Performance',
            description: 'Performance evaluation and management',
            icon: 'mdi-chart-line',
          },
          {
            value: 'recruitment',
            label: 'Recruitment',
            description: 'Hiring and recruitment processes',
            icon: 'mdi-account-plus',
          },
        ];
      case 'ADMIN':
        return [
          {
            value: 'system-admin',
            label: 'System Administration',
            description: 'System management and configuration',
            icon: 'mdi-cog',
          },
          {
            value: 'user-management',
            label: 'User Management',
            description: 'User accounts and permissions',
            icon: 'mdi-account-settings',
          },
          {
            value: 'security',
            label: 'Security',
            description: 'Security protocols and measures',
            icon: 'mdi-security',
          },
          {
            value: 'maintenance',
            label: 'Maintenance',
            description: 'System maintenance and updates',
            icon: 'mdi-wrench',
          },
        ];
      case 'ALL':
        return [
          {
            value: 'general',
            label: 'General',
            description: 'General company information',
            icon: 'mdi-information',
          },
          {
            value: 'procedures',
            label: 'Procedures',
            description: 'Standard operating procedures',
            icon: 'mdi-clipboard-list',
          },
          {
            value: 'announcements',
            label: 'Announcements',
            description: 'Company announcements and news',
            icon: 'mdi-bullhorn',
          },
          {
            value: 'resources',
            label: 'Resources',
            description: 'Company resources and tools',
            icon: 'mdi-folder',
          },
        ];
      default:
        return [
          {
            value: 'general',
            label: 'General',
            description: 'General inquiries',
            icon: 'mdi-help-circle',
          },
        ];
    }
  };

  const availableCategories = computed(() => getCategoriesByAuthority(props.userAuthority));

  // Clear selected category when authority changes (categories change)
  watch(
    availableCategories,
    (newCategories, oldCategories) => {
      // Clear the selected category when categories change (authority change)
      if (oldCategories && newCategories !== oldCategories) {
        selectedCategory.value = '';
      }
    },
    { immediate: false }
  );

  const placeholderText = computed(() => {
    if (!selectedCategory.value) {
      return 'Please select the category';
    }
    const categoryLabel =
      availableCategories.value.find(cat => cat.value === selectedCategory.value)?.label || 'PeruriBot';
    return `Ask about ${categoryLabel}...`;
  });

  const canSend = computed(() => {
    return inputMessage.value.trim().length > 0 && !props.isLoading && selectedCategory.value;
  });

  const handleSubmit = () => {
    if (!canSend.value) return;

    const message = inputMessage.value.trim();
    if (message) {
      emit('send-message', message, selectedCategory.value);
      inputMessage.value = '';
    }
  };

  const addNewLine = () => {
    inputMessage.value += '\n';
  };

  const handleVoiceInput = () => {
    emit('voice-input');
  };
</script>

<style scoped>
  .chat-input-container {
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
    padding: 16px;
    background-color: #f5f5f5 !important;
  }

  .input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    background: white;
    border-radius: 20px;
    border: 1px solid #e0e0e0;
    padding: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    min-height: 48px;
    gap: 0;
  }

  .input-wrapper:focus-within {
    border-color: #202887;
    box-shadow: 0 2px 12px rgba(32, 40, 135, 0.15);
  }

  /* Category Selector Styles */
  .category-selector {
    min-width: 120px;
    max-width: 160px;
    padding: 8px 12px;
    display: flex;
    align-items: center;
  }

  .category-select :deep(.v-field) {
    border: none !important;
    box-shadow: none !important;
    background: transparent !important;
    min-height: auto !important;
    padding: 0 !important;
  }

  .category-select :deep(.v-field__input) {
    padding: 0 !important;
    min-height: auto !important;
    font-size: 13px !important;
    font-weight: 500 !important;
    color: #202887 !important;
    display: flex !important;
    align-items: center !important;
  }

  .category-select :deep(.v-field__append-inner) {
    padding: 0 !important;
    margin-left: 4px !important;
    align-items: center !important;
  }

  .category-select :deep(.v-icon) {
    font-size: 16px !important;
    color: #666 !important;
  }

  /* Placeholder styling for category select */
  .category-select :deep(.v-field__input input::placeholder) {
    color: #999 !important;
    opacity: 1 !important;
    font-size: 13px !important;
    font-weight: 400 !important;
  }

  .category-select :deep(.v-field__input .v-field__placeholder) {
    color: #999 !important;
    opacity: 1 !important;
    font-size: 13px !important;
    font-weight: 400 !important;
  }

  .category-chip {
    display: flex;
    align-items: center;
    font-size: 13px;
    font-weight: 500;
    color: #202887;
    line-height: 1;
  }

  .category-chip-placeholder {
    color: #999 !important;
    font-weight: 400 !important;
  }

  .category-chip-placeholder .v-icon {
    color: #999 !important;
  }

  .category-divider {
    height: 32px;
    margin: 0 8px;
    opacity: 0.3;
    align-self: center;
  }

  /* Category dropdown items */
  :deep(.category-item) {
    min-height: 56px !important;
  }

  :deep(.category-item .v-list-item-title) {
    font-weight: 500 !important;
    color: #1a1a1a !important;
  }

  :deep(.category-item .v-list-item-subtitle) {
    font-size: 12px !important;
    color: #666 !important;
  }

  :deep(.category-item:hover) {
    background-color: rgba(32, 40, 135, 0.05) !important;
  }

  .chat-textarea :deep(.v-field) {
    border: none !important;
    box-shadow: none !important;
    background: transparent !important;
  }

  .chat-textarea :deep(.v-field__outline) {
    display: none !important;
  }

  .chat-textarea :deep(.v-field__input) {
    padding: 12px 16px !important;
    min-height: 20px !important;
    font-size: 14px;
    font-family: 'Manrope', sans-serif;
    display: flex;
    align-items: center;
  }

  .input-actions {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px;
  }

  .voice-btn {
    color: #666 !important;
  }

  .voice-btn:hover {
    background-color: rgba(0, 0, 0, 0.04) !important;
  }

  .send-btn {
    background-color: #202887 !important;
    color: white !important;
    border-radius: 50% !important;
    min-width: 32px !important;
    width: 32px !important;
    height: 32px !important;
  }

  .send-btn:disabled {
    background-color: #e0e0e0 !important;
    color: #999 !important;
  }

  .send-btn:hover:not(:disabled) {
    background-color: #1a1f6b !important;
    transform: scale(1.05);
    transition: all 0.2s ease;
  }

  .chat-footer {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    margin-top: 12px;
    font-family: 'Manrope', sans-serif;
  }

  .disclaimer-text {
    font-size: 12px;
    color: #666;
    text-align: center;
  }

  .powered-by {
    font-size: 11px;
    color: #888;
    text-align: center;
  }

  .powered-by strong {
    color: #202887;
    font-weight: 600;
  }

  /* Responsive adjustments */
  @media (max-width: 600px) {
    .chat-input-container {
      padding: 12px;
    }

    .input-wrapper {
      border-radius: 18px;
      min-height: 44px;
      padding: 2px;
    }

    .category-selector {
      min-width: 100px;
      max-width: 140px;
      padding: 6px 8px;
    }

    .category-divider {
      height: 28px;
      margin: 0 6px;
    }

    .chat-textarea :deep(.v-field__input) {
      padding: 10px 14px !important;
      font-size: 13px;
    }
  }
</style>
