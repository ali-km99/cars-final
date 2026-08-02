import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useUiStore } from "@/core/store/ui.store";
import { authService } from "../services/auth.service";
import type { AuthUser, LoginDto } from "../models/auth.model";

export const useAuthStore = defineStore("auth", () => {
  const token = ref<string | null>(localStorage.getItem("auth_token"));
  const user = ref<AuthUser | null>(
    JSON.parse(localStorage.getItem("auth_user") || "null"),
  );
  const loading = ref(false);
  const error = ref<string | null>(null);
  const uiStore = useUiStore();

  const isAuthenticated = computed(() => !!token.value);

  async function login(credentials: LoginDto) {
    loading.value = true;
    error.value = null;
    try {
      // الباك اند: { success, message, data: { accessToken, username, ... } }
      const { data: envelope } = await authService.login(credentials);

      if (!envelope.success) {
        throw new Error(envelope.message || "فشل تسجيل الدخول");
      }

      const responseData = envelope.data;

      // ✅ حفظ accessToken في localStorage باسم auth_token
      token.value = responseData.accessToken;
      localStorage.setItem("auth_token", responseData.accessToken);

      // ✅ حفظ بيانات المستخدم (بدون الـ tokens)
      const authUser: AuthUser = {
        id: responseData.id,
        username: responseData.username,
        email: responseData.email,
        role: responseData.role,
      };
      user.value = authUser;
      localStorage.setItem("auth_user", JSON.stringify(authUser));

      uiStore.showAlert("تم تسجيل الدخول بنجاح", "success");
      return true;
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || "فشل تسجيل الدخول";
      error.value = message;
      uiStore.showAlert(message, "error");
      return false;
    } finally {
      loading.value = false;
    }
  }

  function logout() {
    token.value = null;
    user.value = null;
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
  }

  return { token, user, loading, error, isAuthenticated, login, logout };
});
