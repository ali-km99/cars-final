import { defineStore } from "pinia";
import { ref, watch } from "vue";

export type AlertType = "success" | "error" | "warning" | "info";

export const useUiStore = defineStore("ui", () => {
  const storedTheme = localStorage.getItem("app_theme");
  const isDark = ref(storedTheme === "dark");
  const sidebarOpen = ref(true);
  const alert = ref({
    visible: false,
    message: "",
    type: "success" as AlertType,
    duration: 4000,
  });

  watch(isDark, (val) => {
    localStorage.setItem("app_theme", val ? "dark" : "light");
  });

  function toggleTheme() {
    isDark.value = !isDark.value;
  }

  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value;
  }

  function showAlert(
    message: string,
    type: AlertType = "success",
    duration = 4000,
  ) {
    alert.value = { visible: true, message, type, duration };
  }

  function closeAlert() {
    alert.value.visible = false;
  }

  return {
    isDark,
    sidebarOpen,
    alert,
    toggleTheme,
    toggleSidebar,
    showAlert,
    closeAlert,
  };
});
