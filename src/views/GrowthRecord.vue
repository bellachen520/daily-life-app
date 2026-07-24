<template>
  <div class="growth-page">
    <div class="page-header">
      <h2>📊 成长记录</h2>
      <p class="subtitle">记录辰辰的身高体重，参照国家标准评估发育情况</p>
    </div>

    <div class="scroll-area">
      <!-- 最新数据卡片 -->
      <div class="latest-card" v-if="latestRecord">
        <div class="latest-title">最新记录 · {{ latestRecord.date }}</div>
        <div class="latest-data">
          <div class="data-item">
            <span class="data-label">身高</span>
            <span class="data-value">{{ latestRecord.height }} <small>cm</small></span>
          </div>
          <div class="data-item">
            <span class="data-label">体重</span>
            <span class="data-value">{{ latestRecord.weight }} <small>kg</small></span>
          </div>
          <div class="data-item">
            <span class="data-label">年龄</span>
            <span class="data-value">{{ latestRecord.age }} <small>岁</small></span>
          </div>
        </div>

        <!-- 生长评价 -->
        <div class="evaluation" v-if="heightEval && weightEval">
          <div class="eval-item">
            <span class="eval-emoji">{{ heightEval.emoji }}</span>
            <span class="eval-label">身高 {{ heightEval.label }}</span>
            <span class="eval-desc">{{ heightEval.desc }}</span>
          </div>
          <div class="eval-item">
            <span class="eval-emoji">{{ weightEval.emoji }}</span>
            <span class="eval-label">体重 {{ weightEval.label }}</span>
            <span class="eval-desc">{{ weightEval.desc }}</span>
          </div>
        </div>

        <!-- 建议 -->
        <div class="advice-box" v-if="advice">
          <div class="advice-title">💡 成长建议</div>
          <div class="advice-text">{{ advice }}</div>
        </div>
      </div>

      <!-- 新增记录 -->
      <div class="form-card">
        <h3>新增记录</h3>
        <van-field v-model="form.date" label="日期" type="month" placeholder="选择月份" />
        <van-field v-model.number="form.age" label="年龄(岁)" type="number" placeholder="请输入年龄" />
        <van-radio-group v-model="form.gender" direction="horizontal" class="gender-group">
          <van-radio name="boy">👦 男孩</van-radio>
          <van-radio name="girl">👧 女孩</van-radio>
        </van-radio-group>
        <van-field v-model.number="form.height" label="身高(cm)" type="number" placeholder="请输入身高" />
        <van-field v-model.number="form.weight" label="体重(kg)" type="number" placeholder="请输入体重" />
        <van-field v-model="form.notes" label="备注" placeholder="可选" />
        <van-button type="primary" block round @click="saveRecord" :loading="saving" class="save-btn">
          保存记录
        </van-button>
      </div>

      <!-- 历史记录列表 -->
      <div class="history-section" v-if="records.length > 0">
        <h3>📋 历史记录</h3>
        <div class="record-item" v-for="r in records" :key="r.id">
          <div class="record-header">
            <span class="record-date">{{ r.date }}</span>
            <span class="record-age">{{ r.age }}岁 {{ r.gender === 'boy' ? '👦' : '👧' }}</span>
            <van-icon name="delete-o" @click="deleteRecord(r.id!)" class="delete-icon" />
          </div>
          <div class="record-body">
            <span>身高: <b>{{ r.height }}cm</b></span>
            <span>体重: <b>{{ r.weight }}kg</b></span>
          </div>
          <div class="record-notes" v-if="r.notes">{{ r.notes }}</div>
        </div>
      </div>

      <div class="empty-hint" v-else>
        <p>暂无成长记录，开始记录吧！</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useGrowthRecords } from '@/composables/useDB'
import { evaluateGrowth, getAgeStandard, levelInfo, type GrowthLevel } from '@/db/growthStandards'
import { showToast, showConfirmDialog } from 'vant'
import dayjs from 'dayjs'

const { getAll, addOrUpdate, deleteRecord: delRecord } = useGrowthRecords()

const records = ref<any[]>([])
const saving = ref(false)

const form = ref({
  date: dayjs().format('YYYY-MM'),
  age: 5,
  gender: 'boy' as 'boy' | 'girl',
  height: null as number | null,
  weight: null as number | null,
  notes: '',
})

const latestRecord = computed(() => {
  if (records.value.length === 0) return null
  return [...records.value].sort((a, b) => b.date.localeCompare(a.date))[0]
})

