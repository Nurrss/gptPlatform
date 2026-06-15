<script setup>
import { onMounted, watch, ref, nextTick, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useChatStore } from '../stores/chat'
import { useModesStore } from '../stores/modes'
import { useWizardStore } from '../stores/wizard'
import { getModeById } from '../config/teacherModes'
import { useI18n } from '../i18n/index.js'
import AppSidebar from '../components/layout/AppSidebar.vue'
import ChatMessage from '../components/chat/ChatMessage.vue'
import ChatWelcome from '../components/chat/ChatWelcome.vue'
import ChatInput from '../components/chat/ChatInput.vue'

const route = useRoute()
const chat = useChatStore()
const modesStore = useModesStore()
const wizard = useWizardStore()
const { t, lang } = useI18n()
const messagesEnd = ref(null)

const currentMode = computed(() => {
  const modeId = wizard.active ? wizard.modeId : (chat.currentChat?.modeId || modesStore.selectedModeId)
  return getModeById(modeId)
})

const showWelcome = computed(() => !wizard.active && !chat.currentChat?.messages?.length)

// Prefer real chat messages once they exist, otherwise show wizard messages
const displayMessages = computed(() => {
  const chatMsgs = chat.currentChat?.messages
  if (chatMsgs?.length) return chatMsgs
  if (wizard.active) return wizard.messages
  return []
})

function onSelectMode({ modeId }) {
  wizard.startWizard(modeId, lang.value)
}

async function onWizardAnswer({ content, images, pdfs }) {
  wizard.answerStep(content, images, pdfs)

  if (wizard.isComplete) {
    const { prompt, images: finalImages, pdfs: finalPdfs } = wizard.buildFinalPayload()
    const mId = wizard.modeId
    wizard.reset()
    await chat.sendMessage(prompt, { modeId: mId, images: finalImages, pdfs: finalPdfs })
    modesStore.clearMode()
  }
}

// Reset wizard when navigating away or starting new check
watch(() => route.params.id, async (id) => {
  wizard.reset()
  if (id) await chat.selectChat(id)
  else if (route.name === 'chat') chat.currentChatId = null
})

onMounted(async () => {
  await chat.loadChats()
  if (route.params.id) await chat.selectChat(route.params.id)
})

watch(
  () => displayMessages.value?.length,
  async () => {
    await nextTick()
    messagesEnd.value?.scrollIntoView({ behavior: 'smooth' })
  }
)
</script>

<template>
  <div class="chat-layout">
    <AppSidebar />

    <main class="chat-main">
      <header class="chat-header">
        <button class="btn-icon" @click="chat.toggleSidebar()" :title="t('menu')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <div v-if="currentMode" class="mode-badge">
          <span>{{ currentMode.icon }}</span>
          <span>{{ t(`modes.${currentMode.id}.name`) || currentMode.name }}</span>
        </div>
        <span v-else class="header-title">Tezcheck</span>
      </header>

      <div class="messages-area">
        <ChatWelcome v-if="showWelcome" @select-mode="onSelectMode" />
        <div v-else class="messages-list">
          <ChatMessage
            v-for="msg in displayMessages"
            :key="msg.id || msg.createdAt"
            :message="msg"
          />
          <div v-if="chat.isGenerating" class="typing">
            <span class="dot" /><span class="dot" /><span class="dot" />
            {{ t('checking') }}
          </div>
          <div ref="messagesEnd" />
        </div>
      </div>

      <!-- Always visible chat input -->
      <ChatInput
        :wizard-step="wizard.currentStep"
        @wizard-answer="onWizardAnswer"
      />
    </main>
  </div>
</template>

<style scoped>
.chat-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: var(--bg-primary);
}

.chat-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  border-bottom: 1px solid var(--border);
  min-height: 52px;
  flex-shrink: 0;
}

.header-title { font-weight: 600; font-size: 15px; }

.mode-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: var(--bg-tertiary);
  border-radius: 20px;
  font-size: 14px;
}

.messages-area {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.messages-list {
  flex: 1;
  padding: 0 16px 24px;
}

.typing {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 0;
  color: var(--text-muted);
  font-size: 14px;
  max-width: 768px;
  margin: 0 auto;
  width: 100%;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
  animation: bounce 1.2s infinite;
}

.dot:nth-child(2) { animation-delay: 0.2s; }
.dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes bounce {
  0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
  40% { transform: translateY(-6px); opacity: 1; }
}
</style>
