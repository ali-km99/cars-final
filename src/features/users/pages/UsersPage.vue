<script setup lang="ts">
import { onMounted, reactive, ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../store/user.store";
import AppModal from "@/shared/components/AppModal.vue";
import UserForm from "../components/Userform.vue";
import type { UserCreateDto, UserFilter } from "../models/user.model";
import { formatDate } from "@/core/utils/formatters";

import { storeToRefs } from "pinia";

const userStore = useUserStore();
const { users, loading } = storeToRefs(userStore);

const router = useRouter();
const addDialog = ref(false);
const deleteDialog = ref(false);
const deletingId = ref<number | null>(null);
const saving = ref(false);
const formValid = ref(false);

const filter = reactive<UserFilter>({ search: "", page: 1, pageSize: 10 });

onMounted(() => userStore.fetchUsers(filter));

function handleFilterSearch() {
  filter.page = 1;
  userStore.fetchUsers({ ...filter });
}

function handlePageChange(page: number) {
  filter.page = page;
  userStore.fetchUsers({ ...filter });
}

async function handleCreate(payload: UserCreateDto | object) {
  saving.value = true;
  try {
    await userStore.createUser(payload as UserCreateDto);
    addDialog.value = false;
  } finally {
    saving.value = false;
  }
}

function confirmDelete(id: number) {
  deletingId.value = id;
  deleteDialog.value = true;
}

async function handleDelete() {
  if (!deletingId.value) return;
  await userStore.deleteUser(deletingId.value);
  deleteDialog.value = false;
  deletingId.value = null;
}

const roleColors: Record<string, string> = {
  SuperAdmin: "error",
  Admin: "warning",
  User: "info",
};

const headers = [
  { title: "المستخدم", key: "username", sortable: true },
  { title: "البريد الإلكتروني", key: "email" },
  { title: "الدور", key: "role" },
  { title: "الحالة", key: "isActive" },
  { title: "تاريخ الإنشاء", key: "createdAt" },
  {
    title: "الإجراءات",
    key: "actions",
    sortable: false,
    align: "end" as const,
  },
];

const userToDelete = computed(() =>
  userStore.users.find((u) => u.id === deletingId.value),
);
</script>

<template>
  <div>
    <!-- ─── Header ─────────────────────────────────────────────────────── -->
    <div class="d-flex align-center justify-space-between mb-6">
      <div class="d-flex flex-column">
        <span class="font-weight-bold text-2xl">المستخدمون</span>
        <span class="text-sm text-medium-emphasis">
          إدارة حسابات المستخدمين وصلاحياتهم
        </span>
      </div>
      <v-btn
        color="accent"
        prepend-icon="mdi-plus"
        style="text-transform: none; font-weight: 600"
        @click="addDialog = true"
      >
        إضافة مستخدم
      </v-btn>
    </div>

    <!-- ─── Filter ─────────────────────────────────────────────────────── -->
    <v-card class="app-card pa-4 mb-5">
      <v-text-field
        v-model="filter.search"
        label="بحث بالاسم أو البريد الإلكتروني"
        prepend-inner-icon="mdi-magnify"
        clearable
        hide-details
        style="max-width: 400px"
        @input="handleFilterSearch"
        @click:clear="
          () => {
            filter.search = '';
            handleFilterSearch();
          }
        "
      />
    </v-card>

    <!-- ─── Table ──────────────────────────────────────────────────────── -->
    <v-card class="app-card pa-0">
      <v-data-table
        :headers="headers"
        :items="users"
        :loading="loading"
        item-value="id"
        no-data-text="لا يوجد مستخدمون"
        loading-text="جاري التحميل..."
        hide-default-footer
      >
        <!-- اسم المستخدم -->
        <template #item.username="{ item }">
          <div class="d-flex align-center ga-3 py-2">
            <v-avatar color="accent" size="36" rounded="lg">
              <span class="text-body-2 font-weight-bold" style="color: #0d1b2a">
                {{ item.username.charAt(0).toUpperCase() }}
              </span>
            </v-avatar>
            <span class="font-weight-medium">{{ item.username }}</span>
          </div>
        </template>

        <!-- الدور -->
        <template #item.role="{ item }">
          <v-chip
            :color="roleColors[item.role] || 'secondary'"
            size="small"
            variant="tonal"
            class="font-weight-bold"
          >
            {{
              item.role === "SuperAdmin"
                ? "مدير عام"
                : item.role === "Admin"
                  ? "مدير"
                  : "مستخدم"
            }}
          </v-chip>
        </template>

        <!-- الحالة -->
        <template #item.isActive="{ item }">
          <v-chip
            :color="item.isActive ? 'success' : 'error'"
            size="small"
            variant="tonal"
          >
            <v-icon
              start
              :icon="item.isActive ? 'mdi-check-circle' : 'mdi-close-circle'"
              size="14"
            />
            {{ item.isActive ? "نشط" : "معطّل" }}
          </v-chip>
        </template>

        <!-- التاريخ -->
        <template #item.createdAt="{ item }">
          {{ formatDate(item.createdAt) }}
        </template>

        <!-- الإجراءات -->
        <template #item.actions="{ item }">
          <div class="d-flex justify-end ga-1">
            <v-tooltip text="تعديل البيانات والصلاحيات" location="top">
              <template #activator="{ props: tip }">
                <v-btn
                  v-bind="tip"
                  icon="mdi-pencil-outline"
                  size="small"
                  variant="tonal"
                  color="primary"
                  @click="router.push(`/users/${item.id}/edit`)"
                />
              </template>
            </v-tooltip>
            <v-tooltip text="حذف المستخدم" location="top">
              <template #activator="{ props: tip }">
                <v-btn
                  v-bind="tip"
                  icon="mdi-delete-outline"
                  size="small"
                  variant="tonal"
                  color="error"
                  @click="confirmDelete(item.id)"
                />
              </template>
            </v-tooltip>
          </div>
        </template>
      </v-data-table>

      <!-- Pagination -->
      <div
        v-if="userStore.pagination && userStore.pagination.totalPages > 1"
        class="d-flex justify-center pa-4"
      >
        <v-pagination
          :model-value="userStore.pagination.page"
          :length="userStore.pagination.totalPages"
          :total-visible="7"
          color="accent"
          density="comfortable"
          @update:model-value="handlePageChange"
        />
      </div>
    </v-card>

    <!-- ─── Add Modal ──────────────────────────────────────────────────── -->
    <AppModal
      v-model="addDialog"
      title="إضافة مستخدم جديد"
      :max-width="680"
      persistent
    >
      <UserForm
        v-model:valid="formValid"
        mode="create"
        :loading="saving"
        @submit="handleCreate"
        @cancel="addDialog = false"
      />
    </AppModal>

    <!-- ─── Delete Confirm Modal ───────────────────────────────────────── -->
    <AppModal v-model="deleteDialog" title="تأكيد الحذف" :max-width="420">
      <div class="d-flex flex-column align-center text-center pa-4 ga-4">
        <v-avatar color="error" variant="tonal" size="64" rounded="xl">
          <v-icon icon="mdi-delete-outline" size="32" color="error" />
        </v-avatar>
        <div>
          <p class="text-body-1 font-weight-bold mb-1">
            هل أنت متأكد من حذف المستخدم؟
          </p>
          <p class="text-body-2 text-medium-emphasis">
            سيتم حذف
            <strong>{{ userToDelete?.username }}</strong>
            بشكل نهائي ولا يمكن التراجع عن هذا الإجراء
          </p>
        </div>
        <div class="d-flex ga-3 w-100">
          <v-btn
            variant="tonal"
            color="secondary"
            block
            style="text-transform: none"
            @click="deleteDialog = false"
          >
            إلغاء
          </v-btn>
          <v-btn
            color="error"
            block
            :loading="userStore.loading"
            style="text-transform: none; font-weight: 600"
            @click="handleDelete"
          >
            نعم، احذف
          </v-btn>
        </div>
      </div>
    </AppModal>
  </div>
</template>
