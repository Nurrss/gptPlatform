<script setup>
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { computed } from 'vue'
import GradeCard from '../teacher/GradeCard.vue'
import { getModeById } from '../../config/teacherModes'
import { useI18n } from '../../i18n/index.js'

const props = defineProps({
  message: { type: Object, required: true },
})

const { t } = useI18n()

const htmlContent = computed(() => {
  if (props.message.role === 'user') return null
  return DOMPurify.sanitize(marked.parse(props.message.content || ''))
})

const mode = computed(() => getModeById(props.message.modeId))
</script>

<template>
  <div class="message" :class="message.role">
    <div class="avatar">
      <span v-if="message.role === 'user'">👨‍🏫</span>
      <span v-else>{{ mode?.icon || '🤖' }}</span>
    </div>
    <div class="content">
      <div v-if="message.role === 'user' && message.isCheckRequest" class="check-label">
        {{ t('checkLabel') }}
      </div>
      <p v-if="message.role === 'user'" class="user-text">{{ message.content }}</p>
      <template v-else>
        <GradeCard v-if="message.score" :score="message.score" />
        <div
          class="message-content"
          :class="{ error: message.isError }"
          v-html="htmlContent"
        />
      </template>
    </div>
  </div>
</template>

<style scoped>
.message {
  display: flex;
  gap: 16px;
  padding: 20px 0;
  max-width: 768px;
  margin: 0 auto;
  width: 100%;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.content {
  flex: 1;
  min-width: 0;
  padding-top: 4px;
}

.check-label {
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.user-text {
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.6;
  font-size: 14px;
  max-height: 200px;
  overflow: hidden;
  mask-image: linear-gradient(to bottom, black 70%, transparent);
}

.message-content {
  line-height: 1.7;
  word-break: break-word;
}

.message-content.error {
  color: var(--danger);
}
</style>
