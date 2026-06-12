import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { WIZARD_FLOWS } from '../config/wizardFlows.js'

export const useWizardStore = defineStore('wizard', () => {
  const active = ref(false)
  const modeId = ref(null)
  const currentLang = ref('ru')
  const stepIndex = ref(0)
  const collectedData = ref({})
  const collectedImages = ref([])
  const collectedPdfs = ref([])
  const messages = ref([])

  const flow = computed(() => active.value && modeId.value ? WIZARD_FLOWS[modeId.value] : null)
  const steps = computed(() => flow.value ? flow.value.steps(currentLang.value) : [])
  const currentStep = computed(() => steps.value[stepIndex.value] ?? null)
  const isComplete = computed(() => active.value && stepIndex.value >= steps.value.length)

  function startWizard(id, lang) {
    modeId.value = id
    currentLang.value = lang || 'ru'
    stepIndex.value = 0
    collectedData.value = {}
    collectedImages.value = []
    collectedPdfs.value = []
    messages.value = []
    active.value = true

    const initialSteps = WIZARD_FLOWS[id].steps(lang || 'ru')
    if (initialSteps[0]) {
      messages.value.push({ role: 'assistant', content: initialSteps[0].question, id: 'w-a-0' })
    }
  }

  function answerStep(text, images = [], pdfs = []) {
    const step = steps.value[stepIndex.value]
    if (!step) return

    collectedData.value[step.field] = text
    if (images.length) collectedImages.value = images
    if (pdfs.length) collectedPdfs.value = pdfs

    const userDisplayContent = text || (images.length ? `📷 ${images.map(i => i.name).join(', ')}` : pdfs.length ? `📄 ${pdfs.map(p => p.name).join(', ')}` : '—')

    messages.value.push({
      role: 'user',
      content: userDisplayContent,
      id: `w-u-${stepIndex.value}`,
      images,
      pdfs,
    })

    stepIndex.value++

    if (stepIndex.value < steps.value.length) {
      messages.value.push({
        role: 'assistant',
        content: steps.value[stepIndex.value].question,
        id: `w-a-${stepIndex.value}`,
      })
    }
  }

  function buildFinalPayload() {
    if (!flow.value) return { prompt: '', images: [], pdfs: [] }
    return {
      prompt: flow.value.buildFinalPrompt(collectedData.value, currentLang.value),
      images: collectedImages.value,
      pdfs: collectedPdfs.value,
    }
  }

  function reset() {
    active.value = false
    modeId.value = null
    stepIndex.value = 0
    collectedData.value = {}
    collectedImages.value = []
    collectedPdfs.value = []
    messages.value = []
  }

  return {
    active,
    modeId,
    messages,
    currentStep,
    isComplete,
    startWizard,
    answerStep,
    buildFinalPayload,
    reset,
  }
})
