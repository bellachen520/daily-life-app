<template>
  <div class="work-page">
    <div class="page-header">
      <h2>💼 工作台</h2>
      <p class="subtitle">高效管理工作待办与客户</p>
    </div>

    <div class="scroll-area">
      <!-- 今日待办 -->
      <div class="section">
        <div class="section-header">
          <h3>📋 今日待办</h3>
          <span class="count-badge">{{ activeTodos.length }}</span>
        </div>

        <div class="todo-list" v-if="activeTodos.length > 0">
          <div
            class="todo-item"
            v-for="todo in activeTodos"
            :key="todo.id"
            :class="{ 'priority-high': todo.priority === 'high' }"
          >
            <div class="todo-main" @click="toggleTodo(todo.id!)">
              <van-icon
                :name="todo.completed ? 'checked' : 'circle'"
                :color="todo.completed ? '#07c160' : '#c8c9cc'"
                size="20"
              />
              <div class="todo-info">
                <div class="todo-title">{{ todo.title }}</div>
                <div class="todo-meta" v-if="todo.description">
                  {{ todo.description }}
                </div>
                <div class="todo-tags">
                  <van-tag
                    :type="todo.priority === 'high' ? 'danger' : todo.priority === 'medium' ? 'warning' : 'default'"
                    size="mini"
                  >
                    {{ todo.priority === 'high' ? '高' : todo.priority === 'medium' ? '中' : '低' }}
                  </van-tag>
                  <span class="todo-date" v-if="todo.dueDate">📅 {{ todo.dueDate }}</span>
                </div>
              </div>
            </div>
            <van-icon name="delete-o" class="delete-btn" @click="deleteTodo(todo.id!)" />
          </div>
        </div>

        <div class="empty-todos" v-else>
          <p>暂无待办事项</p>
        </div>

        <!-- 已完成待办 -->
        <div class="completed-section" v-if="completedTodos.length > 0">
          <div class="completed-header" @click="showCompleted = !showCompleted">
            <span>✅ 已完成 ({{ completedTodos.length }})</span>
            <van-icon :name="showCompleted ? 'arrow-up' : 'arrow-down'" />
          </div>
          <div class="todo-item completed" v-for="todo in completedTodos" :key="todo.id" v-show="showCompleted">
            <div class="todo-main" @click="toggleTodo(todo.id!)">
              <van-icon name="checked" color="#07c160" size="20" />
              <div class="todo-info">
                <div class="todo-title done">{{ todo.title }}</div>
                <div class="todo-meta" v-if="todo.description">{{ todo.description }}</div>
              </div>
            </div>
            <van-icon name="delete-o" class="delete-btn" @click="deleteTodo(todo.id!)" />
          </div>
        </div>
      </div>

      <!-- 快速操作 -->
      <div class="section">
        <h3>⚡ 快速操作</h3>
        <div class="quick-actions">
          <div class="action-btn" @click="$router.push('/work/todos')">
            <van-icon name="add-o" size="24" color="#1989fa" />
            <span>新增待办</span>
          </div>
          <div class="action-btn" @click="$router.push('/work/customers')">
            <van-icon name="friends-o" size="24" color="#07c160" />
            <span>客户管理</span>
          </div>
        </div>
      </div>

      <!-- 最近客户 -->
      <div class="section">
        <div class="section-header">
          <h3>👥 客户列表</h3>
          <span class="view-all" @click="$router.push('/work/customers')">全部</span>
        </div>
        <div class="customer-item" v-for="c in recentCustomers" :key="c.id" @click="$router.push(`/work/customers/${c.id}`)">
          <div class="customer-info">
            <div class="customer-name">{{ c.name }}</div>
            <div class="customer-model">{{ c.machineModel || '未填写机型' }}</div>
          </div>
          <van-tag :type="c.status === 'active' ? 'success' : c.status === 'inactive' ? 'warning' : 'default'" size="small">
            {{ c.status === 'active' ? '跟进中' : c.status === 'inactive' ? '暂停' : '已关闭' }}
          </van-tag>
        </div>
        <div class="empty-hint" v-if="recentCustomers.length === 0">
          <p>暂无客户</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useTodos, useCustomers } from '@/composables/useDB'
import { showToast } from 'vant'

const { getActive, getCompleted, toggleTodo: toggle, deleteTodo: delTodo } = useTodos()
const { getAll } = useCustomers()

const activeTodos = ref<any[]>([])
const completedTodos = ref<any[]>([])
const recentCustomers = ref<any[]>([])
const showCompleted = ref(false)

async function loadData() {
  activeTodos.value = await getActive()
  completedTodos.value = await getCompleted()
  const all = await getAll()
  recentCustomers.value = all.slice(0, 5)
}

async function toggleTodo(id: number) {
  await toggle(id)
  await loadData()
}

async function deleteTodo(id: number) {
  await delTodo(id)
  showToast('已删除')
  await loadData()
}

onMounted(loadData)
</script>

<style scoped>
.work-page {
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

.section {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-top: 12px;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.section h3, .section-header h3 {
  margin: 0 0 12px;
  font-size: 16px;
}
.section-header h3 {
  margin: 0;
}
.count-badge {
  background: #1989fa;
  color: #fff;
  border-radius: 10px;
  padding: 2px 8px;
  font-size: 12px;
}
.view-all {
  font-size: 13px;
  color: #1989fa;
  cursor: pointer;
}

.todo-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f5f5f5;
}
.todo-item:last-child { border-bottom: none; }
.todo-main {
  flex: 1;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  cursor: pointer;
}
.todo-info { flex: 1; }
.todo-title {
  font-size: 15px;
  font-weight: 500;
}
.todo-title.done {
  text-decoration: line-through;
  color: #999;
}
.todo-meta {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}
.todo-tags {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}
.todo-date { font-size: 12px; color: #999; }
.delete-btn {
  color: #ee0a24;
  cursor: pointer;
  padding: 4px;
}
.priority-high {
  border-left: 3px solid #ee0a24;
  padding-left: 8px;
}

.completed-section { margin-top: 12px; }
.completed-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  font-size: 13px;
  color: #999;
  cursor: pointer;
}
.completed { opacity: 0.7; }

.empty-todos {
  text-align: center;
  padding: 20px 0;
  color: #999;
  font-size: 14px;
}

.quick-actions {
  display: flex;
  gap: 12px;
}
.action-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 14px;
  background: #f7f8fa;
  border-radius: 10px;
  cursor: pointer;
  font-size: 13px;
  color: #333;
}

.customer-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
}
.customer-item:last-child { border-bottom: none; }
.customer-name { font-size: 15px; font-weight: 500; }
.customer-model { font-size: 12px; color: #999; margin-top: 2px; }

.empty-hint {
  text-align: center;
  padding: 16px 0;
  color: #999;
  font-size: 13px;
}
</style>
