<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useChenchenCheckins, useGrowthRecords } from '@/composables/useDB'
import CheckinCard from '@/components/CheckinCard.vue'
import StreakBadge from '@/components/StreakBadge.vue'
import dayjs from 'dayjs'

const router = useRouter()
const { getByDate, getStreak } = useChenchenCheckins()
const { getAll: getGrowth } = useGrowthRecords()

const today = dayjs().format('YYYY-MM-DD')
const todayCheckins = ref<any[]>([])
const englishStreak = ref(0)
const readingStreak = ref(0)
const growthRecords = ref<any[]>([])

const englishDone = computed(() => todayCheckins.value.some(c => c.type === 'english'))
const readingDone = computed(() => todayCheckins.value.some(c => c.type === 'reading'))

const latestGrowth = computed(() => {
  if (growthRecords.value.length === 0) return null
  return growthRecords.value[growthRecords.value.length - 1]
})

async function load() {
  todayCheckins.value = await getByDate(today)
  englishStreak.value = await getStreak('english')
  readingStreak.value = await getStreak('reading')
  growthRecords.value = await getGrowth()
}

function goEnglish() { router.push('/chenchen/english') }
function goReading() { router.push('/chenchen/reading') }
function goGrowth() { router.push('/chenchen/growth') }

onMounted(load)
</script>

<template>
  <div class="page-container">
    <div class="page-header-section">
      <h1 class="page-title">🌱 辰辰学习</h1>
      <p class="page-subtitle">陪伴成长，记录每一刻</p>
    </div>

    <!-- 今日打卡 -->
    <div class="section">
      <h3 class="section-title">今日打卡</h3>
      <div class="checkin-grid">
        <CheckinCard
          :completed="englishDone"
          icon="music-o"
          label="英语学习"
          :streak="englishStreak"
          color="var(--color-chenchen)"
          @click="goEnglish"
        />
        <CheckinCard
          :completed="readingDone"
          icon="bookmark-o"
          label="阅读打卡"
          :streak="readingStreak"
          color="var(--color-chenchen)"
          @click="goReading"
        />
      </div>
    </div>

    <!-- 连续打卡 -->
    <div v-if="englishStreak > 0 || readingStreak > 0" class="streaks-row">
      <StreakBadge v-if="englishStreak > 0" :streak="englishStreak" label="英语" />
      <StreakBadge v-if="readingStreak > 0" :streak="readingStreak" label="阅读" />
    </div>

    <!-- 身高体重 -->
    <div class="section">
      <div class="section-header">
        <h3 class="section-title">成长记录</h3>
        <span class="section-action" @click="goGrowth">查看详情 →</span>
      </div>

      <div v-if="latestGrowth" class="growth-card">
        <div class="growth-item">
          <span class="growth-value">{{ latestGrowth.height }}<small>cm</small></span>
          <span class="growth-label">身高</span>
        </div>
        <div class="growth-divider"></div>
        <div class="growth-item">
          <span class="growth-value">{{ latestGrowth.weight }}<small>kg</small></span>
          <span class="growth-label">体重</span>
        </div>
        <div class="growth-date">
          <span>{{ latestGrowth.date }}</span>
        </div>
      </div>
      <div v-else class="growth-card empty" @click="goGrowth">
        <p>还没有记录身高体重</p>
        <span>点击去记录 →</span>
      </div>
    </div>

    <!-- 今日打卡状态提示 -->
    <div class="section">
      <div class="tip-card">
        <span class="tip-icon">💪</span>
        <span class="tip-text">
          {{ englishDone && readingDone ? '太棒了！今天的打卡全部完成了 🎉' : '还有打卡没完成哦，加油！' }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-header-section {
  margin-bottom: var(--spacing-xl);
}

.section {
  margin-bottom: var(--spacing-xl);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.section-title {
  font-size: var(--font-size-lg);
  font-weight: 700;
}

.section-action {
  font-size: var(--font-size-sm);
  color: var(--color-chenchen);
  cursor: pointer;
}

.checkin-grid {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.streaks-row {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xl);
}

.growth-card {
  display: flex;
  align-items: center;
  background: var(--color-card);
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
}

.growth-card.empty {
  flex-direction: column;
  gap: var(--spacing-sm);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  cursor: pointer;
}

.growth-card.empty span {
  color: var(--color-chenchen);
  font-size: var(--font-size-xs);
}

.growth-item {
  flex: 1;
  text-align: center;
}

.growth-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-chenchen);
  display: block;
}

.growth-value small {
  font-size: 14px;
  font-weight: 400;
  color: var(--color-text-secondary);
  margin-left: 2px;
}

.growth-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.growth-divider {
  width: 1px;
  height: 40px;
  background: var(--color-divider);
}

.growth-date {
  flex-shrink: 0;
  font-size: var(--font-size-xs);
  color: var(--color-text-light);
  writing-mode: vertical-rl;
}

.tip-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  background: var(--color-chenchen-bg);
  border-radius: var(--radius-md);
  padding: var(--spacing-md) var(--spacing-lg);
}

.tip-icon {
  font-size: 20px;
}

.tip-text {
  font-size: var(--font-size-sm);
  color: var(--color-text);
}
</style>
