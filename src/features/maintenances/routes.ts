import type { RouteRecordRaw } from "vue-router";

const maintenancesRoutes: RouteRecordRaw[] = [
  {
    path: "/maintenances",
    name: "maintenances-list",
    component: () => import("./pages/MaintenancesPage.vue"),
    meta: { requiresAuth: true, title: "الصيانة" },
  },
  {
    path: "/maintenance-centers",
    name: "maintenance-centers-list",
    component: () => import("./pages/MaintenanceCentersPage.vue"),
    meta: { requiresAuth: true, title: "مراكز الصيانة" },
  },
  {
    path: "/maintenance-centers/:id/debts",
    name: "maintenance-center-debts",
    component: () => import("./pages/MaintenanceCenterDetailsPage.vue"),
    meta: { requiresAuth: true, title: "ديون مركز الصيانة" },
  },
  {
    path: "/maintenance-debts",
    name: "maintenance-debts",
    component: () => import("./pages/MaintenanceDebtsPage.vue"),
    meta: { requiresAuth: true, title: "كشف ديون الصيانة" },
  },
];

export default maintenancesRoutes;
