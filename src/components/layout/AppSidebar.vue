<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useChatStore } from '../../stores/chat'
import { getModeById } from '../../config/teacherModes'
import { useI18n } from '../../i18n/index.js'
import LangSwitcher from '../ui/LangSwitcher.vue'

const auth = useAuthStore()
const chat = useChatStore()
const router = useRouter()
const { t } = useI18n()

async function newCheck() {
  chat.startNewCheck()
  router.push('/')
}

async function openChat(id) {
  await chat.selectChat(id)
  router.push(`/chat/${id}`)
}

async function removeChat(e, id) {
  e.stopPropagation()
  if (confirm(t('deleteConfirm'))) {
    await chat.deleteChatById(id)
    if (!chat.currentChatId) router.push('/')
  }
}

function getChatIcon(item) {
  return getModeById(item.modeId)?.icon || '📋'
}

async function logout() {
  await auth.logout()
  router.push('/login')
}
</script>

<template>
  <aside class="sidebar" :class="{ collapsed: !chat.sidebarOpen }">
    <div class="sidebar-top">
      <button class="new-chat-btn" @click="newCheck">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        {{ t('newCheck') }}
      </button>
      <router-link to="/settings" class="settings-link">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
        </svg>
        {{ t('aiAgents') }}
      </router-link>
    </div>

    <div class="chat-list">
      <p v-if="chat.chats.length === 0" class="empty">{{ t('noChecks') }}</p>
      <div
        v-for="item in chat.chats"
        :key="item.id"
        class="chat-item"
        :class="{ active: item.id === chat.currentChatId }"
        role="button"
        tabindex="0"
        @click="openChat(item.id)"
        @keydown.enter="openChat(item.id)"
      >
        <span class="chat-icon">{{ getChatIcon(item) }}</span>
        <span class="chat-title">{{ item.title }}</span>
        <button class="delete-btn" @click="removeChat($event, item.id)" :title="t('deleteConfirm')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
        </button>
      </div>
    </div>

    <div class="sidebar-bottom">
      <div class="user-info">
        <div class="avatar">{{ auth.user?.name?.[0]?.toUpperCase() || 'U' }}</div>
        <div class="user-details">
          <span class="user-name">{{ auth.user?.name }}</span>
          <span class="user-role">{{ t('teacher') }}</span>
        </div>
      </div>
      <button class="btn-icon logout-btn" @click="logout" :title="t('logout')">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
      </button>
    </div>

    <div class="sidebar-lang">
      <LangSwitcher />
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: var(--sidebar-width);
  min-width: var(--sidebar-width);
  background: var(--bg-secondary);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  height: 100%;
  transition: margin-left 0.3s, min-width 0.3s;
}

.sidebar.collapsed {
  margin-left: calc(-1 * var(--sidebar-width));
  min-width: 0;
}

.sidebar-top {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.new-chat-btn, .settings-link {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  transition: background 0.2s;
  font-size: 14px;
}

.new-chat-btn:hover, .settings-link:hover {
  background: var(--bg-hover);
}

.settings-link.router-link-active {
  background: var(--accent-light);
  border-color: var(--accent);
  color: var(--accent);
}

.chat-list {
  flex: 1;
  overflow-y: auto;
  padding: 4px 8px;
}

.empty {
  color: var(--text-muted);
  font-size: 13px;
  text-align: center;
  padding: 16px;
}

.chat-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  text-align: left;
  transition: background 0.2s;
  position: relative;
}

.chat-item:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.chat-item.active {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.chat-icon { font-size: 16px; flex-shrink: 0; }

.chat-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
}

.delete-btn {
  opacity: 0;
  padding: 4px;
  border-radius: 4px;
  color: var(--text-muted);
  flex-shrink: 0;
}

.chat-item:hover .delete-btn { opacity: 1; }

.delete-btn:hover {
  color: var(--danger);
  background: rgba(239, 68, 68, 0.1);
}

.sidebar-bottom {
  padding: 12px;
  border-top: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 8px;
}

.sidebar-lang {
  padding: 8px 12px 12px;
  display: flex;
  justify-content: center;
}

.user-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  color: white;
  flex-shrink: 0;
}

.user-details {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-role {
  font-size: 12px;
  color: var(--text-muted);
}

.logout-btn { flex-shrink: 0; }
</style>
