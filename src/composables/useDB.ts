import { db } from '@/db'
import type { ReadingCheckin, DailyEvent, EnglishProgress, Todo, Customer, CustomerFollowUp, ChenchenCheckin, GrowthRecord } from '@/db'
import dayjs from 'dayjs'

// ===== 阅读打卡 =====
export function useReadingCheckins() {
  async function getByDate(date: string, category: 'personal' | 'chenchen') {
    return db.readingCheckins.where({ category, checkinDate: date }).toArray()
  }

  async function getByMonth(year: number, month: number, category: 'personal' | 'chenchen') {
    const start = dayjs(`${year}-${String(month).padStart(2, '0')}-01`).format('YYYY-MM-DD')
    const end = dayjs(start).endOf('month').format('YYYY-MM-DD')
    return db.readingCheckins
      .where('category').equals(category)
      .filter(r => r.checkinDate >= start && r.checkinDate <= end)
      .toArray()
  }

  async function getStreak(category: 'personal' | 'chenchen') {
    const all = await db.readingCheckins
      .where('category').equals(category)
      .toArray()
    const dates = [...new Set(all.map(r => r.checkinDate))].sort().reverse()
    let streak = 0
    const today = dayjs().format('YYYY-MM-DD')
    let checkDate = today
    for (const d of dates) {
      if (d === checkDate || d === dayjs(checkDate).subtract(1, 'day').format('YYYY-MM-DD')) {
        streak++
        checkDate = d
      } else if (d < checkDate) {
        break
      }
    }
    return streak
  }

  async function addCheckin(data: Omit<ReadingCheckin, 'id' | 'createdAt'>) {
    return db.readingCheckins.add({ ...data, createdAt: Date.now() })
  }

  async function deleteCheckin(id: number) {
    return db.readingCheckins.delete(id)
  }

  return { getByDate, getByMonth, getStreak, addCheckin, deleteCheckin }
}

// ===== 日历事件 =====
export function useDailyEvents() {
  async function getByDate(date: string) {
    return db.dailyEvents.where('date').equals(date).toArray()
  }

  async function getByMonth(year: number, month: number) {
    const start = `${year}-${String(month).padStart(2, '0')}-01`
    const end = dayjs(start).endOf('month').format('YYYY-MM-DD')
    return db.dailyEvents
      .filter(e => e.date >= start && e.date <= end)
      .toArray()
  }

  async function getEventDates(year: number, month: number) {
    const events = await getByMonth(year, month)
    return [...new Set(events.map(e => e.date))]
  }

  async function addEvent(data: Omit<DailyEvent, 'id' | 'createdAt'>) {
    return db.dailyEvents.add({ ...data, createdAt: Date.now() })
  }

  async function updateEvent(id: number, data: Partial<DailyEvent>) {
    return db.dailyEvents.update(id, data)
  }

  async function deleteEvent(id: number) {
    return db.dailyEvents.delete(id)
  }

  return { getByDate, getByMonth, getEventDates, addEvent, updateEvent, deleteEvent }
}

// ===== 英语学习进度 =====
export function useEnglishProgress() {
  async function getByDate(date: string) {
    return db.englishProgress.where('date').equals(date).first()
  }

  async function getProgressInMonth(year: number, month: number) {
    const start = `${year}-${String(month).padStart(2, '0')}-01`
    const end = dayjs(start).endOf('month').format('YYYY-MM-DD')
    return db.englishProgress
      .filter(p => p.date >= start && p.date <= end)
      .toArray()
  }

  async function markCompleted(articleId: number, score: number) {
    const date = dayjs().format('YYYY-MM-DD')
    const existing = await db.englishProgress.where({ date }).first()
    if (existing) {
      return db.englishProgress.update(existing.id!, { articleId, completed: true, score })
    }
    return db.englishProgress.add({ articleId, date, completed: true, score, createdAt: Date.now() })
  }

  return { getByDate, getProgressInMonth, markCompleted }
}

// ===== 待办事项 =====
export function useTodos() {
  async function getAll() {
    return db.todos.orderBy('order').toArray()
  }

  async function getActive() {
    return db.todos.where('completed').equals(0).sortBy('order')
  }

  async function getCompleted() {
    return db.todos.where('completed').equals(1).toArray()
  }

  async function getByPriority(priority: 'high' | 'medium' | 'low') {
    return db.todos.where('priority').equals(priority).filter(t => !t.completed).toArray()
  }

  async function addTodo(data: Omit<Todo, 'id' | 'completed' | 'completedAt' | 'createdAt' | 'order'>) {
    const count = await db.todos.count()
    return db.todos.add({
      ...data,
      completed: false,
      completedAt: null,
      createdAt: Date.now(),
      order: count,
    })
  }

  async function toggleTodo(id: number) {
    const todo = await db.todos.get(id)
    if (!todo) return
    return db.todos.update(id, {
      completed: !todo.completed,
      completedAt: !todo.completed ? Date.now() : null,
    })
  }

  async function updateTodo(id: number, data: Partial<Todo>) {
    return db.todos.update(id, data)
  }

  async function deleteTodo(id: number) {
    return db.todos.delete(id)
  }

  async function reorder(ids: number[]) {
    await db.transaction('rw', db.todos, async () => {
      for (let i = 0; i < ids.length; i++) {
        await db.todos.update(ids[i], { order: i })
      }
    })
  }

  return { getAll, getActive, getCompleted, getByPriority, addTodo, toggleTodo, updateTodo, deleteTodo, reorder }
}

