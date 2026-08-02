import type { RouteRecordRaw } from "vue-router";

const sharingRoutes: RouteRecordRaw[] = [
  {
    // ✅ مسار عام تمامًا — لا يحتاج توكن، يفتحه العملاء من خارج النظام
    path: "/public/car/:token",
    name: "public-car",
    component: () => import("./pages/PublicCarPage.vue"),
    meta: {
      requiresAuth: false, // صريح — يُعطّل guard التوكن كليًا
      layout: "public", // يُخبر App.vue بعدم تطبيق MainLayout
      title: "تفاصيل السيارة",
    },
  },
];

export default sharingRoutes;
