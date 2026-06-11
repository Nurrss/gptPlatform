<script setup>
import { ref, computed } from 'vue'
import { useI18n } from '../../i18n/index.js'

const props = defineProps({
  accept: { type: String, required: true }, // 'image' | 'pdf'
  modelValue: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue'])

const { t } = useI18n()
const isDragging = ref(false)
const filename = ref('')
const previewSrc = ref('')
const fileInput = ref(null)
const loading = ref(false)
const errorMsg = ref('')

const acceptAttr = computed(() => props.accept === 'image' ? 'image/*' : '.pdf,application/pdf')
const hint = computed(() => props.accept === 'image' ? t('uploadImageHint') : t('uploadPdfHint'))

function extractPdfText(buffer) {
  try {
    const bytes = new Uint8Array(buffer)
    const latin = Array.from(bytes).map((b) => String.fromCharCode(b)).join('')
    const results = []
    const btEt = /BT([\s\S]*?)ET/g
    let m
    while ((m = btEt.exec(latin)) !== null) {
      const block = m[1]
      const tjRe = /\(([^)\\]*(?:\\.[^)\\]*)*)\)\s*Tj/g
      let r
      while ((r = tjRe.exec(block)) !== null) {
        const s = r[1].replace(/\\n/g, '\n').replace(/\\r/g, '').replace(/\\t/g, ' ').replace(/\\/g, '')
        if (s.trim()) results.push(s)
      }
    }
    return results.length ? results.join(' ').replace(/\s+/g, ' ').trim() : null
  } catch {
    return null
  }
}

function processFile(file) {
  if (!file) return
  errorMsg.value = ''
  filename.value = file.name
  loading.value = true

  if (props.accept === 'image') {
    const reader = new FileReader()
    reader.onload = (e) => {
      previewSrc.value = e.target.result
      emit('update:modelValue', `[📸 ${file.name}]\n${e.target.result}`)
      loading.value = false
    }
    reader.onerror = () => { errorMsg.value = 'Ошибка чтения файла'; loading.value = false }
    reader.readAsDataURL(file)
  } else {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = extractPdfText(e.target.result)
      emit('update:modelValue', text ?? `[📄 ${file.name}]`)
      loading.value = false
    }
    reader.onerror = () => { errorMsg.value = 'Ошибка чтения файла'; loading.value = false }
    reader.readAsArrayBuffer(file)
  }
}

function onDrop(e) {
  isDragging.value = false
  processFile(e.dataTransfer?.files?.[0])
}

function onChange(e) {
  processFile(e.target.files?.[0])
}

function clear() {
  filename.value = ''
  previewSrc.value = ''
  errorMsg.value = ''
  emit('update:modelValue', '')
  if (fileInput.value) fileInput.value.value = ''
}
</script>

<template>
  <div class="file-uploader">
    <div
      v-if="!filename"
      class="drop-zone"
      :class="{ dragging: isDragging }"
      @dragover.prevent="isDragging = true"
      @dragleave="isDragging = false"
      @drop.prevent="onDrop"
      @click="fileInput?.click()"
    >
      <div class="drop-icon">{{ accept === 'image' ? '🖼️' : '📄' }}</div>
      <p class="drop-label">{{ t('dragOrClick') }}</p>
      <p class="drop-hint">{{ hint }}</p>
      <input
        ref="fileInput"
        type="file"
        :accept="acceptAttr"
        class="hidden-input"
        @change="onChange"
      />
    </div>

    <div v-else class="file-preview">
      <img v-if="previewSrc" :src="previewSrc" class="img-preview" :alt="filename" />
      <div class="file-info">
        <span class="file-icon">{{ accept === 'image' ? '🖼️' : '📄' }}</span>
        <div class="file-meta">
          <span class="file-status">{{ t('fileLoaded') }}</span>
          <span class="file-name">{{ filename }}</span>
        </div>
        <button class="change-btn" @click="clear">{{ t('changeFile') }}</button>
      </div>
      <p v-if="loading" class="loading-hint">{{ t('checking') }}</p>
    </div>

    <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>
  </div>
</template>

<style scoped>
.file-uploader { width: 100%; }

.drop-zone {
  border: 2px dashed var(--border);
  border-radius: var(--radius);
  padding: 28px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
  text-align: center;
}

.drop-zone:hover,
.drop-zone.dragging {
  border-color: var(--accent);
  background: var(--accent-light);
}

.drop-icon { font-size: 32px; margin-bottom: 4px; }
.drop-label { font-size: 14px; color: var(--text-primary); }
.drop-hint { font-size: 12px; color: var(--text-muted); }
.hidden-input { display: none; }

.file-preview { display: flex; flex-direction: column; gap: 10px; }

.img-preview {
  max-height: 180px;
  max-width: 100%;
  border-radius: var(--radius-sm);
  object-fit: contain;
  border: 1px solid var(--border);
}

.file-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
}

.file-icon { font-size: 20px; flex-shrink: 0; }

.file-meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.file-status { font-size: 12px; color: var(--accent); font-weight: 500; }

.file-name {
  font-size: 13px;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.change-btn {
  font-size: 12px;
  color: var(--text-muted);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 4px 10px;
  flex-shrink: 0;
  transition: color 0.2s, background 0.2s;
}

.change-btn:hover { color: var(--text-primary); background: var(--bg-hover); }
.loading-hint { font-size: 13px; color: var(--text-muted); }
.error-msg { font-size: 13px; color: var(--danger); margin-top: 4px; }
</style>