// ===== 客户管理 =====
export function useCustomers() {
  async function getAll() {
    return db.customers.orderBy('createdAt').reverse().toArray()
  }

  async function getByStatus(status: 'active' | 'inactive' | 'closed') {
    return db.customers.where('status').equals(status).toArray()
  }

  async function search(query: string) {
    const q = query.toLowerCase()
    return db.customers
      .filter(c => c.name.toLowerCase().includes(q) || c.company.toLowerCase().includes(q))
      .toArray()
  }

  async function addCustomer(data: Omit<Customer, 'id' | 'lastFollowUpAt' | 'createdAt'>) {
    return db.customers.add({ ...data, lastFollowUpAt: null, createdAt: Date.now() })
  }

  async function updateCustomer(id: number, data: Partial<Customer>) {
    return db.customers.update(id, data)
  }

  async function deleteCustomer(id: number) {
    await db.transaction('rw', db.customers, db.customerFollowUps, async () => {
      await db.customerFollowUps.where('customerId').equals(id).delete()
      await db.customers.delete(id)
    })
  }

  return { getAll, getByStatus, search, addCustomer, updateCustomer, deleteCustomer }
}

// ===== 客户跟进 =====
export function useFollowUps() {
  async function getByCustomer(customerId: number) {
    return db.customerFollowUps.where('customerId').equals(customerId).reverse().sortBy('date')
  }

  async function addFollowUp(data: Omit<CustomerFollowUp, 'id' | 'createdAt'>) {
    await db.transaction('rw', db.customerFollowUps, db.customers, async () => {
      await db.customerFollowUps.add({ ...data, createdAt: Date.now() })
      await db.customers.update(data.customerId, { lastFollowUpAt: Date.now() })
    })
  }

  return { getByCustomer, addFollowUp }
}

// ===== 辰辰打卡 =====
export function useChenchenCheckins() {
  async function getByDate(date: string) {
    return db.chenchenCheckins.where('date').equals(date).toArray()
  }

  async function getByMonth(year: number, month: number) {
    const start = `${year}-${String(month).padStart(2, '0')}-01`
    const end = dayjs(start).endOf('month').format('YYYY-MM-DD')
    return db.chenchenCheckins
      .filter(c => c.date >= start && c.date <= end)
      .toArray()
  }

  async function getStreak(type: 'english' | 'reading') {
    const all = await db.chenchenCheckins.where('type').equals(type).toArray()
    const dates = [...new Set(all.map(c => c.date))].sort().reverse()
    let streak = 0
    const today = dayjs().format('YYYY-MM-DD')
    let checkDate = today
    for (const d of dates) {
      if (d === checkDate || d === dayjs(checkDate).subtract(1, 'day').format('YYYY-MM-DD')) {
        streak++
        checkDate = d
      } else if (d < checkDate) {
        break
      }
    }
    return streak
  }

  async function addCheckin(data: Omit<ChenchenCheckin, 'id' | 'createdAt'>) {
    // 同类型同一天只能打一次卡
    const existing = await db.chenchenCheckins.where({ type: data.type, date: data.date }).first()
    if (existing) {
      throw new Error('今天已经打过卡了')
    }
    return db.chenchenCheckins.add({ ...data, createdAt: Date.now() })
  }

  async function deleteCheckin(id: number) {
    return db.chenchenCheckins.delete(id)
  }

  return { getByDate, getByMonth, getStreak, addCheckin, deleteCheckin }
}

// ===== 成长记录 =====
export function useGrowthRecords() {
  async function getAll() {
    return db.growthRecords.orderBy('date').toArray()
  }

  async function getByMonth(date: string) {
    return db.growthRecords.where('date').equals(date).first()
  }

  async function addOrUpdate(data: Omit<GrowthRecord, 'id' | 'createdAt'>) {
    const existing = await db.growthRecords.where('date').equals(data.date).first()
    if (existing) {
      return db.growthRecords.update(existing.id!, data)
    }
    return db.growthRecords.add({ ...data, createdAt: Date.now() })
  }

  async function deleteRecord(id: number) {
    return db.growthRecords.delete(id)
  }

  return { getAll, getByMonth, addOrUpdate, deleteRecord }
}

// ===== 应用元数据 =====
export function useAppMeta() {
  async function get(key: string) {
    const meta = await db.appMeta.get(key)
    return meta?.value ?? null
  }

  async function set(key: string, value: any) {
    return db.appMeta.put({ key, value })
  }

  return { get, set }
}
