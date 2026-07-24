<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const active = ref(0)

const tabs = [
  { path: '/life', emoji: '🏠', label: '生活' },
  { path: '/work', emoji: '💼', label: '工作' },
  { path: '/chenchen', emoji: '🌸', label: '辰辰' },
]

watch(() => route.path, (path) => {
  const idx = tabs.findIndex(t => path.startsWith(t.path))
  if (idx >= 0) active.value = idx
}, { immediate: true })

function onTabChange(index: number) {
  router.push(tabs[index].path)
}
</script>

<template>
  <div id="app-shell">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
    <van-tabbar
      v-model="active"
      :fixed="true"
      :border="true"
      :safe-area-inset-bottom="true"
      active-color="#FF8C69"
      inactive-color="#8C8C8C"
      @change="onTabChange"
    >
      <van-tabbar-item
        v-for="(tab, index) in tabs"
        :key="index"
      >
        <span class="tab-emoji">{{ tab.emoji }}</span>
        <span class="tab-label">{{ tab.label }}</span>
      </van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<style scoped>
#app-shell {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--color-bg);
}
.tab-emoji {
  display: block;
  font-size: 22px;
  line-height: 1;
  margin-bottom: 2px;
}
.tab-label {
  font-size: 12px;
}
</style>
