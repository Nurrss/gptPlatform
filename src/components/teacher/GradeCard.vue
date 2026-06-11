<script setup>
defineProps({
  score: { type: Object, required: true },
})
</script>

<template>
  <div class="grade-card">
    <span class="grade-label">Оценка</span>
    <span class="grade-value">{{ score.score }}<span class="max">/{{ score.maxScore }}</span></span>
    <div class="grade-bar">
      <div
        class="grade-fill"
        :style="{ width: `${Math.min(100, (score.score / score.maxScore) * 100)}%` }"
      />
    </div>
  </div>
</template>

<style scoped>
.grade-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: var(--accent-light);
  border: 1px solid var(--accent);
  border-radius: var(--radius);
  margin-bottom: 16px;
}

.grade-label {
  font-size: 14px;
  color: var(--text-secondary);
}

.grade-value {
  font-size: 32px;
  font-weight: 700;
  color: var(--accent);
}

.max {
  font-size: 18px;
  color: var(--text-secondary);
  font-weight: 500;
}

.grade-bar {
  flex: 1;
  height: 8px;
  background: var(--bg-tertiary);
  border-radius: 4px;
  overflow: hidden;
}

.grade-fill {
  height: 100%;
  background: var(--accent);
  border-radius: 4px;
  transition: width 0.5s ease;
}
</style>
