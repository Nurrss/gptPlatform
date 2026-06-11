<script setup>
import { ref, watch } from 'vue'
import { useModesStore } from '../../stores/modes'
import { useChatStore } from '../../stores/chat'
import { useI18n } from '../../i18n/index.js'
import FileUploader from './FileUploader.vue'

const modesStore = useModesStore()
const chatStore = useChatStore()
const { t } = useI18n()
const error = ref('')

// 'text' | 'image' | 'pdf'
const inputFormat = ref('text')

const formats = [
  { key: 'text', labelKey: 'formatText', icon: '✏️' },
  { key: 'image', labelKey: 'formatImage', icon: '🖼️' },
  { key: 'pdf', labelKey: 'formatPdf', icon: '📄' },
]

// Reset file-upload fields when format changes
watch(inputFormat, () => {
  const mode = modesStore.selectedMode
  if (!mode) return
  for (const field of mode.fields) {
    if (field.supportsFileUpload) {
      modesStore.updateField(field.name, field.default ?? '')
    }
  }
})

function hasModeWithFileUpload() {
  return modesStore.selectedMode?.fields?.some((f) => f.supportsFileUpload)
}

function fieldLabel(field) {
  return t(`modes.${modesStore.selectedMode?.id}.fields.${field.name}.label`) || field.label
}

function fieldPlaceholder(field) {
  return t(`modes.${modesStore.selectedMode?.id}.fields.${field.name}.placeholder`) || field.placeholder || ''
}

async function submit() {
  error.value = ''
  const validation = modesStore.validateForm()
  if (!validation.valid) {
    error.value = validation.error
    return
  }
  try {
    chatStore.currentChatId = null
    await chatStore.sendCheckRequest()
    modesStore.clearMode()
    inputFormat.value = 'text'
  } catch (e) {
    error.value = e.message
  }
}

function cancel() {
  modesStore.clearMode()
  inputFormat.value = 'text'
}
</script>

<template>
  <div v-if="modesStore.selectedMode" class="mode-form">
    <div class="form-header">
      <button class="back-btn" @click="cancel">{{ t('back') }}</button>
      <div class="form-title">
        <span class="icon">{{ modesStore.selectedMode.icon }}</span>
        <div>
          <h3>{{ t(`modes.${modesStore.selectedMode.id}.name`) || modesStore.selectedMode.name }}</h3>
          <p>{{ t(`modes.${modesStore.selectedMode.id}.desc`) || modesStore.selectedMode.description }}</p>
        </div>
      </div>
    </div>

    <!-- Format selector (only for modes that have file-upload fields) -->
    <div v-if="hasModeWithFileUpload()" class="format-selector">
      <span class="format-label">{{ t('inputFormat') }}:</span>
      <div class="format-tabs">
        <button
          v-for="fmt in formats"
          :key="fmt.key"
          class="format-tab"
          :class="{ active: inputFormat === fmt.key }"
          @click="inputFormat = fmt.key"
        >
          <span>{{ fmt.icon }}</span>
          <span>{{ t(fmt.labelKey) }}</span>
        </button>
      </div>
    </div>

    <div class="fields">
      <div
        v-for="field in modesStore.selectedMode.fields"
        :key="field.name"
        class="field"
      >
        <label :for="field.name">
          {{ fieldLabel(field) }}
          <span v-if="field.required" class="required">*</span>
        </label>

        <!-- File upload fields -->
        <template v-if="field.supportsFileUpload && inputFormat !== 'text'">
          <FileUploader
            :accept="inputFormat"
            :model-value="modesStore.formData[field.name] || ''"
            @update:model-value="modesStore.updateField(field.name, $event)"
          />
        </template>

        <!-- Normal text/number fields -->
        <template v-else>
          <textarea
            v-if="field.type === 'textarea'"
            :id="field.name"
            :value="modesStore.formData[field.name]"
            :placeholder="fieldPlaceholder(field)"
            rows="5"
            @input="modesStore.updateField(field.name, $event.target.value)"
          />
          <input
            v-else-if="field.type === 'number'"
            :id="field.name"
            type="number"
            :value="modesStore.formData[field.name]"
            :min="field.min"
            :max="field.max"
            @input="modesStore.updateField(field.name, Number($event.target.value))"
          />
          <input
            v-else
            :id="field.name"
            type="text"
            :value="modesStore.formData[field.name]"
            :placeholder="fieldPlaceholder(field)"
            @input="modesStore.updateField(field.name, $event.target.value)"
          />
        </template>
      </div>
    </div>

    <p v-if="error" class="error-message">{{ error }}</p>

    <button
      class="btn btn-primary submit-btn"
      :disabled="chatStore.isGenerating"
      @click="submit"
    >
      {{ chatStore.isGenerating ? t('checking') : t('check') }}
    </button>
  </div>
</template>

<style scoped>
.mode-form {
  max-width: 720px;
  width: 100%;
  margin: 0 auto;
  padding: 24px;
}

.form-header {
  margin-bottom: 24px;
}

.back-btn {
  color: var(--text-secondary);
  font-size: 14px;
  margin-bottom: 16px;
  padding: 4px 0;
}

.back-btn:hover {
  color: var(--text-primary);
}

.form-title {
  display: flex;
  align-items: center;
  gap: 16px;
}

.icon {
  font-size: 40px;
}

h3 {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 4px;
}

.form-title p {
  color: var(--text-secondary);
  font-size: 14px;
}

.format-selector {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding: 12px 16px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
}

.format-label {
  font-size: 13px;
  color: var(--text-muted);
  flex-shrink: 0;
}

.format-tabs {
  display: flex;
  gap: 6px;
}

.format-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  transition: all 0.15s;
}

.format-tab:hover {
  border-color: var(--accent);
  color: var(--text-primary);
}

.format-tab.active {
  background: var(--accent);
  border-color: var(--accent);
  color: white;
}

.fields {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

label {
  font-size: 14px;
  color: var(--text-secondary);
}

.required {
  color: var(--danger);
}

input, textarea {
  padding: 10px 14px;
  width: 100%;
  resize: vertical;
}

.submit-btn {
  width: 100%;
  padding: 14px;
  font-size: 16px;
}
</style>