const heightEval = computed(() => {
  if (!latestRecord.value) return null
  const std = getAgeStandard(latestRecord.value.age, latestRecord.value.gender, 'height')
  if (!std) return null
  const level = evaluateGrowth(latestRecord.value.height, std)
  return levelInfo(level)
})

const weightEval = computed(() => {
  if (!latestRecord.value) return null
  const std = getAgeStandard(latestRecord.value.age, latestRecord.value.gender, 'weight')
  if (!std) return null
  const level = evaluateGrowth(latestRecord.value.weight, std)
  return levelInfo(level)
})

const advice = computed(() => {
  if (!heightEval.value || !weightEval.value) return ''
  const tips: string[] = []

  const hLevel = evaluateGrowth(
    latestRecord.value!.height,
    getAgeStandard(latestRecord.value!.age, latestRecord.value!.gender, 'height')!
  )
  const wLevel = evaluateGrowth(
    latestRecord.value!.weight,
    getAgeStandard(latestRecord.value!.age, latestRecord.value!.gender, 'weight')!
  )

  if (hLevel === '下等' || hLevel === '中下') {
    tips.push('身高偏低，建议保证每天充足的睡眠（至少10小时），多进行跳绳、篮球等跳跃运动。')
  }
  if (wLevel === '下等' || wLevel === '中下') {
    tips.push('体重偏轻，注意增加优质蛋白摄入（鸡蛋、牛奶、鱼肉），均衡饮食。')
  }
  if (wLevel === '上等') {
    tips.push('体重偏高，建议控制零食摄入，增加户外活动时间，每天至少运动1小时。')
  }
  if (tips.length === 0) {
    tips.push('生长发育良好！继续保持均衡饮食、充足睡眠和适量运动的好习惯。')
  }

  return tips.join('\n')
})

async function loadRecords() {
  records.value = await getAll()
}

async function saveRecord() {
  if (!form.value.height || !form.value.weight) {
    showToast('请填写身高和体重')
    return
  }
  saving.value = true
  try {
    await addOrUpdate({
      date: form.value.date,
      age: form.value.age,
      gender: form.value.gender,
      height: form.value.height,
      weight: form.value.weight,
      notes: form.value.notes,
    })
    showToast('保存成功')
    form.value.date = dayjs().format('YYYY-MM')
    form.value.height = null
    form.value.weight = null
    form.value.notes = ''
    await loadRecords()
  } catch (e) {
    showToast('保存失败')
  }
  saving.value = false
}

async function deleteRecord(id: number) {
  try {
    await showConfirmDialog({ title: '确认删除', message: '确定要删除这条记录吗？' })
    await delRecord(id)
    showToast('已删除')
    await loadRecords()
  } catch {}
}

onMounted(loadRecords)
</script>

<style scoped>
.growth-page {
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
  padding: 0 16px 16px;
}

.latest-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-top: 12px;
}
.latest-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
}
.latest-data {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
}
.data-item {
  flex: 1;
  text-align: center;
}
.data-label {
  display: block;
  font-size: 12px;
  color: #999;
}
.data-value {
  font-size: 22px;
  font-weight: 700;
  color: #333;
}
.data-value small {
  font-size: 13px;
  font-weight: 400;
  color: #999;
}

.evaluation {
  border-top: 1px solid #f0f0f0;
  padding-top: 12px;
}
.eval-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}
.eval-emoji { font-size: 18px; }
.eval-label {
  font-weight: 600;
  font-size: 14px;
  min-width: 64px;
}
.eval-desc {
  font-size: 12px;
  color: #666;
}

.advice-box {
  background: #f0f9ff;
  border-radius: 8px;
  padding: 12px;
  margin-top: 12px;
}
.advice-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 6px;
}
.advice-text {
  font-size: 13px;
  color: #555;
  line-height: 1.6;
  white-space: pre-line;
}

.form-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-top: 12px;
}
.form-card h3 {
  margin: 0 0 12px;
  font-size: 16px;
}
.gender-group {
  padding: 8px 16px;
}
.save-btn {
  margin-top: 12px;
}

.history-section {
  margin-top: 12px;
}
.history-section h3 {
  font-size: 16px;
  margin-bottom: 8px;
}
.record-item {
  background: #fff;
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 8px;
}
.record-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}
.record-date {
  font-weight: 600;
  font-size: 14px;
}
.record-age {
  font-size: 12px;
  color: #999;
}
.delete-icon {
  margin-left: auto;
  color: #ee0a24;
  cursor: pointer;
}
.record-body {
  display: flex;
  gap: 16px;
  font-size: 14px;
}
.record-notes {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.empty-hint {
  text-align: center;
  padding: 40px 0;
  color: #999;
  font-size: 14px;
}
</style>
