import type { RouteRecordRaw } from 'vue-router'

const customersRoutes: RouteRecordRaw[] = [
  {
    path: '/customers',
    name: 'customers-list',
    component: () => import('./pages/CustomersPage.vue'),
    meta: { requiresAuth: true, title: 'العملاء' },
  },
]

export default customersRoutes
