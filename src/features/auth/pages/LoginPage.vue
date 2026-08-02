<script setup lang="ts">
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "../store/auth.store";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const email = ref("");
const password = ref("");
const showPassword = ref(false);
const formValid = ref(false);

const rules = {
  required: (v: string) => !!v || "هذا الحقل مطلوب",
  email: (v: string) => /.+@.+\..+/.test(v) || "البريد الإلكتروني غير صحيح",
};

async function handleSubmit() {
  if (!formValid.value) return;
  const success = await authStore.login({
    email: email.value,
    password: password.value,
  });
  if (success) {
    const redirect = (route.query.redirect as string) || "/";
    router.push(redirect);
  }
}
</script>

<template>
  <v-card
    v-motion
    :initial="{ opacity: 0, y: 30 }"
    :enter="{ opacity: 1, y: 0, transition: { duration: 500 } }"
    class="login-card pa-8"
    width="420"
    rounded="xl"
    elevation="0"
  >
    <div class="d-flex flex-column align-center mb-6">
      <div class="logo-circle d-flex align-center justify-center mb-4">
        <v-icon icon="mdi-car-sports" color="accent" size="30" />
      </div>
      <span class="text-h6 font-weight-bold">Car Dealer</span>
      <span class="text-caption text-medium-emphasis">
        نظام إدارة معارض السيارات
      </span>
    </div>

    <!-- ✅ v-model على الفورم لتفعيل التحقق -->
    <v-form v-model="formValid" @submit.prevent="handleSubmit">
      <!-- ✅ v-model بدل :v-model — الخطأ الأساسي الذي كان يمنع إرسال البيانات -->
      <v-text-field
        v-model="email"
        label="البريد الإلكتروني"
        type="email"
        prepend-inner-icon="mdi-email-outline"
        :rules="[rules.required, rules.email]"
        variant="filled"
        bg-color="white"
        density="comfortable"
        rounded="lg"
        class="mb-2"
      />

      <v-text-field
        v-model="password"
        label="كلمة المرور"
        :type="showPassword ? 'text' : 'password'"
        prepend-inner-icon="mdi-lock-outline"
        :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
        :rules="[rules.required]"
        variant="filled"
        bg-color="white"
        density="comfortable"
        rounded="lg"
        @click:append-inner="showPassword = !showPassword"
      />

      <v-alert
        v-if="authStore.error"
        type="error"
        variant="tonal"
        density="compact"
        class="mb-4"
      >
        {{ authStore.error }}
      </v-alert>

      <v-btn
        type="submit"
        color="accent"
        block
        size="large"
        rounded="lg"
        class="mt-2 font-weight-bold"
        :loading="authStore.loading"
        :disabled="!formValid || authStore.loading"
        style="text-transform: none"
      >
        تسجيل الدخول
      </v-btn>
    </v-form>
  </v-card>
</template>

<style scoped>
.login-card {
  background-color: var(--bg-surface);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(212, 175, 55, 0.15);
}

.logo-circle {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0d1b2a, #1b263b);
  border: 1px solid rgba(212, 175, 55, 0.4);
}
</style>
