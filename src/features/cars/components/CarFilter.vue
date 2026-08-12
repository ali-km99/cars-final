<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue";
import { carService } from "../services/car.service";
import type { CarFilter } from "../models/car.model";

const emit = defineEmits<{ "update:filter": [CarFilter] }>();

const filter = reactive<CarFilter>({
  SearchTerm: "",
  Brand: undefined,
  YearFrom: undefined,
  YearTo: undefined,
  PriceFrom: undefined,
  PriceTo: undefined,
  StatusId: undefined,
  BodyType: undefined,
  Transmission: undefined,
  Condition: undefined,
  FuelType: undefined,
  Specs: undefined,
});

const brands = ref<string[]>([]);
const loadingBrands = ref(false);
const showAdvancedFilters = ref(false);

const statusOptions = [
  { title: "جاهزة", value: 1 },
  { title: "تحت الصيانة", value: 2 },
  { title: "قيد الشحن", value: 3 },
  { title: "مباعة", value: 4 },
];

const transmissionOptions = [
  { title: "Automatic", value: "Automatic" },
  { title: "Manual", value: "Manual" },
  { title: "CVT", value: "CVT" },
];

const conditionOptions = [
  { title: "New", value: "New" },
  { title: "Used", value: "Used" },
  { title: "Like New", value: "Like New" },
];

const fuelTypeOptions = [
  { title: "Petrol", value: "Petrol" },
  { title: "Diesel", value: "Diesel" },
  { title: "Hybrid", value: "Hybrid" },
  { title: "Electric", value: "Electric" },
];

const specsOptions = [
  { title: "Korean", value: "Korean" },
  { title: "USA", value: "USA" },
  { title: "Gulf", value: "Gulf" },
  { title: "European", value: "European" },
  { title: "Japanese", value: "Japanese" },
];

const hasActiveFilters = computed(() =>
  Object.entries(filter).some(([key, value]) => {
    if (key === "Page" || key === "PageSize") return false;
    return value !== undefined && value !== "" && value !== null;
  }),
);

function resetFilters() {
  Object.assign(filter, {
    SearchTerm: "",
    Brand: undefined,
    YearFrom: undefined,
    YearTo: undefined,
    PriceFrom: undefined,
    PriceTo: undefined,
    StatusId: undefined,
    BodyType: undefined,
    Transmission: undefined,
    Condition: undefined,
    FuelType: undefined,
    Specs: undefined,
  });
}

let debounceTimer: ReturnType<typeof setTimeout>;
watch(filter, () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => emit("update:filter", { ...filter }), 350);
});

onMounted(async () => {
  loadingBrands.value = true;
  try {
    const { data: envelope } = await carService.getBrands();
    brands.value = Array.isArray(envelope.data) ? envelope.data : [];
  } finally {
    loadingBrands.value = false;
  }
});
</script>

