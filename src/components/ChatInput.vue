<template>
  <div class="chat-input-container">
    <v-form @submit.prevent="handleSubmit">
      <div class="d-flex align-end gap-2">
        <v-textarea
          v-model="inputMessage"
          auto-grow
          class="flex-grow-1"
          hide-details
          max-rows="3"
          placeholder="Type your message here..."
          rows="1"
          variant="outlined"
          density="compact"
          :disabled="isLoading"
          :loading="isLoading"
          @keydown.enter.exact.prevent="handleSubmit"
          @keydown.enter.shift.exact="addNewLine"
        />

        <v-btn
          color="primary"
          icon="mdi-send"
          size="small"
          variant="flat"
          :disabled="!canSend"
          :loading="isLoading"
          @click="handleSubmit"
        />
      </div>
    </v-form>

    <div v-if="error" class="text-error text-caption mt-2">
      {{ error }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'

  interface Props {
    isLoading?: boolean
    error?: string | null
  }

  interface Emits {
    'send-message': [message: string]
  }

  const props = withDefaults(defineProps<Props>(), {
    isLoading: false,
    error: null,
  })

  const emit = defineEmits<Emits>()

  const inputMessage = ref('')

  const canSend = computed(() => {
    return inputMessage.value.trim().length > 0 && !props.isLoading
  })

  const handleSubmit = () => {
    if (!canSend.value) return

    const message = inputMessage.value.trim()
    if (message) {
      emit('send-message', message)
      inputMessage.value = ''
    }
  }

  const addNewLine = () => {
    inputMessage.value += '\n'
  }
</script>

<style scoped>
/* Input styles are handled by the parent floating container */
</style>
