import type { RouteRecordRaw } from 'vue-router'

const salesRoutes: RouteRecordRaw[] = [
  {
    path: '/sales',
    name: 'sales-list',
    component: () => import('./pages/SalesPage.vue'),
    meta: { requiresAuth: true, title: 'المبيعات' },
  },
]

export default salesRoutes
