import type { RouteRecordRaw } from 'vue-router'

const authRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('./pages/LoginPage.vue'),
    meta: { requiresAuth: false, title: 'تسجيل الدخول', layout: 'auth' },
  },
]

export default authRoutes
