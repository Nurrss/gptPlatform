<script setup>
import { ref, nextTick, watch, computed, onMounted, onUnmounted } from 'vue'
import { useChatStore } from '../../stores/chat'
import { useModesStore } from '../../stores/modes'
import { useI18n } from '../../i18n/index.js'

const props = defineProps({
  prefill: { type: String, default: '' },
})
const emit = defineEmits(['consumed'])

const chat = useChatStore()
const modesStore = useModesStore()
const { t } = useI18n()

const input = ref('')
const textareaRef = ref(null)
const showAttachMenu = ref(false)
const attachments = ref([])
const imageInputRef = ref(null)
const pdfInputRef = ref(null)
const attachWrapperRef = ref(null)

// When parent injects a template → fill textarea and consume
watch(() => props.prefill, (val) => {
  if (!val) return
  input.value = val
  emit('consumed')
  nextTick(() => {
    autoResize()
    const el = textareaRef.value
    if (el) {
      el.focus()
      el.selectionStart = el.selectionEnd = el.value.length
    }
  })
})

function autoResize() {
  const el = textareaRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 240) + 'px'
}

// ─── File helpers ────────────────────────────────────────────
function readAs(file, method) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.onerror = reject
    reader[method](file)
  })
}

function extractPdfText(buffer) {
  try {
    const latin = Array.from(new Uint8Array(buffer)).map((b) => String.fromCharCode(b)).join('')
    const results = []
    const btEt = /BT([\s\S]*?)ET/g
    let m
    while ((m = btEt.exec(latin)) !== null) {
      const tjRe = /\(([^)\\]*(?:\\.[^)\\]*)*)\)\s*Tj/g
      let r
      while ((r = tjRe.exec(m[1])) !== null) {
        const s = r[1].replace(/\\n/g, '\n').replace(/\\r/g, '').replace(/\\/g, '')
        if (s.trim()) results.push(s)
      }
    }
    return results.length ? results.join(' ').replace(/\s+/g, ' ').trim() : null
  } catch {
    return null
  }
}

async function addImage(file) {
  const dataUrl = await readAs(file, 'readAsDataURL')
  attachments.value.push({ id: crypto.randomUUID(), name: file.name, type: 'image', content: `[📸 ${file.name}]\n${dataUrl}`, preview: dataUrl })
}

async function addPdf(file) {
  const buffer = await readAs(file, 'readAsArrayBuffer')
  const text = extractPdfText(buffer) ?? `[📄 ${file.name}]`
  attachments.value.push({ id: crypto.randomUUID(), name: file.name, type: 'pdf', content: text, preview: null })
}

async function onImageChange(e) {
  const file = e.target.files?.[0]
  if (file) await addImage(file)
  e.target.value = ''
}

async function onPdfChange(e) {
  const file = e.target.files?.[0]
  if (file) await addPdf(file)
  e.target.value = ''
}

function removeAttachment(id) {
  attachments.value = attachments.value.filter((a) => a.id !== id)
}

// ─── Attach menu ────────────────────────────────────────────
function openImage() {
  showAttachMenu.value = false
  imageInputRef.value?.click()
}

function openPdf() {
  showAttachMenu.value = false
  pdfInputRef.value?.click()
}

function onOutsideClick(e) {
  if (attachWrapperRef.value && !attachWrapperRef.value.contains(e.target)) {
    showAttachMenu.value = false
  }
}

onMounted(() => document.addEventListener('click', onOutsideClick, true))
onUnmounted(() => document.removeEventListener('click', onOutsideClick, true))

// ─── Submit ──────────────────────────────────────────────────
async function submit() {
  const textPart = input.value.trim()
  const fileParts = attachments.value.map((a) => a.content)
  const content = [...fileParts, textPart].filter(Boolean).join('\n\n')
  if (!content || chat.isGenerating) return

  const modeId = modesStore.selectedModeId || chat.currentChat?.modeId || null
  input.value = ''
  attachments.value = []
  await nextTick()
  autoResize()
  await chat.sendMessage(content, { modeId })
  modesStore.clearMode()
}

function onKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    submit()
  }
}

const hasContent = computed(() => !!input.value.trim() || attachments.value.length > 0)

watch(input, autoResize)
</script>

