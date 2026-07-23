<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCustomers, useFollowUps } from '@/composables/useDB'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()
const { updateCustomer, deleteCustomer } = useCustomers()
const { getByCustomer, addFollowUp } = useFollowUps()

const customer = ref<any>(null)
const followUps = ref<any[]>([])
const showFollowForm = ref(false)
const followForm = ref({ date: dayjs().format('YYYY-MM-DD'), content: '', nextStep: '' })

async function load() {
  const id = Number(route.params.id)
  const allCustomers = await (await import('@/composables/useDB')).useCustomers().getAll()
  customer.value = allCustomers.find(c => c.id === id)
  if (!customer.value) {
    router.back()
    return
  }
  followUps.value = await getByCustomer(id)
}

async function changeStatus(status: 'active' | 'inactive' | 'closed') {
  await updateCustomer(customer.value.id!, { status })
  load()
}

async function submitFollowUp() {
  if (!followForm.value.content.trim()) return
  await addFollowUp({
    customerId: customer.value.id!,
    date: followForm.value.date,
    content: followForm.value.content,
    nextStep: followForm.value.nextStep,
  })
  followForm.value = { date: dayjs().format('YYYY-MM-DD'), content: '', nextStep: '' }
  showFollowForm.value = false
  load()
}

async function removeCustomer() {
  await deleteCustomer(customer.value.id!)
  router.back()
}

function goBack() {
  router.back()
}

onMounted(load)
</script>

<template>
  <div v-if="customer">
    <van-nav-bar title="客户详情" left-arrow @click-left="goBack">
      <template #right>
        <van-icon name="delete-o" size="18" color="#FF4D4F" @click="removeCustomer" />
      </template>
    </van-nav-bar>
    <div class="page-container">
      <!-- 客户基本信息 -->
      <div class="customer-header">
        <div class="customer-avatar">{{ customer.name[0] }}</div>
        <div class="customer-base">
          <h2>{{ customer.name }}</h2>
          <p>{{ customer.company }}</p>
        </div>
      </div>

      <!-- 联系方式和状态 -->
      <div class="info-card">
        <div class="info-row" v-if="customer.phone">
          <van-icon name="phone-o" color="#679B9B" />
          <span>{{ customer.phone }}</span>
        </div>
        <div class="info-row" v-if="customer.email">
          <van-icon name="envelope-o" color="#679B9B" />
          <span>{{ customer.email }}</span>
        </div>
        <div class="info-row">
          <van-icon name="flag-o" color="#679B9B" />
          <van-tag
            :type="customer.status === 'active' ? 'success' : customer.status === 'inactive' ? 'warning' : 'default'"
          >
            {{ customer.status === 'active' ? '活跃' : customer.status === 'inactive' ? '不活跃' : '已结束' }}
          </van-tag>
        </div>
        <div v-if="customer.tags.length" class="info-row">
          <span v-for="tag in customer.tags" :key="tag" class="ctag">{{ tag }}</span>
        </div>
        <div v-if="customer.notes" class="info-row notes">
          <van-icon name="notes-o" color="#679B9B" />
          <span>{{ customer.notes }}</span>
        </div>
      </div>

      <!-- 状态切换 -->
      <div class="status-actions">
        <van-button size="small" :type="customer.status === 'active' ? 'success' : 'default'" round @click="changeStatus('active')">活跃</van-button>
        <van-button size="small" :type="customer.status === 'inactive' ? 'warning' : 'default'" round @click="changeStatus('inactive')">不活跃</van-button>
        <van-button size="small" :type="customer.status === 'closed' ? 'default' : 'default'" round @click="changeStatus('closed')">已结束</van-button>
      </div>

      <!-- 跟进记录 -->
      <div class="section">
        <div class="section-header">
          <h3>跟进记录</h3>
          <van-button size="small" type="primary" round @click="showFollowForm = true">+ 添加跟进</van-button>
        </div>

        <div v-if="followUps.length === 0" class="empty-follow">
          暂无跟进记录
        </div>
        <div v-else class="timeline">
          <div v-for="fu in followUps" :key="fu.id" class="timeline-item">
            <div class="timeline-date">{{ fu.date }}</div>
            <div class="timeline-content">
              <p>{{ fu.content }}</p>
              <p v-if="fu.nextStep" class="next-step">📋 下一步：{{ fu.nextStep }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加跟进弹窗 -->
    <van-popup v-model:show="showFollowForm" position="bottom" round :style="{ padding: '20px' }">
      <h3 style="margin-bottom: 16px; font-size: 18px;">添加跟进记录</h3>
      <van-field v-model="followForm.date" label="日期" placeholder="YYYY-MM-DD" />
      <van-field v-model="followForm.content" label="内容" type="textarea" rows="3" placeholder="跟进内容" />
      <van-field v-model="followForm.nextStep" label="下一步" placeholder="下一步计划（可选）" />
      <van-button type="primary" block round style="margin-top: 16px;" @click="submitFollowUp">确认添加</van-button>
    </van-popup>
  </div>
</template>

<style scoped>
.customer-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.customer-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #679B9B, #84C8B8);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
}

.customer-base h2 {
  font-size: var(--font-size-xl);
  font-weight: 700;
}

.customer-base p {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.info-card {
  background: var(--color-card);
  border-radius: var(--radius-md);
  padding: var(--spacing-md) var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

.info-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) 0;
  font-size: var(--font-size-sm);
  border-bottom: 1px solid var(--color-divider);
}

.info-row:last-child {
  border-bottom: none;
}

.notes {
  flex-wrap: wrap;
}

.ctag {
  padding: 2px 8px;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  margin-right: 4px;
}

.status-actions {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xl);
}

.section {
  margin-bottom: var(--spacing-xl);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.section-header h3 {
  font-size: var(--font-size-lg);
  font-weight: 700;
}

.empty-follow {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--color-text-light);
  font-size: var(--font-size-sm);
}

.timeline {
  position: relative;
  padding-left: 24px;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 8px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--color-border);
}

.timeline-item {
  position: relative;
  padding-bottom: var(--spacing-lg);
}

.timeline-item::before {
  content: '';
  position: absolute;
  left: -20px;
  top: 4px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--color-work);
  border: 2px solid var(--color-card);
}

.timeline-date {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-xs);
}

.timeline-content {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-sm);
  padding: var(--spacing-md);
  font-size: var(--font-size-sm);
}

.next-step {
  margin-top: var(--spacing-xs);
  font-size: var(--font-size-xs);
  color: var(--color-work);
}
</style>
