<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useGrowthRecords } from '@/composables/useDB'
import GrowthChart from '@/components/GrowthChart.vue'
import EmptyState from '@/components/EmptyState.vue'
import dayjs from 'dayjs'

const router = useRouter()
const { getAll, addOrUpdate, deleteRecord } = useGrowthRecords()

const records = ref<any[]>([])
const showForm = ref(false)
const editingRecord = ref<any>(null)

const form = ref({
  date: dayjs().format('YYYY-MM'),
  height: 0,
  weight: 0,
  notes: '',
})

const chartData = computed(() =>
  records.value.map(r => ({
    date: r.date,
    height: r.height,
    weight: r.weight,
  }))
)

async function load() {
  records.value = await getAll()
}

function openAdd() {
  editingRecord.value = null
  form.value = {
    date: dayjs().format('YYYY-MM'),
    height: 0,
    weight: 0,
    notes: '',
  }
  showForm.value = true
}

function openEdit(record: any) {
  editingRecord.value = record
  form.value = {
    date: record.date,
    height: record.height,
    weight: record.weight,
    notes: record.notes,
  }
  showForm.value = true
}

async function submit() {
  if (form.value.height <= 0 || form.value.weight <= 0) return
  await addOrUpdate(form.value)
  showForm.value = false
  load()
}

async function remove(id: number) {
  await deleteRecord(id)
  load()
}

function goBack() {
  router.back()
}

onMounted(load)
</script>

<template>
  <div>
    <van-nav-bar title="身高体重记录" left-arrow @click-left="goBack">
      <template #right>
        <van-icon name="plus" size="20" @click="openAdd" />
      </template>
    </van-nav-bar>
    <div class="page-container">
      <!-- 趋势图 -->
      <div class="section">
        <h3 class="section-title">成长趋势</h3>
        <GrowthChart :records="chartData" />
      </div>

      <!-- 记录列表 -->
      <div class="section">
        <h3 class="section-title">历史记录</h3>
        <div v-if="records.length === 0">
          <EmptyState text="还没有记录" description="每月月底记录身高体重" />
        </div>
        <div v-else class="records-list">
          <div v-for="record in records" :key="record.id" class="record-card" @click="openEdit(record)">
            <div class="record-month">{{ record.date }}</div>
            <div class="record-values">
              <span class="rv">📏 {{ record.height }} cm</span>
              <span class="rv">⚖️ {{ record.weight }} kg</span>
            </div>
            <p v-if="record.notes" class="record-notes">{{ record.notes }}</p>
            <van-icon name="delete-o" color="#BFBFBF" size="14" @click.stop="remove(record.id!)" style="position: absolute; top: 12px; right: 12px;" />
          </div>
        </div>
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <van-popup v-model:show="showForm" position="bottom" round :style="{ padding: '20px' }">
      <h3 style="margin-bottom: 16px; font-size: 18px;">{{ editingRecord ? '编辑记录' : '新增记录' }}</h3>
      <van-field v-model="form.date" label="月份" placeholder="YYYY-MM" />
      <van-field v-model="form.height" label="身高(cm)" type="number" placeholder="请输入身高" />
      <van-field v-model="form.weight" label="体重(kg)" type="number" placeholder="请输入体重" />
      <van-field v-model="form.notes" label="备注" type="textarea" rows="2" placeholder="备注（可选）" />
      <van-button type="primary" block round style="margin-top: 16px;" @click="submit">
        {{ editingRecord ? '保存修改' : '确认记录' }}
      </van-button>
    </van-popup>
  </div>
</template>

<style scoped>
.section {
  margin-bottom: var(--spacing-xl);
}

.section-title {
  font-size: var(--font-size-lg);
  font-weight: 700;
  margin-bottom: var(--spacing-md);
}

.records-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.record-card {
  position: relative;
  background: var(--color-card);
  border-radius: var(--radius-md);
  padding: var(--spacing-md) var(--spacing-lg);
  cursor: pointer;
  border-left: 4px solid var(--color-chenchen);
}

.record-card:active {
  background: var(--color-bg-secondary);
}

.record-month {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-chenchen);
  margin-bottom: var(--spacing-sm);
}

.record-values {
  display: flex;
  gap: var(--spacing-xl);
  font-size: var(--font-size-md);
  color: var(--color-text);
}

.rv {
  font-weight: 500;
}

.record-notes {
  margin-top: var(--spacing-sm);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  padding-right: 24px;
}
</style>
