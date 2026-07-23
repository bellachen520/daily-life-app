<script setup lang="ts">
defineProps<{
  completed: boolean
  icon: string
  label: string
  streak?: number
  color?: string
}>()
</script>

<template>
  <div class="checkin-card" :class="{ completed }" :style="{ borderColor: completed ? (color || 'var(--color-success)') : 'var(--color-border)' }">
    <div class="checkin-icon" :style="{ background: completed ? (color || 'var(--color-success)') : 'var(--color-bg-secondary)' }">
      <van-icon :name="completed ? 'success' : icon" :color="completed ? '#fff' : '#BFBFBF'" size="20" />
    </div>
    <div class="checkin-info">
      <span class="checkin-label">{{ label }}</span>
      <span v-if="streak !== undefined" class="checkin-streak">连续 {{ streak }} 天</span>
    </div>
    <div class="checkin-status">
      <span v-if="completed" class="status-done" :style="{ color: color || 'var(--color-success)' }">已完成</span>
      <span v-else class="status-pending">待打卡</span>
    </div>
  </div>
</template>

<style scoped>
.checkin-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--color-card);
  border-radius: var(--radius-md);
  border: 2px solid var(--color-border);
  transition: all 0.3s;
}

.checkin-card.completed {
  background: #F6FFED;
  border-color: var(--color-success);
}

.checkin-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.checkin-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.checkin-label {
  font-size: var(--font-size-md);
  font-weight: 500;
  color: var(--color-text);
}

.checkin-streak {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.checkin-status {
  flex-shrink: 0;
}

.status-done {
  font-size: var(--font-size-sm);
  font-weight: 600;
}

.status-pending {
  font-size: var(--font-size-sm);
  color: var(--color-text-light);
}
</style>
