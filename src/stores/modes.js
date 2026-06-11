import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { TEACHER_MODES, getModeById } from '../config/teacherModes'

export const useModesStore = defineStore('modes', () => {
  const selectedModeId = ref(null)
  const formData = ref({})

  const modes = TEACHER_MODES
  const selectedMode = computed(() => getModeById(selectedModeId.value))

  function selectMode(modeId) {
    selectedModeId.value = modeId
    formData.value = {}
    const mode = getModeById(modeId)
    if (mode) {
      for (const field of mode.fields) {
        if (field.default !== undefined) formData.value[field.name] = field.default
      }
    }
  }

  function clearMode() {
    selectedModeId.value = null
    formData.value = {}
  }

  function updateField(name, value) {
    formData.value[name] = value
  }

  function validateForm() {
    const mode = selectedMode.value
    if (!mode) return { valid: false, error: 'Режим не выбран' }
    for (const field of mode.fields) {
      if (field.required && !String(formData.value[field.name] || '').trim()) {
        return { valid: false, error: `Заполните поле «${field.label}»` }
      }
    }
    return { valid: true }
  }

  function buildPrompt() {
    return selectedMode.value?.buildPrompt(formData.value) || ''
  }

  return {
    modes,
    selectedModeId,
    selectedMode,
    formData,
    selectMode,
    clearMode,
    updateField,
    validateForm,
    buildPrompt,
  }
})
