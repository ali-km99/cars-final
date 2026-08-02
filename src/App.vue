<script setup lang="ts">
import { computed, watch } from "vue";
import { useRoute } from "vue-router";
import { useTheme } from "vuetify";
import MainLayout from "@/core/layouts/MainLayout.vue";
import AuthLayout from "@/core/layouts/AuthLayout.vue";
import PublicLayout from "@/core/layouts/Publiclayout.vue";
import { useUiStore } from "@/core/store/ui.store";

const route = useRoute();
const uiStore = useUiStore();
const theme = useTheme();

theme.change(uiStore.isDark ? "darkTheme" : "lightTheme");

watch(
  () => uiStore.isDark,
  (isDark) => {
    theme.change(isDark ? "darkTheme" : "lightTheme");
  },
);

// ✅ ثلاثة layouts: main (الداشبورد) | auth (تسجيل دخول) | public (صفحة العميل)
const layoutMap: Record<string, unknown> = {
  auth: AuthLayout,
  public: PublicLayout,
};

const layout = computed(
  () => layoutMap[route.meta.layout as string] ?? MainLayout,
);
</script>

<template>
  <component :is="layout" />

  <!-- ✅ v-model بدل v-model:modelValue -->
  <v-snackbar
    v-model="uiStore.alert.visible"
    :color="uiStore.alert.type"
    location="top"
    elevation="6"
    :timeout="uiStore.alert.duration"
  >
    <div class="d-flex align-center ga-3">
      <v-icon
        v-if="uiStore.alert.type === 'success'"
        icon="mdi-check-circle-outline"
      />
      <v-icon
        v-else-if="uiStore.alert.type === 'error'"
        icon="mdi-alert-circle-outline"
      />
      <v-icon
        v-else-if="uiStore.alert.type === 'warning'"
        icon="mdi-alert-outline"
      />
      <v-icon v-else icon="mdi-information-outline" />
      <span>{{ uiStore.alert.message }}</span>
    </div>
  </v-snackbar>
</template>
