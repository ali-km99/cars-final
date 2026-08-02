<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useCarStore } from "../store/car.store";
import CarForm from "../components/CarForm.vue";
import type { CarCreateDto } from "../models/car.model";

const router = useRouter();
const carStore = useCarStore();
const loading = ref(false);

async function handleSubmit(payload: CarCreateDto, images: File[]) {
  loading.value = true;
  try {
    const created = await carStore.createCar(payload);
    if (images.length) {
      await import("../services/car.service").then(({ carService }) =>
        carService.uploadImages(created.id, images),
      );
    }
    router.push(`/cars/${created.id}`);
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div>
    <div class="d-flex align-center ga-3 mb-6">
      <v-btn
        icon="mdi-arrow-right"
        variant="text"
        @click="router.push('/cars')"
      />
      <div class="d-flex flex-column">
        <span class="font-weight-bold text-2xl">إضافة سيارة جديدة</span>
        <span class="text-sm text-medium-emphasis"
          >أدخل بيانات السيارة لإضافتها للمعرض</span
        >
      </div>
    </div>

    <v-card class="app-card pa-6">
      <CarForm :loading="loading" @submit="handleSubmit" />
    </v-card>
  </div>
</template>
