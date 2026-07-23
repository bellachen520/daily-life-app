import Dexie, { type Table } from 'dexie'

// ===== 类型定义 =====

export interface ReadingCheckin {
  id?: number
  category: 'personal' | 'chenchen'
  bookTitle: string
  pagesRead: number
  duration: number
  notes: string
  checkinDate: string // YYYY-MM-DD
  createdAt: number
}

export interface DailyEvent {
  id?: number
  date: string // YYYY-MM-DD
  title: string
  description: string
  emoji: string
  color: string
  createdAt: number
}

export interface EnglishArticle {
  id: number
  title: string
  content: string
  translation: string
  difficulty: 'easy' | 'medium' | 'hard'
  topic: string
  vocabulary: { word: string; meaning: string }[]
}

export interface EnglishProgress {
  id?: number
  articleId: number
  date: string // YYYY-MM-DD
  completed: boolean
  score: number // 1-5
  createdAt: number
}

export interface Todo {
  id?: number
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  dueDate: string | null
  completed: boolean
  completedAt: number | null
  createdAt: number
  order: number
}

export interface Customer {
  id?: number
  name: string
  company: string
  phone: string
  email: string
  tags: string[]
  status: 'active' | 'inactive' | 'closed'
  notes: string
  lastFollowUpAt: number | null
  createdAt: number
}

export interface CustomerFollowUp {
  id?: number
  customerId: number
  date: string // YYYY-MM-DD
  content: string
  nextStep: string
  createdAt: number
}

export interface ChenchenCheckin {
  id?: number
  type: 'english' | 'reading'
  date: string // YYYY-MM-DD
  duration: number
  content: string
  notes: string
  createdAt: number
}

export interface GrowthRecord {
  id?: number
  date: string // YYYY-MM
  height: number // cm
  weight: number // kg
  notes: string
  createdAt: number
}

export interface AppMeta {
  key: string
  value: any
}

// ===== 数据库类 =====

class DailyLifeDB extends Dexie {
  readingCheckins!: Table<ReadingCheckin, number>
  dailyEvents!: Table<DailyEvent, number>
  englishProgress!: Table<EnglishProgress, number>
  todos!: Table<Todo, number>
  customers!: Table<Customer, number>
  customerFollowUps!: Table<CustomerFollowUp, number>
  chenchenCheckins!: Table<ChenchenCheckin, number>
  growthRecords!: Table<GrowthRecord, number>
  appMeta!: Table<AppMeta, string>

  constructor() {
    super('DailyLifeDB')

    this.version(1).stores({
      readingCheckins: '++id, category, checkinDate, [category+checkinDate]',
      dailyEvents: '++id, date',
      englishProgress: '++id, articleId, date',
      todos: '++id, completed, priority, dueDate, order',
      customers: '++id, name, status',
      customerFollowUps: '++id, customerId, date',
      chenchenCheckins: '++id, [type+date]',
      growthRecords: '++id, date',
      appMeta: 'key',
    })
  }
}

export const db = new DailyLifeDB()
