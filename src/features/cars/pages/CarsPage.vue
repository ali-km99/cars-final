<script setup lang="ts">
import { onMounted, reactive } from "vue";
import { useRouter } from "vue-router";
import { useCarStore } from "../store/car.store";
import CarCard from "../components/CarCard.vue";
import CarFilter from "../components/CarFilter.vue";
import type { CarFilter as CarFilterType } from "../models/car.model";

const carStore = useCarStore();
const router = useRouter();

const activeFilter = reactive<CarFilterType>({ Page: 1, PageSize: 12 });

onMounted(() => carStore.fetchCars(activeFilter));

function handleFilterUpdate(filter: CarFilterType) {
  Object.assign(activeFilter, filter, { Page: 1 });
  carStore.fetchCars(activeFilter);
}

function handlePageChange(page: number) {
  activeFilter.Page = page;
  carStore.fetchCars(activeFilter);
}
</script>

<template>
  <div>
    <div class="md:flex align-center justify-space-between mb-6">
      <div class="flex flex-column py-4">
        <span class="font-weight-bold text-2xl">السيارات</span>
        <span class="text-sm text-medium-emphasis"
          >إدارة جميع السيارات في المعرض</span
        >
      </div>
      <div class="flex gap-2">
        <v-btn
          color="secondary"
          prepend-icon="mdi-star-cog"
          rounded="lg"
          style="text-transform: none; font-weight: 600"
          @click="router.push('/cars/features')"
        >
          كماليات سيارات
        </v-btn>

        <v-btn
          color="accent"
          prepend-icon="mdi-plus"
          rounded="lg"
          style="text-transform: none; font-weight: 600"
          @click="router.push('/cars/add')"
        >
          إضافة سيارة
        </v-btn>
      </div>
    </div>

    <CarFilter @update:filter="handleFilterUpdate" />

    <v-row v-if="carStore.loading">
      <v-col v-for="n in 8" :key="n" cols="12" sm="6" md="4" lg="3">
        <v-skeleton-loader type="image, article" class="rounded-lg" />
      </v-col>
    </v-row>

    <v-row v-else-if="carStore.cars.length">
      <v-col
        v-for="(car, i) in carStore.cars"
        :key="car.id"
        cols="12"
        sm="6"
        md="4"
        lg="3"
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :enter="{
          opacity: 1,
          y: 0,
          transition: { duration: 350, delay: Math.min(i * 50, 400) },
        }"
      >
        <CarCard :car="car" />
      </v-col>
    </v-row>

    <div v-else class="d-flex flex-column align-center justify-center py-16">
      <v-icon icon="mdi-car-off" size="64" color="grey" class="mb-4" />
      <span class="text-smtext-medium-emphasis">لا توجد سيارات مطابقة</span>
    </div>

    <div
      v-if="carStore.pagination && carStore.pagination.totalPages > 1"
      class="d-flex justify-center mt-6"
    >
      <v-pagination
        :model-value="carStore.pagination.page"
        :length="carStore.pagination.totalPages"
        :total-visible="7"
        color="accent"
        density="comfortable"
        @update:model-value="handlePageChange"
      />
    </div>
  </div>
</template>
