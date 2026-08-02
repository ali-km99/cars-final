<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import type { CarImage, CarListItem } from "../models/car.model";
import { useCarStatus } from "../composables/useCarStatus";
import { formatCurrency, resolveImageUrl } from "@/core/utils/formatters";

const props = defineProps<{ car: CarListItem & { images?: CarImage[] } }>();
const router = useRouter();
const { getStatusMeta } = useCarStatus();

const statusMeta = computed(() => getStatusMeta(props.car.statusName || ""));
const primaryImage = computed(() => {
  const fallbackImage =
    props.car.images?.find((img: CarImage) => img.isPrimary)?.imageUrl ||
    props.car.images?.[0]?.imageUrl;

  return (
    resolveImageUrl(props.car.primaryImageUrl) || resolveImageUrl(fallbackImage)
  );
});
</script>

<template>
  <v-card
    class="cursor-pointer rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    elevation="0"
    @click="router.push(`/cars/${car.id}`)"
  >
    <!-- ───────── الصورة ───────── -->
    <div class="relative">
      <v-img
        v-if="primaryImage"
        :src="primaryImage"
        height="190"
        cover
        class="w-full"
      />

      <div
        v-else
        class="h-[190px] flex items-center justify-center bg-gray-100"
      >
        <v-icon icon="mdi-car" size="60" class="text-gray-400" />
      </div>

      <!-- الحالة -->
      <v-chip
        :color="statusMeta.color"
        size="small"
        class="!absolute top-2 left-2 font-bold"
        variant="flat"
      >
        {{ statusMeta.label }}
      </v-chip>

      <!-- السنة -->
      <v-chip
        size="x-small"
        class="!absolute top-2 right-2 bg-black text-white font-bold"
        variant="flat"
      >
        {{ car.year }}
      </v-chip>
    </div>

    <!-- ───────── المحتوى ───────── -->
    <div class="p-4">
      <!-- الاسم -->
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-[17px] font-bold">{{ car.brand }} {{ car.model }}</h3>
      </div>

      <!-- المواصفات -->
      <div class="grid grid-cols-2 gap-2 mb-3 text-sm text-gray-600">
        <div class="flex items-center gap-1">
          <v-icon icon="mdi-palette" size="16" />
          <span>{{ car.exteriorColor }}</span>
        </div>

        <div class="flex items-center gap-1">
          <v-icon icon="mdi-car-estate" size="16" />
          <span>{{ car.bodyType }}</span>
        </div>

        <div class="flex items-center gap-1">
          <v-icon icon="mdi-shield-check" size="16" />
          <span>{{ car.condition }}</span>
        </div>

        <div class="flex items-center gap-1">
          <v-icon icon="mdi-speedometer" size="16" />
          <span>{{ car.mileage }} {{ car.mileageUnit }}</span>
        </div>
      </div>

      <v-divider class="mb-3" />

      <!-- السعر -->
      <div class="flex items-center justify-between">
        <span class="text-sm text-gray-400">السعر</span>
        <span class="text-[16px] font-bold text-yellow-600">
          {{ formatCurrency(car.sellingPrice) }}
        </span>
      </div>
    </div>
  </v-card>
</template>

<style scoped>
.car-card {
  transition: transform 0.2s ease;
}
.car-card:hover {
  transform: translateY(-4px);
}
.car-image-wrapper {
  position: relative;
}
.car-image-placeholder {
  background-color: rgba(108, 117, 125, 0.08);
}
.status-chip {
  position: absolute;
  top: 12px;
  inset-inline-start: 12px;
}
</style>
