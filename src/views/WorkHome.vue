<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTodos, useCustomers } from '@/composables/useDB'

const router = useRouter()
const { getActive, getCompleted } = useTodos()
const { getAll: getCustomers } = useCustomers()

const activeTodos = ref<any[]>([])
const completedTodos = ref<any[]>([])
const customers = ref<any[]>([])

const todoStats = computed(() => ({
  active: activeTodos.value.length,
  completed: completedTodos.value.length,
  total: activeTodos.value.length + completedTodos.value.length,
}))

const customerStats = computed(() => ({
  total: customers.value.length,
  active: customers.value.filter(c => c.status === 'active').length,
  needFollowUp: customers.value.filter(c => {
    if (!c.lastFollowUpAt) return true
    return Date.now() - c.lastFollowUpAt > 7 * 24 * 60 * 60 * 1000
  }).length,
}))

async function loadData() {
  const [todos, done, custs] = await Promise.all([
    getActive(),
    getCompleted(),
    getCustomers(),
  ])
  activeTodos.value = todos.slice(0, 5)
  completedTodos.value = done
  customers.value = custs
}

function goTodos() {
  router.push('/work/todos')
}

function goCustomers() {
  router.push('/work/customers')
}

function goCustomer(id: number) {
  router.push(`/work/customers/${id}`)
}

onMounted(loadData)
</script>

<template>
  <div class="page-container">
    <div class="page-header-section">
      <h1 class="page-title">工作台</h1>
      <p class="page-subtitle">高效管理，有条不紊</p>
    </div>

    <!-- 待办概览 -->
    <div class="section">
      <div class="section-header">
        <h3 class="section-title">待办事项</h3>
        <span class="section-action" @click="goTodos">查看全部 →</span>
      </div>
      <div class="stats-mini">
        <div class="stat-mini pending">
          <span class="stat-mini-num">{{ todoStats.active }}</span>
          <span class="stat-mini-label">待完成</span>
        </div>
        <div class="stat-mini done">
          <span class="stat-mini-num">{{ todoStats.completed }}</span>
          <span class="stat-mini-label">已完成</span>
        </div>
      </div>
      <div v-if="activeTodos.length === 0" class="empty-hint">
        暂无待办，去添加一个吧
      </div>
      <div v-else class="todo-preview">
        <div v-for="todo in activeTodos" :key="todo.id" class="todo-item">
          <div class="todo-dot" :class="'priority-' + todo.priority"></div>
          <span class="todo-title">{{ todo.title }}</span>
          <span v-if="todo.dueDate" class="todo-due">{{ todo.dueDate }}</span>
        </div>
      </div>
    </div>

    <!-- 客户概览 -->
    <div class="section">
      <div class="section-header">
        <h3 class="section-title">客户管理</h3>
        <span class="section-action" @click="goCustomers">查看全部 →</span>
      </div>
      <div class="stats-mini">
        <div class="stat-mini total">
          <span class="stat-mini-num">{{ customerStats.total }}</span>
          <span class="stat-mini-label">总客户</span>
        </div>
        <div class="stat-mini active">
          <span class="stat-mini-num">{{ customerStats.active }}</span>
          <span class="stat-mini-label">活跃</span>
        </div>
        <div class="stat-mini follow">
          <span class="stat-mini-num">{{ customerStats.needFollowUp }}</span>
          <span class="stat-mini-label">待跟进</span>
        </div>
      </div>
      <div v-if="customers.length === 0" class="empty-hint">
        暂无客户，去添加吧
      </div>
      <div v-else class="customer-preview">
        <div
          v-for="customer in customers.slice(0, 3)"
          :key="customer.id"
          class="customer-item"
          @click="goCustomer(customer.id!)"
        >
          <div class="customer-avatar">{{ customer.name[0] }}</div>
          <div class="customer-info">
            <span class="customer-name">{{ customer.name }}</span>
            <span class="customer-company">{{ customer.company }}</span>
          </div>
          <van-tag
            :type="customer.status === 'active' ? 'success' : customer.status === 'inactive' ? 'warning' : 'default'"
            size="mini"
          >
            {{ customer.status === 'active' ? '活跃' : customer.status === 'inactive' ? '不活跃' : '已结束' }}
          </van-tag>
        </div>
      </div>
    </div>

    <!-- 快速操作 -->
    <div class="section">
      <h3 class="section-title">快速操作</h3>
      <div class="quick-actions">
        <div class="quick-action" @click="goTodos">
          <van-icon name="todo-list-o" size="24" color="#679B9B" />
          <span>新增待办</span>
        </div>
        <div class="quick-action" @click="goCustomers">
          <van-icon name="add-o" size="24" color="#679B9B" />
          <span>新增客户</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-header-section {
  margin-bottom: var(--spacing-xl);
}

.stats-mini {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.stat-mini {
  flex: 1;
  background: var(--color-card);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  text-align: center;
}

.stat-mini-num {
  display: block;
  font-size: var(--font-size-xxl);
  font-weight: 700;
}

.stat-mini-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.stat-mini.pending .stat-mini-num { color: #FAAD14; }
.stat-mini.done .stat-mini-num { color: #52C41A; }
.stat-mini.total .stat-mini-num { color: #679B9B; }
.stat-mini.active .stat-mini-num { color: #52C41A; }
.stat-mini.follow .stat-mini-num { color: #FF4D4F; }

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
  color: var(--color-work);
  cursor: pointer;
}

.empty-hint {
  text-align: center;
  padding: var(--spacing-lg);
  font-size: var(--font-size-sm);
  color: var(--color-text-light);
}

.todo-preview {
  background: var(--color-card);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.todo-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--color-divider);
}

.todo-item:last-child {
  border-bottom: none;
}

.todo-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.todo-dot.priority-high { background: #FF4D4F; }
.todo-dot.priority-medium { background: #FAAD14; }
.todo-dot.priority-low { background: #52C41A; }

.todo-title {
  flex: 1;
  font-size: var(--font-size-md);
}

.todo-due {
  font-size: var(--font-size-xs);
  color: var(--color-text-light);
}

.customer-preview {
  background: var(--color-card);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.customer-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--color-divider);
  cursor: pointer;
}

.customer-item:last-child {
  border-bottom: none;
}

.customer-item:active {
  background: var(--color-bg-secondary);
}

.customer-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--color-work);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: var(--font-size-md);
}

.customer-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.customer-name {
  font-size: var(--font-size-md);
  font-weight: 500;
}

.customer-company {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.quick-actions {
  display: flex;
  gap: var(--spacing-md);
}

.quick-action {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  background: var(--color-card);
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
  cursor: pointer;
  font-size: var(--font-size-sm);
  color: var(--color-text);
}

.quick-action:active {
  background: var(--color-bg-secondary);
}
</style>
