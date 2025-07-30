<template>
  <div class="chat-input-container">
    <v-form @submit.prevent="handleSubmit">
      <div class="input-wrapper">
        <v-textarea
          v-model="inputMessage"
          auto-grow
          class="flex-grow-1 chat-textarea"
          hide-details
          max-rows="3"
          placeholder="Message PeruriBot..."
          rows="1"
          variant="outlined"
          density="compact"
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
  import { computed, ref } from 'vue';

  interface Props {
    isLoading?: boolean;
    error?: string | null;
  }

  interface Emits {
    'send-message': [message: string];
    'voice-input': [];
  }

  const props = withDefaults(defineProps<Props>(), {
    isLoading: false,
    error: null,
  });

  const emit = defineEmits<Emits>();

  const inputMessage = ref('');

  const canSend = computed(() => {
    return inputMessage.value.trim().length > 0 && !props.isLoading;
  });

  const handleSubmit = () => {
    if (!canSend.value) return;

    const message = inputMessage.value.trim();
    if (message) {
      emit('send-message', message);
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
    padding: 2px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    min-height: 48px;
  }

  .input-wrapper:focus-within {
    border-color: #202887;
    box-shadow: 0 2px 12px rgba(32, 40, 135, 0.15);
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
    }

    .chat-textarea :deep(.v-field__input) {
      padding: 10px 14px !important;
      font-size: 13px;
    }
  }
</style>
