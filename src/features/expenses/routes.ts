import type { RouteRecordRaw } from "vue-router";

const expensesRoutes: RouteRecordRaw[] = [
  {
    path: "/expenses",
    name: "expenses-list",
    component: () => import("./pages/ExpensesPage.vue"),
    meta: { requiresAuth: true, title: "المصروفات" },
  },
];

export default expensesRoutes;
