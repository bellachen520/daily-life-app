<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCustomers } from '@/composables/useDB'
import EmptyState from '@/components/EmptyState.vue'

const router = useRouter()
const { getAll, getByStatus, search, addCustomer, updateCustomer } = useCustomers()

const customers = ref<any[]>([])
const searchText = ref('')
const statusFilter = ref<'all' | 'active' | 'inactive' | 'closed'>('all')
const showForm = ref(false)
const editingCustomer = ref<any>(null)

const form = ref({
  name: '',
  company: '',
  phone: '',
  email: '',
  tags: [] as string[],
  status: 'active' as 'active' | 'inactive' | 'closed',
  notes: '',
})

const tagInput = ref('')

const filteredCustomers = computed(() => {
  let result = customers.value
  if (statusFilter.value !== 'all') {
    result = result.filter(c => c.status === statusFilter.value)
  }
  if (searchText.value) {
    const q = searchText.value.toLowerCase()
    result = result.filter(c => c.name.toLowerCase().includes(q) || c.company.toLowerCase().includes(q))
  }
  return result
})

async function load() {
  if (statusFilter.value === 'all') {
    customers.value = await getAll()
  } else {
    customers.value = await getByStatus(statusFilter.value)
  }
}

function openAdd() {
  editingCustomer.value = null
  form.value = { name: '', company: '', phone: '', email: '', tags: [], status: 'active', notes: '' }
  showForm.value = true
}

function openEdit(customer: any) {
  editingCustomer.value = customer
  form.value = {
    name: customer.name,
    company: customer.company,
    phone: customer.phone,
    email: customer.email,
    tags: [...customer.tags],
    status: customer.status,
    notes: customer.notes,
  }
  showForm.value = true
}

function addTag() {
  if (tagInput.value.trim() && !form.value.tags.includes(tagInput.value.trim())) {
    form.value.tags.push(tagInput.value.trim())
    tagInput.value = ''
  }
}

function removeTag(tag: string) {
  form.value.tags = form.value.tags.filter(t => t !== tag)
}

async function submit() {
  if (!form.value.name.trim()) return
  if (editingCustomer.value) {
    await updateCustomer(editingCustomer.value.id!, form.value)
  } else {
    await addCustomer(form.value)
  }
  showForm.value = false
  load()
}

function goDetail(id: number) {
  router.push(`/work/customers/${id}`)
}

function goBack() {
  router.back()
}

onMounted(load)
</script>

<template>
  <div>
    <van-nav-bar title="客户管理" left-arrow @click-left="goBack">
      <template #right>
        <van-icon name="plus" size="20" @click="openAdd" />
      </template>
    </van-nav-bar>
    <div class="page-container">
      <!-- 搜索和筛选 -->
      <van-search v-model="searchText" placeholder="搜索客户名称或公司" shape="round" background="transparent" />

      <div class="filter-bar">
        <span
          v-for="f in [{ k: 'all', v: '全部' }, { k: 'active', v: '活跃' }, { k: 'inactive', v: '不活跃' }, { k: 'closed', v: '已结束' }]"
          :key="f.k"
          class="filter-item"
          :class="{ active: statusFilter === f.k }"
          @click="statusFilter = f.k as any; load()"
        >{{ f.v }}</span>
      </div>

      <div v-if="filteredCustomers.length === 0">
        <EmptyState text="暂无客户" description="点击右上角添加" />
      </div>
      <div v-else class="customer-list">
        <div
          v-for="customer in filteredCustomers"
          :key="customer.id"
          class="customer-card"
          @click="goDetail(customer.id!)"
        >
          <div class="customer-avatar" :style="{ background: customer.status === 'active' ? '#52C41A' : customer.status === 'inactive' ? '#FAAD14' : '#BFBFBF' }">
            {{ customer.name[0] }}
          </div>
          <div class="customer-info">
            <div class="customer-name-row">
              <span class="customer-name">{{ customer.name }}</span>
              <van-tag
                :type="customer.status === 'active' ? 'success' : customer.status === 'inactive' ? 'warning' : 'default'"
                size="mini"
              >
                {{ customer.status === 'active' ? '活跃' : customer.status === 'inactive' ? '不活跃' : '已结束' }}
              </van-tag>
            </div>
            <span class="customer-company">{{ customer.company }}</span>
            <div v-if="customer.tags.length" class="customer-tags">
              <span v-for="tag in customer.tags.slice(0, 3)" :key="tag" class="ctag">{{ tag }}</span>
            </div>
          </div>
          <van-icon name="arrow" color="#BFBFBF" />
        </div>
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <van-popup v-model:show="showForm" position="bottom" round :style="{ padding: '20px', maxHeight: '80vh', overflowY: 'auto' }">
      <h3 style="margin-bottom: 16px; font-size: 18px;">{{ editingCustomer ? '编辑客户' : '新增客户' }}</h3>
      <van-field v-model="form.name" label="姓名" placeholder="客户姓名" required />
      <van-field v-model="form.company" label="公司" placeholder="公司名称" />
      <van-field v-model="form.phone" label="电话" placeholder="联系电话" />
      <van-field v-model="form.email" label="邮箱" placeholder="电子邮箱" />

      <van-field name="status" label="状态">
        <template #input>
          <van-radio-group v-model="form.status" direction="horizontal">
            <van-radio name="active" checked-color="#52C41A">活跃</van-radio>
            <van-radio name="inactive" checked-color="#FAAD14">不活跃</van-radio>
            <van-radio name="closed" checked-color="#BFBFBF">已结束</van-radio>
          </van-radio-group>
        </template>
      </van-field>

      <van-field v-model="form.notes" label="备注" type="textarea" rows="2" placeholder="客户备注（可选）" />

      <div class="tags-section">
        <span class="tags-label">标签</span>
        <div class="tags-list">
          <span v-for="tag in form.tags" :key="tag" class="tag-chip">
            {{ tag }}
            <van-icon name="cross" size="10" @click="removeTag(tag)" />
          </span>
        </div>
        <div class="tag-input-row">
          <input v-model="tagInput" placeholder="输入标签后按回车" class="tag-input" @keyup.enter="addTag" />
        </div>
      </div>

      <van-button type="primary" block round style="margin-top: 16px;" @click="submit">
        {{ editingCustomer ? '保存修改' : '确认添加' }}
      </van-button>
    </van-popup>
  </div>
</template>

<style scoped>
.filter-bar {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
  flex-wrap: wrap;
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

.customer-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.customer-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  background: var(--color-card);
  border-radius: var(--radius-md);
  padding: var(--spacing-md) var(--spacing-lg);
  cursor: pointer;
}

.customer-card:active {
  background: var(--color-bg-secondary);
}

.customer-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-lg);
  font-weight: 600;
  flex-shrink: 0;
}

.customer-info {
  flex: 1;
  min-width: 0;
}

.customer-name-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: 2px;
}

.customer-name {
  font-size: var(--font-size-md);
  font-weight: 500;
}

.customer-company {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.customer-tags {
  display: flex;
  gap: 4px;
  margin-top: 4px;
}

.ctag {
  font-size: 10px;
  padding: 1px 6px;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
}

.tags-section {
  padding: var(--spacing-md);
}

.tags-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-sm);
  display: block;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: var(--spacing-sm);
}

.tag-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  background: var(--color-work-bg);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  color: var(--color-work);
}

.tag-input-row {
  margin-top: var(--spacing-sm);
}

.tag-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  outline: none;
}

.tag-input:focus {
  border-color: var(--color-work);
}
</style>
