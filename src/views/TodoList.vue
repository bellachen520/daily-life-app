<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTodos } from '@/composables/useDB'
import { showToast } from 'vant'
import EmptyState from '@/components/EmptyState.vue'

const router = useRouter()
const { getAll, addTodo, toggleTodo, updateTodo, deleteTodo } = useTodos()

const todos = ref<any[]>([])
const showForm = ref(false)
const filter = ref<'all' | 'active' | 'completed'>('all')
const editingTodo = ref<any>(null)

const form = ref({
  title: '',
  description: '',
  priority: 'medium' as 'high' | 'medium' | 'low',
  dueDate: '',
})

const filteredTodos = computed(() => {
  if (filter.value === 'active') return todos.value.filter(t => !t.completed)
  if (filter.value === 'completed') return todos.value.filter(t => t.completed)
  return todos.value
})

async function load() {
  todos.value = await getAll()
}

function openAdd() {
  editingTodo.value = null
  form.value = { title: '', description: '', priority: 'medium', dueDate: '' }
  showForm.value = true
}

function openEdit(todo: any) {
  editingTodo.value = todo
  form.value = {
    title: todo.title,
    description: todo.description,
    priority: todo.priority,
    dueDate: todo.dueDate || '',
  }
  showForm.value = true
}

async function submit() {
  if (!form.value.title.trim()) {
    showToast('请输入待办标题')
    return
  }
  const data = {
    ...form.value,
    dueDate: form.value.dueDate || null,
  }
  if (editingTodo.value) {
    await updateTodo(editingTodo.value.id!, data)
    showToast('修改成功')
  } else {
    await addTodo(data)
    showToast('添加成功')
  }
  showForm.value = false
  load()
}

async function toggle(id: number) {
  await toggleTodo(id)
  load()
}

async function remove(id: number) {
  await deleteTodo(id)
  load()
}

function goBack() {
  router.back()
}

onMounted(load)
</script>

<template>
  <div>
    <van-nav-bar title="待办清单" left-arrow @click-left="goBack">
      <template #right>
        <van-icon name="plus" size="20" @click="openAdd" />
      </template>
    </van-nav-bar>
    <div class="page-container">
      <!-- 筛选 -->
      <div class="filter-bar">
        <span
          v-for="f in [{ k: 'all', v: '全部' }, { k: 'active', v: '待完成' }, { k: 'completed', v: '已完成' }]"
          :key="f.k"
          class="filter-item"
          :class="{ active: filter === f.k }"
          @click="filter = f.k as any"
        >{{ f.v }}</span>
      </div>

      <div v-if="filteredTodos.length === 0">
        <EmptyState text="暂无待办事项" description="点击右上角添加" />
      </div>
      <div v-else class="todo-list">
        <div
          v-for="todo in filteredTodos"
          :key="todo.id"
          class="todo-card"
          :class="{ completed: todo.completed }"
        >
          <van-checkbox
            :model-value="todo.completed"
            @change="toggle(todo.id!)"
            checked-color="#52C41A"
          />
          <div class="todo-content" @click="openEdit(todo)">
            <div class="todo-header">
              <span class="todo-title" :class="{ done: todo.completed }">{{ todo.title }}</span>
              <span class="todo-priority" :class="'p-' + todo.priority">
                {{ todo.priority === 'high' ? '高' : todo.priority === 'medium' ? '中' : '低' }}
              </span>
            </div>
            <p v-if="todo.description" class="todo-desc">{{ todo.description }}</p>
            <span v-if="todo.dueDate" class="todo-due">📅 {{ todo.dueDate }}</span>
          </div>
          <van-icon name="delete-o" color="#BFBFBF" size="16" @click="remove(todo.id!)" />
        </div>
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <van-popup v-model:show="showForm" position="bottom" round :style="{ padding: '20px', maxHeight: '85vh', overflow: 'auto', paddingBottom: '40px' }">
      <h3 style="margin-bottom: 16px; font-size: 18px;">{{ editingTodo ? '编辑待办' : '新增待办' }}</h3>
      <van-field v-model="form.title" label="标题" placeholder="待办事项" />
      <van-field v-model="form.description" label="描述" type="textarea" rows="2" placeholder="详细描述（可选）" />
      <van-field name="priority" label="优先级">
        <template #input>
          <van-radio-group v-model="form.priority" direction="horizontal">
            <van-radio name="high" checked-color="#FF4D4F">高</van-radio>
            <van-radio name="medium" checked-color="#FAAD14">中</van-radio>
            <van-radio name="low" checked-color="#52C41A">低</van-radio>
          </van-radio-group>
        </template>
      </van-field>
      <van-field v-model="form.dueDate" label="截止日期" placeholder="YYYY-MM-DD（可选）" />
      <div style="padding: 16px 0 8px;">
        <van-button type="primary" block round @click="submit">
          {{ editingTodo ? '保存修改' : '确认添加' }}
        </van-button>
      </div>
    </van-popup>
  </div>
</template>

<style scoped>
.filter-bar {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
}

.filter-item {
  padding: 6px 14px;
  border-radius: var(--radius-round);
  font-size: var(--font-size-sm);
  background: var(--color-card);
  color: var(--color-text-secondary);
  cursor: pointer;
}

.filter-item.active {
  background: var(--color-work);
  color: white;
}

.todo-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.todo-card {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  background: var(--color-card);
  border-radius: var(--radius-md);
  padding: var(--spacing-md) var(--spacing-lg);
}

.todo-card.completed {
  opacity: 0.6;
}

.todo-content {
  flex: 1;
  min-width: 0;
  cursor: pointer;
}

.todo-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: 4px;
}

.todo-title {
  font-size: var(--font-size-md);
  font-weight: 500;
}

.todo-title.done {
  text-decoration: line-through;
  color: var(--color-text-light);
}

.todo-priority {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: var(--radius-sm);
  font-weight: 600;
}

.todo-priority.p-high { background: #FFF2F0; color: #FF4D4F; }
.todo-priority.p-medium { background: #FFFBE6; color: #FAAD14; }
.todo-priority.p-low { background: #F6FFED; color: #52C41A; }

.todo-desc {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-top: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.todo-due {
  font-size: var(--font-size-xs);
  color: var(--color-text-light);
  margin-top: 4px;
  display: inline-block;
}
</style>
