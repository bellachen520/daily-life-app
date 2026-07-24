import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      redirect: '/life',
    },
    {
      path: '/life',
      name: 'life-home',
      component: () => import('@/views/LifeHome.vue'),
    },
    {
      path: '/life/reading',
      name: 'life-reading',
      component: () => import('@/views/ReadingCheckin.vue'),
    },
    {
      path: '/life/calendar',
      name: 'life-calendar',
      component: () => import('@/views/CalendarEvents.vue'),
    },
    {
      path: '/life/english',
      name: 'life-english-list',
      component: () => import('@/views/EnglishList.vue'),
    },
    {
      path: '/life/english/:id',
      name: 'life-english-detail',
      component: () => import('@/views/EnglishPractice.vue'),
    },
    {
      path: '/work',
      name: 'work-home',
      component: () => import('@/views/WorkHome.vue'),
    },
    {
      path: '/work/todos',
      name: 'work-todos',
      component: () => import('@/views/TodoList.vue'),
    },
    {
      path: '/work/customers',
      name: 'work-customers',
      component: () => import('@/views/CustomerList.vue'),
    },
    {
      path: '/work/customers/:id',
      name: 'work-customer-detail',
      component: () => import('@/views/CustomerDetail.vue'),
    },
    {
      path: '/chenchen',
      name: 'chenchen-home',
      component: () => import('@/views/ChenchenHome.vue'),
    },
    {
      path: '/chenchen/english',
      name: 'chenchen-english',
      component: () => import('@/views/ChenchenEnglish.vue'),
    },
    {
      path: '/chenchen/reading',
      name: 'chenchen-reading',
      component: () => import('@/views/ChenchenReading.vue'),
    },
    {
      path: '/chenchen/growth',
      name: 'chenchen-growth',
      component: () => import('@/views/GrowthRecord.vue'),
    },
  ],
})

export default router
