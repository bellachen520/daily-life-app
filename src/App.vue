<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const active = ref(0)

const tabs = [
  { path: '/life', icon: 'home-o', label: '生活' },
  { path: '/work', icon: 'notes-o', label: '工作' },
  { path: '/chenchen', icon: 'flower-o', label: '辰辰' },
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
        :icon="tab.icon"
      >
        {{ tab.label }}
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
</style>
