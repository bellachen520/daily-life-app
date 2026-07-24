<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useReadingCheckins, useDailyEvents, useEnglishProgress } from '@/composables/useDB'
import { bbcEpisodes } from '@/db/bbc'
import { getRandomQuote } from '@/db/quotes'
import BBCPlayer from '@/components/BBCPlayer.vue'
import CheckinCard from '@/components/CheckinCard.vue'
import StreakBadge from '@/components/StreakBadge.vue'
import { showToast } from 'vant'
import dayjs from 'dayjs'
import dayOfYear from 'dayjs/plugin/dayOfYear'
dayjs.extend(dayOfYear)

const router = useRouter()
const reading = useReadingCheckins()
const events = useDailyEvents()
const engProgress = useEnglishProgress()

const today = dayjs().format('YYYY-MM-DD')
const todayStr = dayjs().format('M月D日 dddd')

// 正能量弹窗
const showQuote = ref(false)
const currentQuote = ref('')

function showRandomQuote() {
  currentQuote.value = getRandomQuote()
  showQuote.value = true
}

// 阅读打卡状态
const todayReading = ref<any[]>([])
const readingStreak = ref(0)
async function loadReading() {
  todayReading.value = await reading.getByDate(today, 'personal')
  readingStreak.value = await reading.getStreak('personal')
}

// 英语打卡状态
const todayEnglish = ref<any>(null)
const todayArticle = computed(() => {
  const doy = dayjs().dayOfYear()
  return bbcEpisodes[doy % bbcEpisodes.length]
})
async function loadEnglish() {
  todayEnglish.value = await engProgress.getByDate(today)
}

// 今日事件
const todayEvents = ref<any[]>([])
async function loadEvents() {
  todayEvents.value = await events.getByDate(today)
}

// 今日是否已经阅读打卡
const readingDone = computed(() => todayReading.value.length > 0)
const englishDone = computed(() => !!todayEnglish.value?.completed)

onMounted(async () => {
  await Promise.all([loadReading(), loadEnglish(), loadEvents()])
})

// 阅读打卡：点击卡片直接打卡
async function onReadingCheckin() {
  if (readingDone.value) {
    // 已打卡，跳转到详情页
    router.push('/life/reading')
    return
  }
  // 直接打卡
  await reading.addCheckin({
    bookTitle: '每日阅读打卡',
    pagesRead: 10,
    duration: 30,
    notes: '快速打卡',
    checkinDate: today,
    category: 'personal',
  })
  await loadReading()
  showRandomQuote()
}

// 英语打卡：点击卡片直接打卡
async function onEnglishCheckin() {
  if (englishDone.value) {
    // 已打卡，跳转到英语列表
    router.push('/life/english')
    return
  }
  // 直接打卡
  await engProgress.markCompleted(todayArticle.value.id, 0)
  await loadEnglish()
  showRandomQuote()
}

function goReading() {
  router.push('/life/reading')
}

function goEnglish() {
  router.push('/life/english')
}

function goCalendar() {
  router.push('/life/calendar')
}
</script>

