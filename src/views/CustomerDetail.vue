<template>
  <div class="detail-page">
    <van-nav-bar title="客户详情" left-arrow @click-left="$router.back()" />

    <div class="content" v-if="customer">
      <!-- 基本信息 -->
      <div class="info-card">
        <div class="info-header">
          <h2>{{ customer.name }}</h2>
          <van-tag
            :type="customer.status === 'active' ? 'success' : customer.status === 'inactive' ? 'warning' : 'default'"
            size="medium"
          >
            {{ customer.status === 'active' ? '跟进中' : customer.status === 'inactive' ? '暂停' : '已关闭' }}
          </van-tag>
        </div>
        <div class="info-row" v-if="customer.machineModel">
          <span class="label">机型</span>
          <span class="value">{{ customer.machineModel }}</span>
        </div>
        <div class="info-row" v-if="customer.priceQuote">
          <span class="label">报价</span>
          <span class="value price">¥{{ customer.priceQuote }}</span>
        </div>
        <div class="info-row" v-if="customer.notes">
          <span class="label">备注</span>
          <span class="value">{{ customer.notes }}</span>
        </div>
      </div>

      <!-- 状态切换 -->
      <div class="status-actions">
        <van-button
          v-for="s in statuses"
          :key="s.value"
          size="small"
          :type="customer.status === s.value ? 'primary' : 'default'"
          @click="updateStatus(s.value)"
          :loading="statusLoading"
        >
          {{ s.label }}
        </van-button>
      </div>

      <!-- 跟进记录 -->
      <div class="followup-section">
        <h3>📝 跟进记录</h3>
        <div class="followup-list">
          <div class="followup-item" v-for="f in followUps" :key="f.id">
            <div class="followup-date">{{ f.date }}</div>
            <div class="followup-content">{{ f.content }}</div>
            <div class="followup-next" v-if="f.nextStep">
              <span class="next-label">下一步：</span>{{ f.nextStep }}
            </div>
          </div>
          <van-empty v-if="followUps.length === 0" description="暂无跟进记录" />
        </div>
      </div>

      <!-- 新增跟进 -->
      <div class="add-followup">
        <h3>新增跟进</h3>
        <van-field v-model="newFollowUp.content" label="内容" placeholder="跟进内容" type="textarea" rows="2" />
        <van-field v-model="newFollowUp.nextStep" label="下一步" placeholder="下一步计划" />
        <van-button type="primary" block round @click="addFollowUp" :loading="saving" class="add-btn">
          添加跟进记录
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCustomers, useFollowUps } from '@/composables/useDB'
import { showToast } from 'vant'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()
const { updateCustomer } = useCustomers()
const { getByCustomer, addFollowUp: addFollowUpDB } = useFollowUps()

const customer = ref<any>(null)
const followUps = ref<any[]>([])
const statusLoading = ref(false)
const saving = ref(false)

const newFollowUp = ref({
  content: '',
  nextStep: '',
})

const statuses = [
  { value: 'active', label: '跟进中' },
  { value: 'inactive', label: '暂停' },
  { value: 'closed', label: '已关闭' },
]

async function loadData() {
  const id = Number(route.params.id)
  const { getAll, getByStatus } = useCustomers()
  const all = await getAll()
  customer.value = all.find(c => c.id === id)
  followUps.value = await getByCustomer(id)
}

async function updateStatus(status: 'active' | 'inactive' | 'closed') {
  statusLoading.value = true
  try {
    await updateCustomer(customer.value!.id!, { status })
    customer.value!.status = status
    showToast('状态已更新')
  } catch {
    showToast('更新失败')
  }
  statusLoading.value = false
}

async function addFollowUp() {
  if (!newFollowUp.value.content) {
    showToast('请输入跟进内容')
    return
  }
  saving.value = true
  try {
    await addFollowUpDB({
      customerId: customer.value!.id!,
      date: dayjs().format('YYYY-MM-DD'),
      content: newFollowUp.value.content,
      nextStep: newFollowUp.value.nextStep,
    })
    showToast('添加成功')
    newFollowUp.value = { content: '', nextStep: '' }
    await loadData()
  } catch {
    showToast('添加失败')
  }
  saving.value = false
}

onMounted(loadData)
</script>

<style scoped>
.detail-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}
.content {
  flex: 1;
  overflow-y: auto;
  padding: 0 16px 16px;
}
.info-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-top: 12px;
}
.info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.info-header h2 {
  margin: 0;
  font-size: 20px;
}
.info-row {
  display: flex;
  align-items: center;
  padding: 6px 0;
}
.label {
  width: 50px;
  font-size: 13px;
  color: #999;
}
.value { font-size: 14px; }
.price { color: #ee0a24; font-weight: 600; }
.status-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}
.followup-section {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-top: 12px;
}
.followup-section h3 {
  margin: 0 0 12px;
  font-size: 16px;
}
.followup-item {
  padding: 10px 0;
  border-bottom: 1px solid #f5f5f5;
}
.followup-item:last-child { border-bottom: none; }
.followup-date {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}
.followup-content { font-size: 14px; }
.followup-next {
  margin-top: 4px;
  font-size: 13px;
  color: #1989fa;
}
.next-label { color: #999; }
.add-followup {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-top: 12px;
}
.add-followup h3 {
  margin: 0 0 12px;
  font-size: 16px;
}
.add-btn { margin-top: 12px; }
</style>
