<template>
  <div class="chenchen-page">
    <div class="page-header">
      <h2>🌸 辰辰成长</h2>
      <p class="subtitle">记录辰辰的学习与成长</p>
    </div>

    <div class="scroll-area">
      <!-- 英语学习 -->
      <div class="card" @click="onEnglishCheckin">
        <div class="card-header">
          <span class="card-icon">🔤</span>
          <span class="card-title">英语学习</span>
          <span class="streak" v-if="englishStreak > 0">🔥 {{ englishStreak }}天</span>
          <span class="checkin-tag" v-if="englishDone">✅ 已打卡</span>
          <span class="checkin-tag pending" v-else>点击打卡</span>
          <van-icon name="arrow" color="#999" />
        </div>
        <div class="card-body">
          每日英语学习打卡，培养语感
        </div>
      </div>

      <!-- 阅读 -->
      <div class="card" @click="onReadingCheckin">
        <div class="card-header">
          <span class="card-icon">📖</span>
          <span class="card-title">阅读</span>
          <span class="streak" v-if="readingStreak > 0">🔥 {{ readingStreak }}天</span>
          <span class="checkin-tag" v-if="readingDone">✅ 已打卡</span>
          <span class="checkin-tag pending" v-else>点击打卡</span>
          <van-icon name="arrow" color="#999" />
        </div>
        <div class="card-body">
          每日阅读打卡，培养阅读习惯
        </div>
      </div>

      <!-- 成长记录 -->
      <div class="card" @click="$router.push('/chenchen/growth')">
        <div class="card-header">
          <span class="card-icon">📏</span>
          <span class="card-title">成长记录</span>
          <van-icon name="arrow" color="#999" />
        </div>
        <div class="card-body growth-summary">
          <div class="growth-row" v-if="latestGrowth">
            <div class="growth-item">
              <span class="growth-label">身高</span>
              <span class="growth-value">{{ latestGrowth.height }} cm</span>
            </div>
            <div class="growth-item">
              <span class="growth-label">体重</span>
              <span class="growth-value">{{ latestGrowth.weight }} kg</span>
            </div>
            <div class="growth-item">
              <span class="growth-label">年龄</span>
              <span class="growth-value">{{ latestGrowth.age }}岁 {{ latestGrowth.gender === 'boy' ? '👦' : '👧' }}</span>
            </div>
          </div>
          <div class="growth-eval" v-if="growthSummary">
            <span class="eval-badge" :style="{ background: growthSummary.heightColor }">
              身高{{ growthSummary.heightLevel }}
            </span>
            <span class="eval-badge" :style="{ background: growthSummary.weightColor }">
              体重{{ growthSummary.weightLevel }}
            </span>
          </div>
          <div class="growth-empty" v-else>
            点击记录辰辰的身高体重
          </div>
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

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useChenchenCheckins, useGrowthRecords } from '@/composables/useDB'
import { evaluateGrowth, getAgeStandard } from '@/db/growthStandards'
import { getRandomQuote } from '@/db/quotes'
import dayjs from 'dayjs'

const router = useRouter()
const { getByDate, getStreak, addCheckin } = useChenchenCheckins()
const { getAll } = useGrowthRecords()

const today = dayjs().format('YYYY-MM-DD')

const englishStreak = ref(0)
const readingStreak = ref(0)
const growthRecords = ref<any[]>([])

// 正能量弹窗
const showQuote = ref(false)
const currentQuote = ref('')

// 今日打卡状态
const todayEnglish = ref<any[]>([])
const todayReading = ref<any[]>([])
const englishDone = computed(() => todayEnglish.value.length > 0)
const readingDone = computed(() => todayReading.value.length > 0)

function showRandomQuote() {
  currentQuote.value = getRandomQuote()
  showQuote.value = true
}

