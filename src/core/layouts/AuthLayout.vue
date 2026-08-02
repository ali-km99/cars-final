<script setup lang="ts"></script>

<template>
  <v-app>
    <v-main class="auth-bg">
      <div class="d-flex align-center justify-center fill-height">
        <router-view />
      </div>
    </v-main>
  </v-app>
</template>

<style scoped>
.auth-bg {
  background: linear-gradient(160deg, #0d1b2a 0%, #1b263b 60%, #0d1b2a 100%);
  min-height: 100vh;
}
</style>
