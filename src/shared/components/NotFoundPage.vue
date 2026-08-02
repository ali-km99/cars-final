<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="d-flex flex-column align-center justify-center" style="height: 100vh">
    <span class="text-gold" style="font-size: 6rem; font-weight: 700">404</span>
    <p class="text-h6 mb-6">عذراً، الصفحة التي تبحث عنها غير موجودة</p>
    <v-btn color="accent" rounded="lg" @click="router.push('/')">العودة للرئيسية</v-btn>
  </div>
</template>
