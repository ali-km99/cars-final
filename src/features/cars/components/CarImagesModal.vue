<script setup lang="ts">
import { computed } from "vue";
import AppModal from "@/shared/components/AppModal.vue";
import type { CarImage } from "../models/car.model";
import { resolveImageUrl } from "@/core/utils/formatters";

const props = defineProps<{
  modelValue: boolean;
  carId: number;
  images?: CarImage[];
  loadingImageId?: number | null;
}>();

const emit = defineEmits<{
  "update:modelValue": [boolean];
  setPrimary: [number];
  deleteImage: [number];
}>();

const show = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit("update:modelValue", value),
});

const loadingImageId = computed(() => props.loadingImageId ?? null);

const imageItems = computed(() => {
  return (
    props.images?.map((img) => ({
      ...img,
      src: resolveImageUrl(img.imageUrl),
    })) ?? []
  );
});

function close() {
  emit("update:modelValue", false);
}

function handleSetPrimary(imageId: number) {
  emit("setPrimary", imageId);
}

function handleDelete(imageId: number) {
  emit("deleteImage", imageId);
}
</script>

<template>
  <AppModal v-model:modelValue="show" title="إدارة صور السيارة" :maxWidth="900">
    <div
      v-if="!imageItems.length"
      class="d-flex flex-column align-center justify-center py-16"
    >
      <v-icon icon="mdi-image-off-outline" size="48" color="grey" />
      <span class="text-sm text-medium-emphasis mt-4">لا توجد صور لعرضها</span>
    </div>

    <v-row v-else dense>
      <v-col v-for="img in imageItems" :key="img.id" cols="12" sm="6" md="4">
        <v-card class="app-card">
          <v-img :src="img.src" height="180" class="rounded-lg" />
          <v-card-text class="pa-4">
            <div class="d-flex align-center justify-space-between mb-4">
              <span class="text-sm">{{
                img.isPrimary ? "الصورة الرئيسية" : "صورة ثانوية"
              }}</span>
              <v-chip v-if="img.isPrimary" color="primary" size="small"
                >رئيسية</v-chip
              >
            </div>
            <div class="d-flex gap-2 flex-wrap">
              <v-btn
                small
                color="info"
                variant="tonal"
                :disabled="img.isPrimary || loadingImageId === img.id"
                :loading="loadingImageId === img.id && !img.isPrimary"
                @click="handleSetPrimary(img.id)"
                style="text-transform: none"
              >
                تعيين رئيسية
              </v-btn>
              <v-btn
                small
                color="error"
                variant="tonal"
                :loading="loadingImageId === img.id"
                @click="handleDelete(img.id)"
                style="text-transform: none"
              >
                حذف
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <template #actions>
      <v-btn
        color="secondary"
        variant="tonal"
        @click="close"
        style="text-transform: none"
      >
        إغلاق
      </v-btn>
    </template>
  </AppModal>
</template>

<style scoped>
.v-card .v-img {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}
</style>
