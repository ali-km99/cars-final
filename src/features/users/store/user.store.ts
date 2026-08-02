import { defineStore } from "pinia";
import { ref } from "vue";
import { useUiStore } from "@/core/store/ui.store";
import { userService } from "../services/user.service";
import type {
  Permission,
  UserCreateDto,
  UserDetail,
  UserFilter,
  UserListItem,
  UserUpdateDto,
  UserUpdatePermissionsDto,
} from "../models/user.model";
import type { ApiPagedResult } from "@/core/api/types";

export const useUserStore = defineStore("users", () => {
  const uiStore = useUiStore();

  // ─── State ────────────────────────────────────────────────────────────────
  const users = ref<UserListItem[]>([]);
  const pagination = ref<Omit<ApiPagedResult<unknown>, "items"> | null>(null);
  const currentUser = ref<UserDetail | null>(null);
  const allPermissions = ref<Permission[]>([]);
  const userPermissionIds = ref<number[]>([]);
  const loading = ref(false);
  const loadingPermissions = ref(false);
  const savingPermissions = ref(false);
  const error = ref<string | null>(null);

  // ─── Actions ──────────────────────────────────────────────────────────────
  async function fetchUsers(filter?: UserFilter) {
    loading.value = true;
    error.value = null;

    try {
      const { data: envelope } = await userService.getAll(filter);

      // 👇 دعم حالتين (paged + non-paged)
      if (Array.isArray(envelope.data)) {
        // ✅ API بدون pagination
        users.value = envelope.data;
        pagination.value = null;
      } else {
        // ✅ API فيه pagination
        users.value = envelope.data.items;
        pagination.value = {
          totalCount: envelope.data.totalCount,
          page: envelope.data.page,
          pageSize: envelope.data.pageSize,
          totalPages: envelope.data.totalPages,
        };
      }
    } catch (err: any) {
      error.value = err?.response?.data?.message || "فشل تحميل المستخدمين";
    } finally {
      loading.value = false;
    }
  }

  async function fetchUserById(id: number) {
    loading.value = true;
    error.value = null;
    try {
      const { data: envelope } = await userService.getById(id);
      currentUser.value = envelope.data;
      // نستخرج الـ permission IDs من بيانات المستخدم مباشرة
      userPermissionIds.value = envelope.data.permissions.map((p) => p.id);
    } catch (err: any) {
      error.value = err?.response?.data?.message || "فشل تحميل بيانات المستخدم";
    } finally {
      loading.value = false;
    }
  }

  async function createUser(payload: UserCreateDto) {
    const { data: envelope } = await userService.create(payload);
    uiStore.showAlert("تم إضافة المستخدم بنجاح", "success");
    await fetchUsers();
    return envelope.data;
  }

  async function updateUser(id: number, payload: UserUpdateDto) {
    const { data: envelope } = await userService.update(id, payload);
    // تحديث القائمة مباشرة بدون refetch
    const idx = users.value.findIndex((u) => u.id === id);
    if (idx !== -1) {
      users.value[idx] = {
        ...users.value[idx],
        username: envelope.data.username,
        email: envelope.data.email,
        role: envelope.data.role,
      };
    }
    if (currentUser.value?.id === id) {
      currentUser.value = envelope.data;
    }
    uiStore.showAlert("تم تحديث بيانات المستخدم بنجاح", "success");
    return envelope.data;
  }

  async function deleteUser(id: number) {
    await userService.remove(id);
    users.value = users.value.filter((u) => u.id !== id);
    uiStore.showAlert("تم حذف المستخدم بنجاح", "success");
  }

  // ─── الصلاحيات ────────────────────────────────────────────────────────────
  async function fetchAllPermissions() {
    loadingPermissions.value = true;
    try {
      const { data: envelope } = await userService.getAllPermissions();
      allPermissions.value = envelope.data;
    } catch (err: any) {
      uiStore.showAlert("فشل تحميل الصلاحيات", "error");
    } finally {
      loadingPermissions.value = false;
    }
  }

  async function fetchUserPermissions(userId: number) {
    loadingPermissions.value = true;
    try {
      const { data: envelope } = await userService.getUserPermissions(userId);
      userPermissionIds.value = envelope.data.map((p) => p.id);
    } catch (err: any) {
      uiStore.showAlert("فشل تحميل صلاحيات المستخدم", "error");
    } finally {
      loadingPermissions.value = false;
    }
  }

  async function saveUserPermissions(
    userId: number,
    payload: UserUpdatePermissionsDto,
  ) {
    savingPermissions.value = true;
    try {
      await userService.updateUserPermissions(userId, payload);
      userPermissionIds.value = payload.permissionIds;
      uiStore.showAlert("تم تحديث الصلاحيات بنجاح", "success");
      return true;
    } catch (err: any) {
      uiStore.showAlert(
        err?.response?.data?.message || "فشل تحديث الصلاحيات",
        "error",
      );
      return false;
    } finally {
      savingPermissions.value = false;
    }
  }

  return {
    users,
    pagination,
    currentUser,
    allPermissions,
    userPermissionIds,
    loading,
    loadingPermissions,
    savingPermissions,
    error,
    fetchUsers,
    fetchUserById,
    createUser,
    updateUser,
    deleteUser,
    fetchAllPermissions,
    fetchUserPermissions,
    saveUserPermissions,
  };
});
