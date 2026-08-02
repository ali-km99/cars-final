import type { RouteRecordRaw } from "vue-router";

const carsRoutes: RouteRecordRaw[] = [
  {
    path: "/cars",
    name: "cars-list",
    component: () => import("./pages/CarsPage.vue"),
    meta: { requiresAuth: true, title: "السيارات" },
  },
  {
    path: "/cars/add",
    name: "cars-add",
    component: () => import("./pages/AddCarPage.vue"),
    meta: { requiresAuth: true, title: "إضافة سيارة" },
  },
  {
    path: "/cars/:id",
    name: "cars-details",
    component: () => import("./pages/CarDetailsPage.vue"),
    meta: { requiresAuth: true, title: "تفاصيل السيارة" },
  },
  {
    path: "/cars/:id/edit",
    name: "cars-edit",
    component: () => import("./pages/EditCarPage.vue"),
    meta: { requiresAuth: true, title: "تعديل السيارة" },
  },
  {
    path: "/cars/features",
    name: "cars-features",
    component: () => import("./pages/FeaturesPage.vue"),
    meta: { requiresAuth: true, title: "كماليات السيارات" },
  },
];

export default carsRoutes;
