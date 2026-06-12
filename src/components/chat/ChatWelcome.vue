<script setup>
import { useModesStore } from '../../stores/modes'
import { useI18n } from '../../i18n/index.js'
import { TEACHER_MODES } from '../../config/teacherModes.js'

const modesStore = useModesStore()
const { t } = useI18n()

const emit = defineEmits(['select-mode'])

function onSelectMode(mode) {
  modesStore.selectMode(mode.id)
  emit('select-mode', { modeId: mode.id })
}
</script>

<template>
  <div class="welcome">
    <div class="welcome-icon">🎓</div>
    <h2>{{ t('welcomeTitle') }}</h2>
    <p class="subtitle">{{ t('welcomeSubtitle') }}</p>

    <div class="mode-grid">
      <button
        v-for="mode in TEACHER_MODES"
        :key="mode.id"
        class="mode-card"
        :style="{ '--mode-color': mode.color }"
        @click="onSelectMode(mode)"
      >
        <span class="mode-icon">{{ mode.icon }}</span>
        <div class="mode-info">
          <span class="mode-name">{{ t(`modes.${mode.id}.name`) }}</span>
          <span class="mode-desc">{{ t(`modes.${mode.id}.desc`) }}</span>
        </div>
        <svg class="arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.welcome {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 40px 24px 24px;
  flex: 1;
  overflow-y: auto;
}

.welcome-icon { font-size: 48px; margin-bottom: 16px; }

h2 {
  font-size: 26px;
  font-weight: 600;
  margin-bottom: 8px;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 14px;
  margin-bottom: 32px;
  max-width: 440px;
}

.mode-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  max-width: 560px;
}

.mode-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  text-align: left;
  background: var(--bg-secondary);
  transition: background 0.15s, border-color 0.15s, transform 0.1s;
  cursor: pointer;
}

.mode-card:hover {
  background: var(--bg-hover);
  border-color: var(--mode-color);
  transform: translateX(3px);
}

.mode-icon { font-size: 26px; flex-shrink: 0; }

.mode-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  text-align: left;
}

.mode-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.mode-desc {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.4;
}

.arrow {
  color: var(--text-muted);
  flex-shrink: 0;
  transition: color 0.15s;
}

.mode-card:hover .arrow { color: var(--mode-color); }
</style>
