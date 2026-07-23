<script setup lang="ts">
defineProps<{
  icon?: string
  text: string
  description?: string
}>()
</script>

<template>
  <div class="empty-state">
    <van-icon v-if="icon" :name="icon" size="48" color="#D9D9D9" />
    <div v-else class="empty-icon">📭</div>
    <p class="empty-text">{{ text }}</p>
    <p v-if="description" class="empty-desc">{{ description }}</p>
  </div>
</template>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.empty-text {
  font-size: var(--font-size-md);
  color: var(--color-text-secondary);
  text-align: center;
}

.empty-desc {
  font-size: var(--font-size-sm);
  color: var(--color-text-light);
  margin-top: 4px;
  text-align: center;
}
</style>
