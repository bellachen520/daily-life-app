<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useChenchenCheckins } from '@/composables/useDB'
import StreakBadge from '@/components/StreakBadge.vue'
import EmptyState from '@/components/EmptyState.vue'
import dayjs from 'dayjs'

const router = useRouter()
const { getByMonth, getStreak, addCheckin, deleteCheckin } = useChenchenCheckins()

const today = dayjs().format('YYYY-MM-DD')
const currentMonth = ref(dayjs())
const records = ref<any[]>([])
const streak = ref(0)
const showForm = ref(false)

const form = ref({
  type: 'reading' as const,
  date: today,
  duration: 20,
  content: '',
  notes: '',
})

const monthlyStats = computed(() => {
  const days = new Set(records.value.map(r => r.date))
  const totalDays = currentMonth.value.daysInMonth()
  const currentDay = dayjs().date()
  return {
    checkinDays: days.size,
    progress: Math.round((days.size / Math.min(currentDay, totalDays)) * 100),
    totalMinutes: records.value.reduce((s, r) => s + r.duration, 0),
  }
})

async function load() {
  const y = currentMonth.value.year()
  const m = currentMonth.value.month() + 1
  records.value = (await getByMonth(y, m)).filter(r => r.type === 'reading')
  streak.value = await getStreak('reading')
}

function prevMonth() {
  currentMonth.value = currentMonth.value.subtract(1, 'month')
  load()
}

function nextMonth() {
  const next = currentMonth.value.add(1, 'month')
  if (next.isAfter(dayjs())) return
  currentMonth.value = next
  load()
}

async function submit() {
  if (!form.value.content.trim()) return
  try {
    await addCheckin({ ...form.value, type: 'reading' })
    showForm.value = false
    form.value = { type: 'reading', date: today, duration: 20, content: '', notes: '' }
    load()
  } catch (e: any) {
    alert(e.message || '打卡失败')
  }
}

async function remove(id: number) {
  await deleteCheckin(id)
  load()
}

function goBack() {
  router.back()
}

onMounted(load)
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
          <span class="stat-number">{{ monthlyStats.totalMinutes }}</span>
          <span class="stat-label">阅读分钟</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ monthlyStats.progress }}%</span>
          <span class="stat-label">完成率</span>
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

      <div v-if="records.length === 0">
        <EmptyState text="本月还没有阅读打卡" description="点击下方按钮开始打卡" />
      </div>
      <div v-else class="records-list">
        <div v-for="record in records" :key="record.id" class="record-card">
          <div class="record-header">
            <span class="record-date">{{ record.date }}</span>
            <van-icon name="delete-o" color="#BFBFBF" size="14" @click="remove(record.id!)" />
          </div>
          <div class="record-body">
            <p class="record-content">📖 {{ record.content }}</p>
            <div class="record-meta">
              <span>⏱ {{ record.duration }} 分钟</span>
            </div>
            <p v-if="record.notes" class="record-notes">{{ record.notes }}</p>
          </div>
        </div>
      </div>

      <!-- 浮动按钮 -->
      <van-button class="fab" icon="plus" type="primary" round size="large" @click="showForm = true" />
    </div>

    <!-- 打卡弹窗 -->
    <van-popup v-model:show="showForm" position="bottom" round :style="{ padding: '20px' }">
      <h3 style="margin-bottom: 16px; font-size: 18px;">阅读打卡</h3>
      <van-field v-model="form.date" label="日期" placeholder="YYYY-MM-DD" />
      <van-field v-model="form.content" label="阅读内容" type="textarea" rows="2" placeholder="今天读了什么书？" />
      <van-field v-model="form.duration" label="时长(分)" type="number" placeholder="阅读时长" />
      <van-field v-model="form.notes" label="备注" placeholder="备注（可选）" />
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
  border-left: 4px solid var(--color-chenchen);
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

.record-content {
  font-size: var(--font-size-md);
  color: var(--color-text);
  margin-bottom: var(--spacing-xs);
}

.record-meta {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-xs);
}

.record-notes {
  font-size: var(--font-size-sm);
  color: var(--color-text);
  background: var(--color-bg-secondary);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-sm);
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
