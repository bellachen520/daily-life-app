<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useReadingCheckins } from '@/composables/useDB'
import StreakBadge from '@/components/StreakBadge.vue'
import EmptyState from '@/components/EmptyState.vue'
import dayjs from 'dayjs'

const router = useRouter()
const { getByMonth, getStreak, addCheckin, deleteCheckin } = useReadingCheckins()
const category = 'personal' as const

const today = dayjs().format('YYYY-MM-DD')
const currentMonth = ref(dayjs())

const records = ref<any[]>([])
const streak = ref(0)
const showForm = ref(false)

const form = ref({
  bookTitle: '',
  pagesRead: 0,
  duration: 30,
  notes: '',
  checkinDate: today,
})

// 月度统计
const monthlyStats = computed(() => {
  const days = new Set(records.value.map(r => r.checkinDate))
  const totalDays = currentMonth.value.daysInMonth()
  const currentDay = dayjs().date()
  return {
    checkinDays: days.size,
    totalDays,
    progress: Math.round((days.size / Math.min(currentDay, totalDays)) * 100),
    totalPages: records.value.reduce((s, r) => s + r.pagesRead, 0),
    totalMinutes: records.value.reduce((s, r) => s + r.duration, 0),
  }
})

async function loadData() {
  const y = currentMonth.value.year()
  const m = currentMonth.value.month() + 1
  records.value = await getByMonth(y, m, category)
  streak.value = await getStreak(category)
}

function prevMonth() {
  currentMonth.value = currentMonth.value.subtract(1, 'month')
  loadData()
}

function nextMonth() {
  const next = currentMonth.value.add(1, 'month')
  if (next.isAfter(dayjs())) return
  currentMonth.value = next
  loadData()
}

async function submit() {
  if (!form.value.bookTitle.trim()) return
  await addCheckin({ ...form.value, category })
  showForm.value = false
  form.value = { bookTitle: '', pagesRead: 0, duration: 30, notes: '', checkinDate: today }
  loadData()
}

async function remove(id: number) {
  await deleteCheckin(id)
  loadData()
}

function goBack() {
  router.back()
}

onMounted(loadData)
</script>

<template>
  <div>
    <van-nav-bar title="阅读打卡" left-arrow @click-left="goBack" />
    <div class="page-container">
      <!-- 月度统计 -->
      <div class="stats-row">
        <div class="stat-item">
          <span class="stat-number">{{ monthlyStats.checkinDays }}</span>
          <span class="stat-label">打卡天数</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ monthlyStats.totalPages }}</span>
          <span class="stat-label">阅读页数</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ monthlyStats.totalMinutes }}</span>
          <span class="stat-label">阅读分钟</span>
        </div>
      </div>

      <div class="section">
        <StreakBadge :streak="streak" label="阅读" />
      </div>

      <!-- 月份切换 -->
      <div class="month-picker">
        <van-icon name="arrow-left" @click="prevMonth" />
        <span class="month-label">{{ currentMonth.format('YYYY年M月') }}</span>
        <van-icon
          name="arrow"
          :style="{ opacity: currentMonth.isSame(dayjs(), 'month') ? 0.3 : 1 }"
          @click="nextMonth"
        />
      </div>

      <!-- 打卡记录列表 -->
      <div v-if="records.length === 0" class="section">
        <EmptyState text="本月还没有阅读记录" description="开始记录你的阅读之旅吧" />
      </div>
      <div v-else class="records-list">
        <div v-for="record in records" :key="record.id" class="record-card">
          <div class="record-header">
            <span class="record-date">{{ record.checkinDate }}</span>
            <van-icon name="delete-o" color="#BFBFBF" size="16" @click="remove(record.id!)" />
          </div>
          <div class="record-body">
            <h4>📖 {{ record.bookTitle }}</h4>
            <div class="record-meta">
              <span>📄 {{ record.pagesRead }} 页</span>
              <span>⏱ {{ record.duration }} 分钟</span>
            </div>
            <p v-if="record.notes" class="record-notes">{{ record.notes }}</p>
          </div>
        </div>
      </div>

      <!-- 浮动添加按钮 -->
      <van-button
        class="fab"
        icon="plus"
        type="primary"
        round
        size="large"
        @click="showForm = true"
      />
    </div>

    <!-- 新增打卡弹窗 -->
    <van-popup v-model:show="showForm" position="bottom" round :style="{ padding: '20px' }">
      <h3 style="margin-bottom: 16px; font-size: 18px;">新增阅读打卡</h3>
      <van-field v-model="form.bookTitle" label="书名" placeholder="请输入书名" />
      <van-field v-model="form.checkinDate" label="日期" placeholder="YYYY-MM-DD" />
      <van-field v-model="form.pagesRead" label="页数" type="number" placeholder="阅读页数" />
      <van-field v-model="form.duration" label="时长(分)" type="number" placeholder="阅读时长" />
      <van-field v-model="form.notes" label="感想" type="textarea" rows="3" placeholder="记录你的阅读感想..." />
      <van-button type="primary" block round style="margin-top: 16px;" @click="submit">确认打卡</van-button>
    </van-popup>
  </div>
</template>

<style scoped>
.stats-row {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.stat-item {
  flex: 1;
  background: var(--color-card);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.section {
  margin-bottom: var(--spacing-md);
}

.month-picker {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

.month-label {
  font-size: var(--font-size-lg);
  font-weight: 600;
}

.records-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.record-card {
  background: var(--color-card);
  border-radius: var(--radius-md);
  padding: var(--spacing-md) var(--spacing-lg);
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.record-date {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.record-body h4 {
  font-size: var(--font-size-md);
  font-weight: 600;
  margin-bottom: var(--spacing-xs);
}

.record-meta {
  display: flex;
  gap: var(--spacing-lg);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-sm);
}

.record-notes {
  font-size: var(--font-size-sm);
  color: var(--color-text);
  background: var(--color-bg-secondary);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-sm);
  line-height: 1.6;
}

.fab {
  position: fixed;
  bottom: 80px;
  right: 20px;
  width: 56px;
  height: 56px;
  box-shadow: var(--shadow-lg);
}
</style>
