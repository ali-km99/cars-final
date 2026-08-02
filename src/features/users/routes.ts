import type { RouteRecordRaw } from "vue-router";

const usersRoutes: RouteRecordRaw[] = [
  {
    path: "/users",
    name: "users-list",
    component: () => import("./pages/UsersPage.vue"),
    meta: { requiresAuth: true, title: "المستخدمون" },
  },
  {
    path: "/users/:id/edit",
    name: "users-edit",
    component: () => import("./pages/Usereditpage.vue"),
    meta: { requiresAuth: true, title: "تعديل المستخدم" },
  },
];

export default usersRoutes;
