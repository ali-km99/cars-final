<script setup lang="ts">
import { computed, ref, watch, watchEffect } from "vue";
import type { Permission } from "../models/user.model";

const props = defineProps<{
  allPermissions: Permission[];
  selectedIds: number[];
  loading?: boolean;
  saving?: boolean;
}>();

const emit = defineEmits<{
  save: [number[]];
}>();

// نسخة محلية قابلة للتعديل من الـ IDs المختارة
const localSelected = ref<number[]>([...props.selectedIds]);

// مزامنة لو تغيّرت الـ props من الخارج (عند تحميل بيانات مستخدم جديد)
watch(
  () => props.selectedIds,
  (ids) => {
    localSelected.value = ids.map((id) => Number(id));
  },
  { immediate: true },
);
watchEffect(() => {
  console.log("selectedIds:", props.selectedIds);
  console.log("localSelected:", localSelected.value);
});

// تجميع الصلاحيات حسب الـ group
const groupedPermissions = computed(() => {
  const groups: Record<string, Permission[]> = {};

  for (const perm of props.allPermissions) {
    const group = perm.category; // ✅ بدل group

    if (!groups[group]) groups[group] = [];
    groups[group].push(perm);
  }

  return groups;
});

const groupNames = computed(() => {
  const order = [
    "Cars",
    "Customers",
    "Sales",
    "Maintenance",
    "Transactions",
    "Users",
  ];

  return order.filter((g) => groupedPermissions.value[g]);
});

// اسم المجموعة بالعربي
const groupLabels: Record<string, string> = {
  Cars: "السيارات",
  Customers: "العملاء",
  Sales: "المبيعات",
  Maintenance: "الصيانة",
  Transactions: "العمليات المالية",
  Users: "المستخدمون",
  Dashboard: "لوحة التحكم",
};

const groupIcons: Record<string, string> = {
  Cars: "mdi-car-multiple",
  Customers: "mdi-account-group-outline",
  Sales: "mdi-cash-multiple",
  Maintenances: "mdi-wrench-outline",
  Transactions: "mdi-finance",
  Users: "mdi-account-cog-outline",
  Dashboard: "mdi-view-dashboard-outline",
};

// تحقق هل كل صلاحيات مجموعة مُختارة (للـ "تحديد الكل" لكل مجموعة)
function isGroupAllSelected(group: string) {
  return groupedPermissions.value[group].every((p) =>
    localSelected.value.includes(p.id),
  );
}

function isGroupIndeterminate(group: string) {
  const perms = groupedPermissions.value[group];
  const count = perms.filter((p) => localSelected.value.includes(p.id)).length;
  return count > 0 && count < perms.length;
}

function toggleGroup(group: string) {
  const ids = groupedPermissions.value[group].map((p) => p.id);
  if (isGroupAllSelected(group)) {
    localSelected.value = localSelected.value.filter((id) => !ids.includes(id));
  } else {
    const toAdd = ids.filter((id) => !localSelected.value.includes(id));
    localSelected.value = [...localSelected.value, ...toAdd];
  }
}

function togglePermission(id: number) {
  if (localSelected.value.includes(id)) {
    localSelected.value = localSelected.value.filter((x) => x !== id);
  } else {
    localSelected.value = [...localSelected.value, id];
  }
}

const totalSelected = computed(() => localSelected.value.length);
const totalAll = computed(() => props.allPermissions.length);
</script>

<template>
  <div>
    <!-- Header الصلاحيات -->
    <div class="d-flex align-center justify-space-between mb-4">
      <div>
        <span class="text-base font-bold">الصلاحيات</span>
        <v-chip size="small" color="accent" variant="tonal" class="ms-2">
          {{ totalSelected }} / {{ totalAll }}
        </v-chip>
      </div>
      <v-btn
        color="accent"
        :loading="saving"
        :disabled="loading"
        style="text-transform: none; font-weight: 600"
        prepend-icon="mdi-content-save-outline"
        @click="emit('save', localSelected)"
      >
        حفظ الصلاحيات
      </v-btn>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="d-flex justify-center py-10">
      <v-progress-circular indeterminate color="accent" size="40" />
    </div>

    <!-- المجموعات -->
    <v-row v-else>
      <v-col v-for="group in groupNames" :key="group" cols="12" md="6">
        <v-card class="app-card pa-4 h-100">
          <!-- عنوان المجموعة + Checkbox تحديد الكل -->
          <div class="d-flex align-center ga-2 mb-3">
            <v-icon
              :icon="groupIcons[group] || 'mdi-shield-outline'"
              color="accent"
              size="20"
            />
            <span class="text-base font-bold flex-grow-1">
              {{ groupLabels[group] || group }}
            </span>
            <v-checkbox
              :model-value="isGroupAllSelected(group)"
              :indeterminate="isGroupIndeterminate(group)"
              color="accent"
              density="compact"
              hide-details
              @update:model-value="toggleGroup(group)"
            />
          </div>

          <v-divider class="mb-3" />

          <!-- الصلاحيات الفردية -->
          <div class="d-flex flex-column ga-1">
            <div
              v-for="perm in groupedPermissions[group]"
              :key="perm.id"
              class="d-flex align-center justify-space-between perm-row px-2 py-1 rounded-lg"
              :class="{ 'perm-row--active': localSelected.includes(perm.id) }"
            >
              <div class="d-flex flex-column">
                <span class="text-sm">{{ perm.name }}</span>
                <span class="text-xs text-medium-emphasis">{{
                  perm.code
                }}</span>
              </div>
              <v-checkbox
                :model-value="localSelected.includes(perm.id)"
                color="accent"
                density="compact"
                hide-details
                @update:model-value="togglePermission(perm.id)"
              />
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<style scoped>
.perm-row {
  transition: background-color 0.15s ease;
  cursor: pointer;
}
.perm-row:hover {
  background-color: rgba(212, 175, 55, 0.06);
}
.perm-row--active {
  background-color: rgba(212, 175, 55, 0.1);
}
</style>
