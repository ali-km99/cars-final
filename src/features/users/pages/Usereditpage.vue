<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "../store/user.store";
import UserForm from "../components/Userform.vue";
import PermissionsPanel from "../components/Permissionspanel.vue";
import type { UserUpdateDto } from "../models/user.model";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const userId = Number(route.params.id);
const activeTab = ref("info");
const saving = ref(false);
const formValid = ref(false);

onMounted(async () => {
  // جلب بيانات المستخدم (تشمل الصلاحيات المفعّلة)
  await userStore.fetchUserById(userId);
  // جلب كل الصلاحيات المتاحة في النظام
  await userStore.fetchAllPermissions();
});

const user = computed(() => userStore.currentUser);

// القيم الأولية للفورم
const initialFormValues = computed(() =>
  user.value
    ? {
        username: user.value.username,
        email: user.value.email,
        role: user.value.role,
      }
    : undefined,
);

async function handleUpdateInfo(payload: UserUpdateDto | object) {
  saving.value = true;
  try {
    await userStore.updateUser(userId, payload as UserUpdateDto);
  } finally {
    saving.value = false;
  }
}

async function handleSavePermissions(selectedIds: number[]) {
  await userStore.saveUserPermissions(userId, { permissionIds: selectedIds });
}
</script>

<template>
  <div>
    <!-- ─── Page Header ─────────────────────────────────────────────── -->
    <div class="d-flex align-center ga-3 mb-6">
      <v-btn
        icon="mdi-arrow-right"
        variant="text"
        @click="router.push('/users')"
      />
      <div v-if="userStore.loading && !user" class="d-flex align-center ga-3">
        <v-skeleton-loader type="chip" width="120" />
      </div>
      <div v-else class="d-flex flex-column">
        <div class="d-flex align-center ga-2">
          <span class="text-h5 font-weight-bold">
            {{ user?.username || "..." }}
          </span>
          <v-chip
            v-if="user"
            size="small"
            :color="user.isActive ? 'success' : 'error'"
            variant="tonal"
          >
            {{ user.isActive ? "نشط" : "معطّل" }}
          </v-chip>
        </div>
        <span class="text-body-2 text-medium-emphasis">
          {{ user?.email }}
        </span>
      </div>
    </div>

    <!-- ─── Loading skeleton ────────────────────────────────────────── -->
    <div v-if="userStore.loading && !user">
      <v-skeleton-loader type="card" class="mb-4" />
    </div>

    <!-- ─── Tabs ─────────────────────────────────────────────────────── -->
    <v-card v-else class="app-card pa-0">
      <v-tabs
        v-model="activeTab"
        color="accent"
        align-tabs="start"
        class="px-4 pt-2"
      >
        <v-tab value="info" prepend-icon="mdi-account-edit-outline">
          البيانات الشخصية
        </v-tab>
        <v-tab value="permissions" prepend-icon="mdi-shield-key-outline">
          الصلاحيات
          <v-chip
            size="x-small"
            color="accent"
            variant="flat"
            class="ms-2"
            style="color: #0d1b2a"
          >
            {{ userStore.userPermissionIds.length }}
          </v-chip>
        </v-tab>
      </v-tabs>

      <v-divider />

      <v-window v-model="activeTab">
        <!-- ── تبويب البيانات ──────────────────────────────────────── -->
        <v-window-item value="info">
          <div class="pa-6">
            <UserForm
              v-if="user"
              v-model:valid="formValid"
              mode="edit"
              :initial-value="initialFormValues"
              :loading="saving"
              @submit="handleUpdateInfo"
              @cancel="router.push('/users')"
            />
          </div>
        </v-window-item>

        <!-- ── تبويب الصلاحيات ────────────────────────────────────── -->
        <v-window-item value="permissions">
          <div class="pa-6">
            <PermissionsPanel
              :all-permissions="userStore.allPermissions"
              :selected-ids="userStore.userPermissionIds"
              :loading="userStore.loadingPermissions"
              :saving="userStore.savingPermissions"
              @save="handleSavePermissions"
            />
          </div>
        </v-window-item>
      </v-window>
    </v-card>
  </div>
</template>
