<script setup lang="ts">
import { useUiStore } from "@/core/store/ui.store";

const uiStore = useUiStore();

const navItems = [
  { title: "لوحة التحكم", icon: "mdi-view-dashboard-outline", to: "/" },
  { title: "السيارات", icon: "mdi-car-multiple", to: "/cars" },
  { title: "العملاء", icon: "mdi-account-group-outline", to: "/customers" },
  { title: "المبيعات", icon: "mdi-cash-register", to: "/sales" },

  {
    title: "قسم الصيانة",
    icon: "mdi-car-cog",
    children: [
      {
        title: "الصيانة",
        icon: "mdi-wrench-outline",
        to: "/maintenances",
      },
      {
        title: "مراكز الصيانة",
        icon: "mdi-garage",
        to: "/maintenance-centers",
      },
      {
        title: "ديون الصيانة",
        icon: "mdi-cash-clock",
        to: "/maintenance-debts",
      },
    ],
  },

  { title: "المصروفات", icon: "mdi-cash-minus", to: "/expenses" },
  { title: "العمليات المالية", icon: "mdi-finance", to: "/transactions" },
  {
    title: "المستخدمين",
    icon: "mdi-account-box-multiple-outline",
    to: "/Users",
  },
];
</script>

<template>
  <v-navigation-drawer
    :model-value="uiStore.sidebarOpen"
    location="right"
    width="260"
    class="sidebar-drawer"
    color="surface"
    @update:model-value="(v: boolean) => (uiStore.sidebarOpen = v)"
  >
    <div class="d-flex align-center pa-5 ga-3">
      <div class="logo-badge d-flex align-center justify-center">
        <v-icon icon="mdi-car-sports" color="accent" size="22" />
      </div>
      <div class="d-flex flex-column">
        <span class="text-smfont-weight-bold">Car Dealer</span>
        <span class="text-xs text-medium-emphasis">نظام إدارة المعارض</span>
      </div>
    </div>

    <v-divider />

    <v-list nav density="comfortable" class="px-2 pt-3">
      <template v-for="item in navItems" :key="item.title">
        <!-- العناصر العادية -->
        <v-list-item
          v-if="!item.children"
          :to="item.to"
          :prepend-icon="item.icon"
          :title="item.title"
          rounded="lg"
          class="mb-1 nav-item"
          active-class="nav-item-active"
        />

        <!-- مجموعة الصيانة -->
        <v-list-group v-else value="maintenance" class="mb-1">
          <template #activator="{ props }">
            <v-list-item
              v-bind="props"
              :prepend-icon="item.icon"
              :title="item.title"
              rounded="lg"
              class="nav-item"
            />
          </template>

          <v-list-item
            v-for="child in item.children"
            :key="child.to"
            :to="child.to"
            :prepend-icon="child.icon"
            :title="child.title"
            rounded="lg"
            class="maintenance-child"
            active-class="nav-item-active"
          />
        </v-list-group>
      </template>
    </v-list>
  </v-navigation-drawer>
</template>

<style scoped>
.logo-badge {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #0d1b2a, #1b263b);
  border: 1px solid rgba(212, 175, 55, 0.4);
}

.nav-item {
  transition: background-color 0.2s ease;
}

.nav-item-active {
  background-color: rgba(212, 175, 55, 0.12) !important;
  color: var(--color-accent) !important;
  font-weight: 600;
}
.maintenance-child {
  margin-inline-start: 5px;
  margin-bottom: 2px;
  font-size: 0.9rem;
}

.maintenance-child :deep(.v-list-item__prepend) {
  margin-inline-end: 10px;
}

.v-list-group :deep(.v-list-group__items) {
  padding-inline-start: 0;
}
</style>
