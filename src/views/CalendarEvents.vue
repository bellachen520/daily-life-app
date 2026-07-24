<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useDailyEvents } from '@/composables/useDB'
import { showToast } from 'vant'
import EmptyState from '@/components/EmptyState.vue'
import dayjs from 'dayjs'

const router = useRouter()
const { getByDate, getByMonth, getEventDates, addEvent, updateEvent, deleteEvent } = useDailyEvents()

const calendarDate = ref(new Date())
const currentDate = ref(dayjs().format('YYYY-MM-DD'))

const eventDates = ref<string[]>([])
const selectedEvents = ref<any[]>([])
const showForm = ref(false)
const editingEvent = ref<any>(null)
const showDetail = ref(false)

const form = ref({
  date: currentDate.value,
  title: '',
  description: '',
  emoji: '📌',
  color: '#FF9A76',
})

const emojis = ['📌', '🎉', '🏃', '📖', '🍽️', '🎬', '💼', '🛒', '🏥', '✈️', '🎵', '💡', '❤️', '🌟', '📝']
const colors = ['#FF9A76', '#679B9B', '#84C87A', '#FF8C69', '#FAAD14', '#FF4D4F', '#597EF7', '#9254DE']

async function loadEvents() {
  const y = dayjs(currentDate.value).year()
  const m = dayjs(currentDate.value).month() + 1
  eventDates.value = await getEventDates(y, m)
  selectedEvents.value = await getByDate(currentDate.value)
}

function onCalendarSelect(date: Date) {
  currentDate.value = dayjs(date).format('YYYY-MM-DD')
  loadEvents()
}

function onCalendarConfirm(date: Date) {
  currentDate.value = dayjs(date).format('YYYY-MM-DD')
  calendarDate.value = date
  showDetail.value = true
  loadEvents()
}

function onMonthChange(date: Date) {
  calendarDate.value = date
  loadEvents()
}

function openAdd() {
  editingEvent.value = null
  form.value = {
    date: currentDate.value,
    title: '',
    description: '',
    emoji: '📌',
    color: '#FF9A76',
  }
  showForm.value = true
}

function openEdit(event: any) {
  editingEvent.value = event
  form.value = {
    date: event.date,
    title: event.title,
    description: event.description,
    emoji: event.emoji,
    color: event.color,
  }
  showForm.value = true
}

async function submit() {
  if (!form.value.title.trim()) {
    showToast('请输入标题')
    return
  }
  if (editingEvent.value) {
    await updateEvent(editingEvent.value.id!, form.value)
    showToast('已保存')
  } else {
    await addEvent(form.value)
    showToast('已添加')
  }
  showForm.value = false
  loadEvents()
}

async function remove(id: number) {
  await deleteEvent(id)
  loadEvents()
}

function goBack() {
  router.back()
}

onMounted(() => {
  currentDate.value = dayjs().format('YYYY-MM-DD')
  loadEvents()
})
</script>

<template>
  <div>
    <van-nav-bar title="日历事件" left-arrow @click-left="goBack" />
    <div class="page-container">
      <!-- 日历 -->
      <van-calendar
        v-model:show="showDetail"
        :model-value="calendarDate"
        :min-date="new Date(2024, 0, 1)"
        :max-date="new Date(2030, 11, 31)"
        :formatter="(date: Date) => {
          const d = dayjs(date).format('YYYY-MM-DD')
          if (eventDates.includes(d)) {
            return { type: 'dot', color: '#FF8C69' }
          }
          return { type: 'text' }
        }"
        @select="onCalendarSelect"
        @confirm="onCalendarConfirm"
        @month-show="({ date }: { date: Date }) => onMonthChange(date)"
        color="#FF8C69"
        style="height: 400px;"
      />

      <!-- 当日事件 -->
      <div class="section">
        <div class="section-header">
          <h3 class="section-title">{{ currentDate }} 的事件</h3>
          <van-button size="small" type="primary" round @click="openAdd">+ 新增</van-button>
        </div>

        <div v-if="selectedEvents.length === 0">
          <EmptyState text="这天没有记录" description="点击右上角添加事件" />
        </div>
        <div v-else class="event-list">
          <div
            v-for="event in selectedEvents"
            :key="event.id"
            class="event-card"
            :style="{ borderLeftColor: event.color }"
          >
            <div class="event-card-header" @click="openEdit(event)">
              <span class="event-emoji">{{ event.emoji }}</span>
              <span class="event-title">{{ event.title }}</span>
              <van-icon name="delete-o" color="#BFBFBF" size="14" @click.stop="remove(event.id!)" />
            </div>
            <p v-if="event.description" class="event-desc">{{ event.description }}</p>
          </div>
        </div>
      </div>

      <!-- 新增/编辑弹窗 -->
      <van-popup v-model:show="showForm" position="bottom" round :style="{ padding: '20px', maxHeight: '85vh', overflow: 'auto', paddingBottom: '40px' }">
        <h3 style="margin-bottom: 16px; font-size: 18px;">{{ editingEvent ? '编辑事件' : '新增事件' }}</h3>
        <van-field v-model="form.date" label="日期" placeholder="YYYY-MM-DD" />
        <van-field v-model="form.title" label="标题" placeholder="事件标题" />
        <van-field v-model="form.description" label="描述" type="textarea" rows="2" placeholder="事件描述（可选）" />

        <div class="picker-row">
          <span class="picker-label">表情</span>
          <div class="emoji-grid">
            <span
              v-for="e in emojis"
              :key="e"
              class="emoji-option"
              :class="{ active: form.emoji === e }"
              @click="form.emoji = e"
            >{{ e }}</span>
          </div>
        </div>

        <div class="picker-row">
          <span class="picker-label">颜色</span>
          <div class="color-grid">
            <span
              v-for="c in colors"
              :key="c"
              class="color-dot"
              :class="{ active: form.color === c }"
              :style="{ background: c }"
              @click="form.color = c"
            />
          </div>
        </div>

        <div style="padding: 12px 0 20px;">
          <van-button type="primary" block round size="large" @click="submit">
            {{ editingEvent ? '保存修改' : '确认添加' }}
          </van-button>
        </div>
      </van-popup>
    </div>
  </div>
</template>

<style scoped>
.section {
  margin-top: var(--spacing-lg);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-md);
}

.section-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
}

.event-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.event-card {
  background: var(--color-card);
  border-left: 4px solid #FF9A76;
  border-radius: var(--radius-sm);
  padding: var(--spacing-md) var(--spacing-lg);
}

.event-card-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.event-emoji {
  font-size: 18px;
}

.event-title {
  flex: 1;
  font-size: var(--font-size-md);
  font-weight: 500;
}

.event-desc {
  margin-top: var(--spacing-xs);
  margin-left: 28px;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.picker-row {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
}

.picker-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  padding-top: 2px;
  min-width: 40px;
}

.emoji-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.emoji-option {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  background: var(--color-bg-secondary);
  cursor: pointer;
  font-size: 18px;
}

.emoji-option.active {
  background: var(--color-primary-lighter);
  outline: 2px solid var(--color-primary);
}

.color-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.color-dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
}

.color-dot.active {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
}
</style>
