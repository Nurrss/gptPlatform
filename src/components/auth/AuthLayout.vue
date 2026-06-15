<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
})
</script>

<template>
  <div class="auth-layout">
    <div class="auth-card">
      <div class="auth-logo">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#10a37f"/>
          <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="#10a37f" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <span>Tezcheck</span>
      </div>
      <h1>{{ title }}</h1>
      <p v-if="subtitle" class="subtitle">{{ subtitle }}</p>
      <slot />
    </div>
  </div>
</template>

<style scoped>
.auth-layout {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  padding: 24px;
}

.auth-card {
  width: 100%;
  max-width: 400px;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 40px 32px;
  box-shadow: var(--shadow);
}

.auth-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 32px;
  color: var(--text-primary);
}

h1 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 14px;
  margin-bottom: 24px;
}
</style>
