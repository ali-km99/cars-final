import type { RouteRecordRaw } from 'vue-router'

const dashboardRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'dashboard',
    component: () => import('./pages/DashboardPage.vue'),
    meta: { requiresAuth: true, title: 'لوحة التحكم' },
  },
]

export default dashboardRoutes