<template>
  <div class="chat-input-wrapper">
    <!-- Attached files -->
    <div v-if="attachments.length" class="attachment-row">
      <div v-for="att in attachments" :key="att.id" class="att-chip">
        <img v-if="att.preview" :src="att.preview" class="chip-thumb" :alt="att.name" />
        <span v-else class="chip-pdf-icon">📄</span>
        <span class="chip-name">{{ att.name }}</span>
        <button class="chip-remove" @click="removeAttachment(att.id)" title="Удалить">✕</button>
      </div>
    </div>

    <div class="input-row">
      <!-- + Attach button -->
      <div ref="attachWrapperRef" class="attach-wrapper">
        <button
          class="attach-btn"
          :disabled="chat.isGenerating"
          :title="t('attachFile')"
          @click.stop="showAttachMenu = !showAttachMenu"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
        <div v-if="showAttachMenu" class="attach-menu">
          <button class="attach-opt" @click="openImage">
            <span>🖼️</span><span>{{ t('formatImage') }}</span>
          </button>
          <button class="attach-opt" @click="openPdf">
            <span>📄</span><span>PDF</span>
          </button>
        </div>
      </div>

      <!-- Textarea -->
      <div class="textarea-box" :class="{ focused: true }">
        <textarea
          ref="textareaRef"
          v-model="input"
          :placeholder="t('messagePlaceholder')"
          rows="1"
          :disabled="chat.isGenerating"
          @keydown="onKeydown"
          @input="autoResize"
        />
      </div>

      <!-- Send button -->
      <button
        class="send-btn"
        :disabled="!hasContent || chat.isGenerating"
        :title="t('check')"
        @click="submit"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
        </svg>
      </button>
    </div>

    <!-- Hidden file inputs -->
    <input ref="imageInputRef" type="file" accept="image/*" class="hidden-input" @change="onImageChange" />
    <input ref="pdfInputRef" type="file" accept=".pdf,application/pdf" class="hidden-input" @change="onPdfChange" />

    <p class="hint">{{ t('disclaimer') }}</p>
  </div>
</template>

<style scoped>
.chat-input-wrapper {
  padding: 12px 16px 10px;
  background: var(--bg-primary);
  border-top: 1px solid var(--border);
}

/* Attachments row */
.attachment-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  max-width: 768px;
  margin: 0 auto 10px;
}

.att-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 8px 5px 6px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 13px;
  max-width: 220px;
}

.chip-thumb {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  object-fit: cover;
  flex-shrink: 0;
}

.chip-pdf-icon { font-size: 18px; flex-shrink: 0; }

.chip-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--text-secondary);
  font-size: 12px;
}

.chip-remove {
  font-size: 11px;
  color: var(--text-muted);
  flex-shrink: 0;
  padding: 2px 4px;
  border-radius: 3px;
  transition: color 0.15s, background 0.15s;
}

.chip-remove:hover { color: var(--danger); background: rgba(239,68,68,0.1); }

/* Input row */
.input-row {
  max-width: 768px;
  margin: 0 auto;
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

/* Attach button */
.attach-wrapper { position: relative; flex-shrink: 0; }

.attach-btn {
  width: 38px;
  height: 38px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
  flex-shrink: 0;
}

.attach-btn:hover:not(:disabled) {
  background: var(--bg-hover);
  color: var(--text-primary);
  border-color: var(--accent);
}

.attach-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.attach-menu {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 0;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow);
  overflow: hidden;
  min-width: 150px;
  z-index: 100;
}

.attach-opt {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  font-size: 14px;
  color: var(--text-primary);
  transition: background 0.15s;
  text-align: left;
}

.attach-opt:hover { background: var(--bg-hover); }

/* Textarea */
.textarea-box {
  flex: 1;
  display: flex;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 10px 14px;
  transition: border-color 0.2s;
}

.textarea-box:focus-within { border-color: var(--accent); }

textarea {
  flex: 1;
  border: none;
  background: transparent;
  resize: none;
  line-height: 1.5;
  max-height: 240px;
  padding: 0;
  font-size: 15px;
}

textarea:focus { outline: none; }

/* Send button */
.send-btn {
  width: 38px;
  height: 38px;
  border-radius: var(--radius-sm);
  background: var(--accent);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.15s, opacity 0.15s;
}

.send-btn:hover:not(:disabled) { background: var(--accent-hover); }
.send-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.hidden-input { display: none; }

.hint {
  text-align: center;
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 8px;
  max-width: 768px;
  margin-left: auto;
  margin-right: auto;
}
</style>
