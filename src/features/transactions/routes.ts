import type { RouteRecordRaw } from 'vue-router'

const transactionsRoutes: RouteRecordRaw[] = [
  {
    path: '/transactions',
    name: 'transactions-list',
    component: () => import('./pages/TransactionsPage.vue'),
    meta: { requiresAuth: true, title: 'العمليات المالية' },
  },
]

export default transactionsRoutes
