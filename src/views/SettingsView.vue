<script setup>
import { ref } from 'vue'
import AppSidebar from '../components/layout/AppSidebar.vue'
import { useSettingsStore } from '../stores/settings'
import { TEACHER_MODES } from '../config/teacherModes'

const settings = useSettingsStore()
const saved = ref(false)

function saveAll() {
  settings.save()
  saved.value = true
  setTimeout(() => { saved.value = false }, 2000)
}
</script>

<template>
  <div class="page-layout">
    <AppSidebar />
    <main class="page-main">
      <div class="settings-page">
        <h1>Настройки AI-агентов</h1>
        <p class="subtitle">
          Подключите разные AI для каждого типа проверки. Пока поля пустые — работает демо-режим.
        </p>

        <div class="agents-list">
          <div v-for="mode in TEACHER_MODES" :key="mode.id" class="agent-card">
            <div class="agent-header">
              <span class="agent-icon">{{ mode.icon }}</span>
              <div>
                <h3>{{ mode.name }}</h3>
                <p>{{ mode.description }}</p>
              </div>
              <span class="badge" :class="{ active: settings.isConfigured(mode.id) }">
                {{ settings.isConfigured(mode.id) ? 'Подключён' : 'Демо' }}
              </span>
            </div>

            <div class="agent-fields">
              <div class="field">
                <label>URL API</label>
                <input
                  type="url"
                  :value="settings.getAgentConfig(mode.id).apiUrl"
                  placeholder="https://api.example.com/v1/check"
                  @input="settings.updateAgentConfig(mode.id, { apiUrl: $event.target.value })"
                />
              </div>
              <div class="field-row">
                <div class="field">
                  <label>API Key</label>
                  <input
                    type="password"
                    :value="settings.getAgentConfig(mode.id).apiKey"
                    placeholder="sk-..."
                    @input="settings.updateAgentConfig(mode.id, { apiKey: $event.target.value })"
                  />
                </div>
                <div class="field">
                  <label>Модель</label>
                  <input
                    type="text"
                    :value="settings.getAgentConfig(mode.id).model"
                    placeholder="gpt-4o, claude-3..."
                    @input="settings.updateAgentConfig(mode.id, { model: $event.target.value })"
                  />
                </div>
              </div>
              <p class="endpoint-hint">Эндпоинт бэкенда: <code>{{ mode.endpoint }}</code></p>
            </div>
          </div>
        </div>

        <div class="api-format">
          <h3>Формат запроса к вашему API</h3>
          <pre>POST /api/agents/essay/check
Authorization: Bearer {token}

{
  "messages": [{ "role": "user", "content": "..." }],
  "mode_id": "essay | math | test",
  "model": "gpt-4o",
  "stream": true
}

// Ответ (текст с оценкой):
"## Оценка: 8/10\n\n### Сильные стороны\n..."</pre>
        </div>

        <button class="btn btn-primary save-btn" @click="saveAll">
          {{ saved ? '✓ Сохранено' : 'Сохранить настройки' }}
        </button>
      </div>
    </main>
  </div>
</template>

<style scoped>
.page-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.page-main {
  flex: 1;
  overflow-y: auto;
  background: var(--bg-primary);
}

.settings-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 32px 24px;
}

h1 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 14px;
  margin-bottom: 32px;
}

.agents-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 32px;
}

.agent-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px;
}

.agent-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
}

.agent-icon {
  font-size: 28px;
}

.agent-header h3 {
  font-size: 16px;
  font-weight: 600;
}

.agent-header p {
  font-size: 13px;
  color: var(--text-secondary);
}

.badge {
  margin-left: auto;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  background: var(--bg-tertiary);
  color: var(--text-muted);
  white-space: nowrap;
}

.badge.active {
  background: var(--accent-light);
  color: var(--accent);
}

.agent-fields {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

label {
  font-size: 13px;
  color: var(--text-secondary);
}

input {
  padding: 10px 12px;
  width: 100%;
}

.endpoint-hint {
  font-size: 12px;
  color: var(--text-muted);
}

.endpoint-hint code {
  background: var(--bg-tertiary);
  padding: 2px 6px;
  border-radius: 4px;
}

.api-format {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px;
  margin-bottom: 24px;
}

.api-format h3 {
  font-size: 14px;
  margin-bottom: 12px;
}

.api-format pre {
  font-size: 12px;
  color: var(--text-secondary);
  overflow-x: auto;
  line-height: 1.6;
  white-space: pre-wrap;
}

.save-btn {
  width: 100%;
  padding: 14px;
}

@media (max-width: 600px) {
  .field-row {
    grid-template-columns: 1fr;
  }
}
</style>
