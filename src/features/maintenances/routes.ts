import type { RouteRecordRaw } from "vue-router";

const maintenancesRoutes: RouteRecordRaw[] = [
  {
    path: "/maintenances",
    name: "maintenances-list",
    component: () => import("./pages/MaintenancesPage.vue"),
    meta: { requiresAuth: true, title: "الصيانة" },
  },
];

export default maintenancesRoutes;
