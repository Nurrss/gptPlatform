<script setup>
import { useModesStore } from '../../stores/modes'
import { useSettingsStore } from '../../stores/settings'
import { useI18n } from '../../i18n/index.js'

const modesStore = useModesStore()
const settingsStore = useSettingsStore()
const { t } = useI18n()

defineEmits(['select'])

function modeName(mode) {
  return t(`modes.${mode.id}.name`) || mode.name
}

function modeDesc(mode) {
  return t(`modes.${mode.id}.desc`) || mode.description
}
</script>

<template>
  <div class="mode-selector">
    <button
      v-for="mode in modesStore.modes"
      :key="mode.id"
      class="mode-card"
      :style="{ '--mode-color': mode.color }"
      @click="$emit('select', mode.id)"
    >
      <span class="mode-icon">{{ mode.icon }}</span>
      <div class="mode-info">
        <span class="mode-name">{{ modeName(mode) }}</span>
        <span class="mode-desc">{{ modeDesc(mode) }}</span>
      </div>
      <span
        class="status-dot"
        :class="{ configured: settingsStore.isConfigured(mode.id) }"
        :title="settingsStore.isConfigured(mode.id) ? t('aiConnected') : t('demoMode')"
      />
    </button>
  </div>
</template>

<style scoped>
.mode-selector {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  max-width: 900px;
  width: 100%;
}

.mode-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  padding: 20px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  text-align: left;
  transition: background 0.2s, border-color 0.2s, transform 0.15s;
  position: relative;
  background: var(--bg-secondary);
}

.mode-card:hover {
  background: var(--bg-hover);
  border-color: var(--mode-color);
  transform: translateY(-2px);
}

.mode-icon { font-size: 32px; }

.mode-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.mode-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.mode-desc {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.4;
}

.status-dot {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--text-muted);
}

.status-dot.configured { background: var(--accent); }

@media (max-width: 768px) {
  .mode-selector { grid-template-columns: 1fr; }
}
</style>
