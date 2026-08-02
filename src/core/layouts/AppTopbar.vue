<script setup lang="ts">
import { useUiStore } from "@/core/store/ui.store";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useRouter } from "vue-router";

const uiStore = useUiStore();
const authStore = useAuthStore();
const router = useRouter();

function handleLogout() {
  authStore.logout();
  router.push("/login");
}
</script>

<template>
  <v-app-bar flat color="surface" class="topbar" height="68">
    <v-app-bar-nav-icon @click="uiStore.toggleSidebar" />

    <v-spacer />

    <v-btn icon variant="text" @click="uiStore.toggleTheme">
      <v-icon
        :icon="uiStore.isDark ? 'mdi-weather-sunny' : 'mdi-weather-night'"
      />
    </v-btn>

    <v-menu>
      <template #activator="{ props }">
        <v-btn v-bind="props" variant="text" class="ms-2">
          <v-avatar color="accent" size="32" class="me-2">
            <span class="text-caption font-weight-bold" style="color: #0d1b2a">
              {{ (authStore.user?.username || "A").charAt(0).toUpperCase() }}
            </span>
          </v-avatar>
          <span class="text-sm d-none d-sm-inline">{{
            authStore.user?.username
          }}</span>
        </v-btn>
      </template>
      <v-list density="comfortable" min-width="180">
        <v-list-item
          prepend-icon="mdi-logout"
          title="تسجيل الخروج"
          @click="handleLogout"
        />
      </v-list>
    </v-menu>
  </v-app-bar>
</template>

<style scoped>
.topbar {
  border-bottom: 1px solid var(--border-soft);
}
</style>
