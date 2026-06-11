import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as agentsApi from '../api/agents'
import { TEACHER_MODES } from '../config/teacherModes'

export const useAgentsStore = defineStore('agents', () => {
  const customAgents = ref([])
  const loading = ref(false)

  async function loadAgents() {
    loading.value = true
    try {
      customAgents.value = await agentsApi.getAgents()
    } finally {
      loading.value = false
    }
  }

  function getAgentForMode(modeId) {
    const mode = TEACHER_MODES.find((m) => m.id === modeId)
    if (!mode) return null
    return {
      id: mode.id,
      name: mode.name,
      description: mode.description,
      avatar: mode.icon,
      endpoint: mode.endpoint,
      type: 'teacher-mode',
    }
  }

  return { customAgents, loading, loadAgents, getAgentForMode }
})