// 英语打卡
async function onEnglishCheckin() {
  if (englishDone.value) {
    router.push('/chenchen/english')
    return
  }
  try {
    await addCheckin({
      type: 'english',
      date: today,
      duration: 30,
      content: '每日英语学习打卡',
      notes: '快速打卡',
    })
    await loadCheckins()
    showRandomQuote()
  } catch (e: any) {
    // 今天已打卡
    if (e.message?.includes('已经打过卡')) {
      router.push('/chenchen/english')
    }
  }
}

// 阅读打卡
async function onReadingCheckin() {
  if (readingDone.value) {
    router.push('/chenchen/reading')
    return
  }
  try {
    await addCheckin({
      type: 'reading',
      date: today,
      duration: 20,
      content: '每日阅读打卡',
      notes: '快速打卡',
    })
    await loadCheckins()
    showRandomQuote()
  } catch (e: any) {
    if (e.message?.includes('已经打过卡')) {
      router.push('/chenchen/reading')
    }
  }
}

async function loadCheckins() {
  todayEnglish.value = await getByDate(today)
  const engRecords = todayEnglish.value.filter(r => r.type === 'english')
  const readRecords = todayEnglish.value.filter(r => r.type === 'reading')
  todayEnglish.value = engRecords
  todayReading.value = readRecords
  englishStreak.value = await getStreak('english')
  readingStreak.value = await getStreak('reading')
}

const latestGrowth = computed(() => {
  if (growthRecords.value.length === 0) return null
  return [...growthRecords.value].sort((a, b) => b.date.localeCompare(a.date))[0]
})

const growthSummary = computed(() => {
  if (!latestGrowth.value) return null
  const r = latestGrowth.value
  const hStd = getAgeStandard(r.age, r.gender, 'height')
  const wStd = getAgeStandard(r.age, r.gender, 'weight')
  if (!hStd || !wStd) return null

  const hLevel = evaluateGrowth(r.height, hStd)
  const wLevel = evaluateGrowth(r.weight, wStd)

  const colors: Record<string, string> = {
    '下等': '#ee0a24',
    '中下': '#ff976a',
    '中等': '#07c160',
    '中上': '#1989fa',
    '上等': '#7232dd',
  }

  return {
    heightLevel: hLevel,
    weightLevel: wLevel,
    heightColor: colors[hLevel],
    weightColor: colors[wLevel],
  }
})

onMounted(async () => {
  await loadCheckins()
  growthRecords.value = await getAll()
})
</script>

<style scoped>
.chenchen-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}
.page-header {
  padding: 16px 16px 8px;
  background: #fff;
}
.page-header h2 {
  margin: 0;
  font-size: 20px;
}
.subtitle {
  margin: 4px 0 0;
  font-size: 13px;
  color: #999;
}
.scroll-area {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 0 16px 80px;
}

.card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-top: 12px;
  cursor: pointer;
  transition: all 0.15s;
}
.card:active {
  transform: scale(0.97);
  opacity: 0.9;
}
.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
}
.card-icon { font-size: 20px; }
.card-title {
  flex: 1;
  font-size: 16px;
  font-weight: 600;
}
.streak {
  font-size: 13px;
  color: #ff976a;
  font-weight: 500;
}
.checkin-tag {
  font-size: 12px;
  padding: 2px 10px;
  border-radius: 10px;
  font-weight: 500;
}
.checkin-tag.pending {
  background: #ff8c69;
  color: #fff;
}
.card-body {
  margin-top: 8px;
  font-size: 13px;
  color: #999;
}

.growth-summary {
  color: #333 !important;
}
.growth-row {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
}
.growth-item {
  flex: 1;
  text-align: center;
}
.growth-label {
  display: block;
  font-size: 11px;
  color: #999;
}
.growth-value {
  font-size: 16px;
  font-weight: 600;
}
.growth-eval {
  display: flex;
  gap: 8px;
}
.eval-badge {
  padding: 2px 10px;
  border-radius: 10px;
  color: #fff;
  font-size: 12px;
}
.growth-empty {
  font-size: 13px;
  color: #ccc;
  text-align: center;
  padding: 8px 0;
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
