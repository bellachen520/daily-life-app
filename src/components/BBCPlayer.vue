<template>
  <div class="bbc-player" @click="$emit('open')">
    <div class="player-content">
      <van-icon name="play-circle-o" size="28" color="#1989fa" />
      <span class="player-text">点击播放全文朗读</span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits<{
  open: []
}>()
</script>

<style scoped>
.bbc-player {
  background: #f7f8fa;
  border-radius: 12px;
  padding: 16px;
  margin: 12px 0;
  cursor: pointer;
  transition: background 0.2s;
}
.bbc-player:active {
  background: #ebedf0;
}
.player-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}
.player-text {
  font-size: 15px;
  color: #1989fa;
  font-weight: 500;
}
</style>
