<script setup lang="ts">
defineProps<{
  streak: number
  label?: string
}>()
</script>

<template>
  <div class="streak-badge" v-if="streak > 0">
    <van-icon name="fire-o" size="16" />
    <span>{{ label || '连续打卡' }} <strong>{{ streak }}</strong> 天</span>
  </div>
</template>

<style scoped>
.streak-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: linear-gradient(135deg, #FFF1EB, #FFE8DD);
  border-radius: var(--radius-round);
  font-size: var(--font-size-xs);
  color: var(--color-primary-dark);
}
</style>