<template>
  <div class="page-container">
    <!-- 日期头部 -->
    <div class="home-header">
      <div class="date-display">
        <span class="date-day">{{ dayjs().format('D') }}</span>
        <div class="date-info">
          <span class="date-month">{{ dayjs().format('YYYY年M月') }}</span>
          <span class="date-week">{{ dayjs().format('dddd') }}</span>
        </div>
      </div>
      <div class="greeting">
        <p>☀️ 新的一天，加油！</p>
      </div>
    </div>

    <!-- 打卡概览 -->
    <div class="section">
      <h3 class="section-title">今日打卡</h3>
      <div class="checkin-grid">
        <CheckinCard
          :completed="readingDone"
          icon="bookmark-o"
          label="阅读打卡"
          :streak="readingStreak"
          color="var(--color-life)"
          @click="onReadingCheckin"
        />
        <CheckinCard
          :completed="englishDone"
          icon="music-o"
          label="英语跟练"
          :streak="0"
          color="var(--color-primary)"
          @click="onEnglishCheckin"
        />
      </div>
    </div>

    <!-- 阅读统计 -->
    <div v-if="readingStreak > 0" class="section">
      <div class="stats-card">
        <StreakBadge :streak="readingStreak" label="阅读" />
        <span class="stats-hint">坚持下去，养成好习惯！</span>
      </div>
    </div>

    <!-- 今日事件 -->
    <div class="section">
      <div class="section-header">
        <h3 class="section-title">今日记录</h3>
        <span class="section-action" @click="goCalendar">查看日历 →</span>
      </div>

      <div v-if="todayEvents.length === 0" class="empty-today">
        <p>今天还没有记录事件</p>
        <van-button size="small" round type="primary" @click="goCalendar">记录今天</van-button>
      </div>
      <div v-else class="event-list">
        <div v-for="event in todayEvents" :key="event.id" class="event-item">
          <span class="event-emoji">{{ event.emoji || '📌' }}</span>
          <div class="event-info">
            <span class="event-title">{{ event.title }}</span>
            <span v-if="event.description" class="event-desc">{{ event.description }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 今日英语文章预览 -->
    <div class="section">
      <div class="section-header">
        <h3 class="section-title">今日英文</h3>
        <span class="section-action" @click="goEnglish">开始跟练 →</span>
      </div>
      <div class="article-preview" @click="goEnglish">
        <div class="preview-meta">
          <span class="preview-topic">{{ todayArticle.titleZh }}</span>
          <span class="preview-difficulty">{{ todayArticle.difficulty === 'easy' ? '简单' : todayArticle.difficulty === 'medium' ? '中等' : '较难' }}</span>
        </div>
        <h4 class="preview-title">{{ todayArticle.title }}</h4>
        <p class="preview-excerpt">{{ todayArticle.sentences[0]?.en || '' }}</p>
        <BBCPlayer @open="goEnglish" />
        <div v-if="englishDone" class="preview-done">
          <van-icon name="success" color="#52C41A" /> 今日已完成
        </div>
      </div>
    </div>

    <!-- 正能量弹窗 -->
    <van-popup
      v-model:show="showQuote"
      position="center"
      round
      closeable
      :style="{ width: '80%', padding: '32px 24px 24px', textAlign: 'center' }"
    >
      <div class="quote-popup">
        <div class="quote-icon">🎉</div>
        <div class="quote-title">打卡成功！</div>
        <div class="quote-content">{{ currentQuote }}</div>
        <van-button
          type="primary"
          round
          block
          style="margin-top: 20px;"
          @click="showQuote = false"
        >
          继续加油 💪
        </van-button>
      </div>
    </van-popup>
  </div>
</template>

<style scoped>
.home-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-xl);
}

.date-display {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.date-day {
  font-size: 42px;
  font-weight: 800;
  color: var(--color-primary);
  line-height: 1;
}

.date-info {
  display: flex;
  flex-direction: column;
}

.date-month {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--color-text);
}

.date-week {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.greeting {
  font-size: var(--font-size-md);
  color: var(--color-text-secondary);
  background: var(--color-bg-secondary);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-round);
}

.section {
  margin-bottom: var(--spacing-xl);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-md);
}

.section-title {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--color-text);
}

.section-action {
  font-size: var(--font-size-sm);
  color: var(--color-primary);
  cursor: pointer;
}

.checkin-grid {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.stats-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--color-card);
  border-radius: var(--radius-md);
  padding: var(--spacing-md) var(--spacing-lg);
}

.stats-hint {
  font-size: var(--font-size-xs);
  color: var(--color-text-light);
}

.empty-today {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.event-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.event-item {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  background: var(--color-card);
  border-radius: var(--radius-md);
  padding: var(--spacing-md) var(--spacing-lg);
}

.event-emoji {
  font-size: 20px;
  line-height: 1;
}

.event-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.event-title {
  font-size: var(--font-size-md);
  font-weight: 500;
}

.event-desc {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.article-preview {
  background: var(--color-card);
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
  cursor: pointer;
  transition: transform 0.15s;
}

.article-preview:active {
  transform: scale(0.98);
}

.preview-meta {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

.preview-topic {
  font-size: var(--font-size-xs);
  background: var(--color-bg-secondary);
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
}

.preview-difficulty {
  font-size: var(--font-size-xs);
  background: #FFF7E6;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  color: #FAAD14;
}

.preview-title {
  font-size: var(--font-size-md);
  font-weight: 600;
  margin-bottom: var(--spacing-xs);
}

.preview-excerpt {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.preview-done {
  margin-top: var(--spacing-sm);
  font-size: var(--font-size-xs);
  color: var(--color-success);
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 正能量弹窗 */
.quote-popup {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.quote-icon {
  font-size: 48px;
  line-height: 1;
  margin-bottom: 12px;
}
.quote-title {
  font-size: 18px;
  font-weight: 700;
  color: #333;
  margin-bottom: 12px;
}
.quote-content {
  font-size: 15px;
  color: #666;
  line-height: 1.7;
  padding: 0 8px;
}
</style>