<template>
  <v-card class="app-card pa-4 mb-5">
    <div class="d-flex align-center justify-space-between mb-3">
      <div class="text-sm text-medium-emphasis">
        {{
          hasActiveFilters ? "تم تفعيل بعض الفلاتر" : "ابحث عبر السيارات بسهولة"
        }}
      </div>
      <div class="d-flex align-center gap-2">
        <v-btn
          v-if="hasActiveFilters"
          variant="text"
          size="small"
          color="error"
          prepend-icon="mdi-refresh"
          @click="resetFilters"
        >
        </v-btn>

        <v-btn
          variant="text"
          size="small"
          color="primary"
          prepend-icon="mdi-filter-plus"
          append-icon="mdi-chevron-down"
          @click="showAdvancedFilters = !showAdvancedFilters"
        >
          المزيد
        </v-btn>
      </div>
    </div>

    <v-row dense>
      <v-col cols="12" md="4">
        <v-text-field
          v-model="filter.SearchTerm"
          label="بحث بالاسم أو الماركة"
          prepend-inner-icon="mdi-magnify"
          variant="solo-inverted"
          density="comfortable"
          rounded="lg"
          hide-details
        />
      </v-col>

      <v-col cols="12" md="4">
        <v-select
          v-model="filter.Brand"
          :items="brands"
          label="الماركة"
          prepend-inner-icon="mdi-car-multiple"
          variant="solo-inverted"
          density="comfortable"
          rounded="lg"
          hide-details
          clearable
          :loading="loadingBrands"
          placeholder="اختر ماركة"
        />
      </v-col>

      <v-col cols="12" md="4">
        <v-select
          v-model.number="filter.StatusId"
          :items="statusOptions"
          item-title="title"
          item-value="value"
          label="حالة السيارة"
          prepend-inner-icon="mdi-list-status"
          variant="solo-inverted"
          density="comfortable"
          rounded="lg"
          hide-details
          clearable
        />
      </v-col>

      <v-col cols="6" md="3">
        <v-text-field
          v-model.number="filter.PriceFrom"
          label="من سعر"
          type="number"
          prepend-inner-icon="mdi-cash"
          variant="solo-inverted"
          density="comfortable"
          rounded="lg"
          hide-details
        />
      </v-col>
      <v-col cols="6" md="3">
        <v-text-field
          v-model.number="filter.PriceTo"
          label="إلى سعر"
          type="number"
          prepend-inner-icon="mdi-cash-multiple"
          variant="solo-inverted"
          density="comfortable"
          rounded="lg"
          hide-details
        />
      </v-col>
      <v-col cols="6" md="3">
        <v-text-field
          v-model.number="filter.YearFrom"
          label="من سنة"
          type="number"
          prepend-inner-icon="mdi-calendar-start"
          variant="solo-inverted"
          density="comfortable"
          rounded="lg"
          hide-details
        />
      </v-col>
      <v-col cols="6" md="3">
        <v-text-field
          v-model.number="filter.YearTo"
          label="إلى سنة"
          type="number"
          prepend-inner-icon="mdi-calendar-end"
          variant="solo-inverted"
          density="comfortable"
          rounded="lg"
          hide-details
        />
      </v-col>
    </v-row>

    <v-expand-transition>
      <v-row v-if="showAdvancedFilters" dense class="mt-2">
        <v-col cols="12" md="4">
          <v-select
            v-model="filter.BodyType"
            :items="['سيدان', 'SUV', 'هاتشباك', 'كوبيه', 'بيك أب']"
            label="نوع الهيكل"
            prepend-inner-icon="mdi-car-sports"
            variant="solo-inverted"
            density="comfortable"
            rounded="lg"
            hide-details
            clearable
          />
        </v-col>

        <v-col cols="12" md="4">
          <v-select
            v-model="filter.Transmission"
            :items="transmissionOptions"
            item-title="title"
            item-value="value"
            label="ناقل الحركة"
            prepend-inner-icon="mdi-car-shift-pattern"
            variant="solo-inverted"
            density="comfortable"
            rounded="lg"
            hide-details
            clearable
          />
        </v-col>

        <v-col cols="12" md="4">
          <v-select
            v-model="filter.Condition"
            :items="conditionOptions"
            item-title="title"
            item-value="value"
            label="حالة الاستخدام"
            prepend-inner-icon="mdi-star-check-outline"
            variant="solo-inverted"
            density="comfortable"
            rounded="lg"
            hide-details
            clearable
          />
        </v-col>

        <v-col cols="12" md="4">
          <v-select
            v-model="filter.FuelType"
            :items="fuelTypeOptions"
            item-title="title"
            item-value="value"
            label="نوع الوقود"
            prepend-inner-icon="mdi-gas-station"
            variant="solo-inverted"
            density="comfortable"
            rounded="lg"
            hide-details
            clearable
          />
        </v-col>

        <v-col cols="12" md="4">
          <v-select
            v-model="filter.Specs"
            :items="specsOptions"
            item-title="title"
            item-value="value"
            label="المواصفات / الاستيراد"
            prepend-inner-icon="mdi-earth"
            variant="solo-inverted"
            density="comfortable"
            rounded="lg"
            hide-details
            clearable
          />
        </v-col>
      </v-row>
    </v-expand-transition>
  </v-card>
</template>
