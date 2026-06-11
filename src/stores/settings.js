import { defineStore } from 'pinia'
import { ref } from 'vue'
import { TEACHER_MODES } from '../config/teacherModes'

const SETTINGS_KEY = 'teacher_agent_settings'

const defaultAgentConfig = () => ({
  enabled: true,
  provider: 'custom',
  apiUrl: '',
  apiKey: '',
  model: '',
})

function loadSettings() {
  try {
    const stored = JSON.parse(localStorage.getItem(SETTINGS_KEY))
    if (stored) return stored
  } catch {
    /* ignore */
  }
  return Object.fromEntries(TEACHER_MODES.map((m) => [m.id, defaultAgentConfig()]))
}

export const useSettingsStore = defineStore('settings', () => {
  const agentConfigs = ref(loadSettings())

  function save() {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(agentConfigs.value))
  }

  function getAgentConfig(modeId) {
    return agentConfigs.value[modeId] || defaultAgentConfig()
  }

  function updateAgentConfig(modeId, updates) {
    agentConfigs.value[modeId] = { ...getAgentConfig(modeId), ...updates }
    save()
  }

  function isConfigured(modeId) {
    const cfg = getAgentConfig(modeId)
    return !!(cfg.apiUrl && cfg.apiKey)
  }

  return { agentConfigs, getAgentConfig, updateAgentConfig, isConfigured, save }
})
