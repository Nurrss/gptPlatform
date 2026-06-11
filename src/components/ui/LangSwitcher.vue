<script setup>
import { useI18n } from '../../i18n/index.js'

const { lang, setLang } = useI18n()

const langs = [
  { code: 'kz', label: 'ҚЗ' },
  { code: 'ru', label: 'РУ' },
  { code: 'en', label: 'EN' },
]
</script>

<template>
  <div class="lang-switcher">
    <button
      v-for="l in langs"
      :key="l.code"
      class="lang-btn"
      :class="{ active: lang === l.code }"
      @click="setLang(l.code)"
    >
      {{ l.label }}
    </button>
  </div>
</template>

<style scoped>
.lang-switcher {
  display: flex;
  gap: 2px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  padding: 3px;
}

.lang-btn {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  transition: background 0.15s, color 0.15s;
  letter-spacing: 0.03em;
}

.lang-btn:hover {
  color: var(--text-primary);
}

.lang-btn.active {
  background: var(--accent);
  color: white;
}
</style>
