<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useCarStore } from "../store/car.store";
import CarForm from "../components/CarForm.vue";
import type { CarCreateDto, CarUpdateDto } from "../models/car.model";

const route = useRoute();
const router = useRouter();
const carStore = useCarStore();
const loading = ref(false);
const uploadLoading = ref(false);
const newImages = ref<File[]>([]);
const carId = Number(route.params.id);

onMounted(async () => {
  loading.value = true;
  try {
    await carStore.fetchCarById(carId);
  } finally {
    loading.value = false;
  }
});

const car = computed(() => carStore.currentCar);

async function handleSubmit(payload: CarCreateDto, images: File[]) {
  const updatePayload: CarUpdateDto = {
    id: carId,
    ...payload,
  };

  loading.value = true;
  try {
    await carStore.updateCar(carId, updatePayload);
    if (images.length) {
      await import("../services/car.service").then(({ carService }) =>
        carService.uploadImages(carId, images),
      );
    }
    router.push(`/cars/${carId}`);
  } finally {
    loading.value = false;
  }
}

async function uploadNewImages() {
  if (!newImages.value.length) return;
  uploadLoading.value = true;
  try {
    await import("../services/car.service").then(({ carService }) =>
      carService.uploadImages(carId, newImages.value),
    );
    newImages.value = [];
    await carStore.fetchCarById(carId);
  } finally {
    uploadLoading.value = false;
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
        <span class="font-weight-bold text-2xl">تعديل بيانات السيارة</span>
        <span class="text-sm text-medium-emphasis"
          >حدّث بيانات السيارة ثم احفظ التغييرات</span
        >
      </div>
    </div>

    <v-card class="app-card pa-6">
      <div v-if="loading || !car">
        <v-skeleton-loader type="article" class="rounded-lg" />
      </div>
      <div v-else>
        <CarForm
          :initialValue="car"
          :loading="loading"
          @submit="handleSubmit"
        />

        <v-card class="app-card pa-6 mt-6">
          <div class="d-flex align-center justify-between mb-4">
            <div>
              <span class="text-h6 font-weight-bold">صور جديدة فقط</span>
              <div class="text-sm text-medium-emphasis">
                استخدم هذا الزر لحفظ الصور دون تعديل بيانات السيارة
              </div>
            </div>
            <v-btn
              color="accent"
              :loading="uploadLoading"
              :disabled="!newImages.length || uploadLoading"
              @click="uploadNewImages"
              style="text-transform: none; font-weight: 600"
            >
              حفظ الصور فقط
            </v-btn>
          </div>

          <v-file-input
            v-model="newImages"
            label="اختر صور جديدة"
            multiple
            accept="image/*"
            prepend-icon="mdi-camera-outline"
            variant="outlined"
            density="comfortable"
            rounded="lg"
            show-size
            chips
          />
        </v-card>
      </div>
    </v-card>
  </div>
</template>
