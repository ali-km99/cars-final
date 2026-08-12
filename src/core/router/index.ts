import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";

import dashboardRoutes from "@/features/dashboard/routes";
import carsRoutes from "@/features/cars/routes";
import customersRoutes from "@/features/customers/routes";
import salesRoutes from "@/features/sales/routes";
import maintenancesRoutes from "@/features/maintenances/routes";
import transactionsRoutes from "@/features/transactions/routes";
import authRoutes from "@/features/auth/routes";
import usersRoutes from "@/features/users/routes";
import sharingRoutes from "@/features/public/routes";
import expensesRoutes from "@/features/expenses/routes";

const routes: RouteRecordRaw[] = [
  ...dashboardRoutes,
  ...carsRoutes,
  ...customersRoutes,
  ...salesRoutes,
  ...maintenancesRoutes,
  ...transactionsRoutes,
  ...expensesRoutes,
  ...usersRoutes,
  ...authRoutes,
  ...sharingRoutes,
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: () => import("@/shared/components/NotFoundPage.vue"),
    meta: { requiresAuth: false, title: "الصفحة غير موجودة" },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

router.beforeEach((to) => {
  const token = localStorage.getItem("auth_token");

  // إذا الصفحة تتطلب تسجيل دخول
  const requiresAuth = to.meta.requiresAuth !== false;

  if (requiresAuth && !token) {
    return { name: "login", query: { redirect: to.fullPath } };
  }

  // إذا المستخدم مسجل دخول وحاول يفتح login
  if (to.name === "login" && token) {
    return { name: "dashboard" };
  }

  // تغيير عنوان الصفحة
  if (to.meta.title) {
    document.title = `${to.meta.title} | Car Dealer`;
  }

  return true;
});

export default router;
