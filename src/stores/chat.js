import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as chatApi from '../api/chat'
import { sendToAgentStream } from '../api/agents'
import { extractScore } from '../config/teacherModes'
import { useAuthStore } from './auth'
import { useAgentsStore } from './agents'
import { useModesStore } from './modes'
import { useSettingsStore } from './settings'

export const useChatStore = defineStore('chat', () => {
  const chats = ref([])
  const currentChatId = ref(null)
  const isGenerating = ref(false)
  const loading = ref(false)
  const sidebarOpen = ref(true)

  const currentChat = computed(() => chats.value.find((c) => c.id === currentChatId.value))

  async function loadChats() {
    const auth = useAuthStore()
    if (!auth.user) return
    loading.value = true
    try {
      chats.value = await chatApi.getChats(auth.user.id)
    } finally {
      loading.value = false
    }
  }

  async function createNewChat({ modeId, title } = {}) {
    const auth = useAuthStore()
    const chat = await chatApi.createChat(auth.user.id, {
      agentId: modeId || 'essay',
      modeId: modeId || null,
      title: title || 'Новая проверка',
    })
    chats.value.unshift(chat)
    currentChatId.value = chat.id
    return chat
  }

  async function selectChat(chatId) {
    currentChatId.value = chatId
    const existing = chats.value.find((c) => c.id === chatId)
    if (existing && existing.messages === undefined) {
      const full = await chatApi.getChat(chatId)
      const idx = chats.value.findIndex((c) => c.id === chatId)
      chats.value[idx] = full
    }
  }

  async function deleteChatById(chatId) {
    await chatApi.deleteChat(chatId)
    chats.value = chats.value.filter((c) => c.id !== chatId)
    if (currentChatId.value === chatId) {
      currentChatId.value = chats.value[0]?.id || null
    }
  }

  async function sendCheckRequest() {
    const modesStore = useModesStore()
    const validation = modesStore.validateForm()
    if (!validation.valid) throw new Error(validation.error)

    const mode = modesStore.selectedMode
    const prompt = modesStore.buildPrompt()
    const title = `${mode.icon} ${mode.name}`

    await sendMessage(prompt, { modeId: mode.id, title, isCheckRequest: true })
  }

  async function sendMessage(content, options = {}) {
    const agentsStore = useAgentsStore()
    const modesStore = useModesStore()
    const settingsStore = useSettingsStore()

    if (!content.trim() || isGenerating.value) return

    const modeId = options.modeId || modesStore.selectedModeId || currentChat.value?.modeId
    let chat = currentChat.value

    if (!chat) {
      chat = await createNewChat({
        modeId,
        title: options.title || modesStore.selectedMode?.name || 'Проверка',
      })
    }

    const userMessage = {
      role: 'user',
      content: content.trim(),
      modeId,
      isCheckRequest: options.isCheckRequest || false,
    }
    await chatApi.addMessage(chat.id, userMessage)

    const chatIdx = chats.value.findIndex((c) => c.id === chat.id)
    if (!chats.value[chatIdx].messages) chats.value[chatIdx].messages = []
    chats.value[chatIdx].messages.push(userMessage)
    if (modeId) chats.value[chatIdx].modeId = modeId

    isGenerating.value = true
    const assistantMessage = { role: 'assistant', content: '', id: 'streaming' }
    chats.value[chatIdx].messages.push(assistantMessage)

    try {
      const agent = agentsStore.getAgentForMode(modeId)
      const agentConfig = settingsStore.getAgentConfig(modeId)
      const messages = chats.value[chatIdx].messages
        .filter((m) => m.id !== 'streaming')
        .map(({ role, content: c }) => ({ role, content: c }))

      const result = await sendToAgentStream(
        modeId,
        { messages, chatId: chat.id, agent, agentConfig, modeId },
        (chunk) => {
          const idx = chats.value[chatIdx].messages.findIndex((m) => m.id === 'streaming')
          if (idx !== -1) chats.value[chatIdx].messages[idx].content = chunk
        }
      )

      const score = extractScore(result.content)
      const finalMessage = {
        role: 'assistant',
        content: result.content,
        id: crypto.randomUUID(),
        modeId,
        score,
      }

      await chatApi.addMessage(chat.id, finalMessage)

      const idx = chats.value[chatIdx].messages.findIndex((m) => m.id === 'streaming')
      chats.value[chatIdx].messages[idx] = finalMessage

      if (options.title) chats.value[chatIdx].title = options.title
      else {
        const updated = await chatApi.getChat(chat.id)
        chats.value[chatIdx].title = updated.title
      }
    } catch (e) {
      const idx = chats.value[chatIdx].messages.findIndex((m) => m.id === 'streaming')
      if (idx !== -1) {
        chats.value[chatIdx].messages[idx] = {
          role: 'assistant',
          content: `Ошибка: ${e.message}`,
          id: crypto.randomUUID(),
          isError: true,
        }
      }
    } finally {
      isGenerating.value = false
    }
  }

  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value
  }

  function startNewCheck() {
    currentChatId.value = null
    useModesStore().clearMode()
  }

  return {
    chats,
    currentChatId,
    currentChat,
    isGenerating,
    loading,
    sidebarOpen,
    loadChats,
    createNewChat,
    selectChat,
    deleteChatById,
    sendMessage,
    sendCheckRequest,
    startNewCheck,
    toggleSidebar,
  }
})
