<template>
  <div class="customer-list-page">
    <van-nav-bar title="客户管理" left-arrow @click-left="$router.back()" />

    <div class="content">
      <!-- 搜索 -->
      <van-search v-model="searchText" placeholder="搜索客户名称或机型" @search="onSearch" />

      <!-- 筛选 -->
      <div class="filter-tabs">
        <span :class="{ active: filter === 'all' }" @click="filter = 'all'">全部</span>
        <span :class="{ active: filter === 'active' }" @click="filter = 'active'">跟进中</span>
        <span :class="{ active: filter === 'inactive' }" @click="filter = 'inactive'">暂停</span>
        <span :class="{ active: filter === 'closed' }" @click="filter = 'closed'">已关闭</span>
      </div>

      <!-- 列表 -->
      <van-pull-refresh v-model="refreshing" @refresh="loadCustomers">
        <div class="customer-list">
          <div
            class="customer-card"
            v-for="c in filteredCustomers"
            :key="c.id"
            @click="$router.push(`/work/customers/${c.id}`)"
          >
            <div class="card-header">
              <span class="name">{{ c.name }}</span>
              <van-tag
                :type="c.status === 'active' ? 'success' : c.status === 'inactive' ? 'warning' : 'default'"
                size="small"
              >
                {{ c.status === 'active' ? '跟进中' : c.status === 'inactive' ? '暂停' : '已关闭' }}
              </van-tag>
            </div>
            <div class="card-body">
              <span v-if="c.machineModel">📟 {{ c.machineModel }}</span>
              <span v-if="c.priceQuote">💰 ¥{{ c.priceQuote }}</span>
            </div>
            <div class="card-notes" v-if="c.notes">{{ c.notes }}</div>
          </div>
          <van-empty v-if="filteredCustomers.length === 0 && !refreshing" description="暂无客户" />
        </div>
      </van-pull-refresh>

      <!-- 新增按钮 -->
      <div class="fab" @click="showAdd = true">
        <van-icon name="plus" size="24" color="#fff" />
      </div>
    </div>

    <!-- 新增弹窗 -->
    <van-popup v-model:show="showAdd" position="bottom" round :style="{ padding: '20px' }">
      <h3>新增客户</h3>
      <van-field v-model="newCustomer.name" label="姓名" placeholder="客户姓名" required />
      <van-field v-model="newCustomer.machineModel" label="机型" placeholder="设备型号" />
      <van-field v-model.number="newCustomer.priceQuote" label="报价" type="number" placeholder="报价金额" />
      <van-field v-model="newCustomer.notes" label="备注" placeholder="备注信息" type="textarea" rows="2" />
      <van-button type="primary" block round @click="addCustomer" :loading="saving" style="margin-top: 16px;">
        确认添加
      </van-button>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCustomers } from '@/composables/useDB'
import { showToast } from 'vant'

const { getAll, search, addCustomer: add, deleteCustomer: del } = useCustomers()

const customers = ref<any[]>([])
const searchText = ref('')
const filter = ref('all')
const refreshing = ref(false)
const showAdd = ref(false)
const saving = ref(false)

const newCustomer = ref({
  name: '',
  machineModel: '',
  priceQuote: null as number | null,
  notes: '',
  status: 'active' as const,
})

const filteredCustomers = computed(() => {
  let list = customers.value
  if (filter.value !== 'all') {
    list = list.filter(c => c.status === filter.value)
  }
  if (searchText.value) {
    const q = searchText.value.toLowerCase()
    list = list.filter(c =>
      c.name.toLowerCase().includes(q) ||
      (c.machineModel && c.machineModel.toLowerCase().includes(q))
    )
  }
  return list
})

async function loadCustomers() {
  customers.value = await getAll()
  refreshing.value = false
}

function onSearch() {
  // 搜索通过 computed 自动过滤
}

async function addCustomer() {
  if (!newCustomer.value.name) {
    showToast('请输入客户姓名')
    return
  }
  saving.value = true
  try {
    await add({
      name: newCustomer.value.name,
      machineModel: newCustomer.value.machineModel || '',
      priceQuote: newCustomer.value.priceQuote || 0,
      notes: newCustomer.value.notes || '',
      status: 'active',
    })
    showToast('添加成功')
    showAdd.value = false
    newCustomer.value = { name: '', machineModel: '', priceQuote: null, notes: '', status: 'active' }
    await loadCustomers()
  } catch (e) {
    showToast('添加失败')
  }
  saving.value = false
}

onMounted(loadCustomers)
</script>

<style scoped>
.customer-list-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}
.content {
  flex: 1;
  overflow-y: auto;
  position: relative;
}
.filter-tabs {
  display: flex;
  gap: 8px;
  padding: 8px 16px;
  overflow-x: auto;
}
.filter-tabs span {
  padding: 4px 12px;
  border-radius: 14px;
  font-size: 13px;
  color: #666;
  background: #fff;
  cursor: pointer;
  white-space: nowrap;
}
.filter-tabs span.active {
  background: #1989fa;
  color: #fff;
}
.customer-list {
  padding: 0 16px 80px;
}
.customer-card {
  background: #fff;
  border-radius: 10px;
  padding: 14px;
  margin-bottom: 10px;
  cursor: pointer;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.name { font-size: 16px; font-weight: 600; }
.card-body {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #666;
}
.card-notes {
  margin-top: 6px;
  font-size: 12px;
  color: #999;
}
.fab {
  position: fixed;
  right: 20px;
  bottom: 70px;
  width: 48px;
  height: 48px;
  border-radius: 24px;
  background: #1989fa;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(25, 137, 250, 0.4);
  cursor: pointer;
  z-index: 10;
}
</style>
