<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useMaintenanceCenterStore } from "../store/maintenance-center.store";
import { formatCurrency } from "@/core/utils/formatters";

const route = useRoute();
const router = useRouter();
const centerStore = useMaintenanceCenterStore();

const centerId = computed(() => Number(route.params.id));

onMounted(() => centerStore.fetchCenterDebts(centerId.value));

const debt = computed(() => centerStore.currentCenterDebt);

const headers = [
  { title: "السيارة", key: "carLabel" },
  { title: "الدين", key: "debt" },
];
</script>

<template>
  <div>
    <div class="d-flex align-center ga-3 mb-6">
      <v-btn
        icon="mdi-arrow-right"
        variant="text"
        @click="router.push('/maintenance-centers')"
      />
      <div class="d-flex flex-column">
        <span class="font-weight-bold text-2xl">
          ديون مركز: {{ debt?.centerName || "..." }}
        </span>
        <span class="text-sm text-medium-emphasis">تقرير الديون التفصيلي</span>
      </div>
    </div>

    <div v-if="centerStore.loadingDebt">
      <v-row>
        <v-col v-for="n in 3" :key="n" cols="12" sm="4">
          <v-skeleton-loader type="card" class="rounded-xl" />
        </v-col>
      </v-row>
    </div>

    <template v-else-if="debt">
      <v-row class="mb-5">
        <v-col cols="12" sm="4">
          <v-card class="app-card pa-4">
            <span class="text-caption text-medium-emphasis"
              >إجمالي التكلفة</span
            >
            <div class="text-h6 font-weight-bold mt-1">
              {{ formatCurrency(debt.totalRepairCost) }}
            </div>
          </v-card>
        </v-col>
        <v-col cols="12" sm="4">
          <v-card class="app-card pa-4">
            <span class="text-caption text-medium-emphasis"
              >إجمالي المدفوع</span
            >
            <div class="text-h6 font-weight-bold text-success mt-1">
              {{ formatCurrency(debt.totalPaid) }}
            </div>
          </v-card>
        </v-col>
        <v-col cols="12" sm="4">
          <v-card class="app-card pa-4">
            <span class="text-caption text-medium-emphasis">إجمالي الدين</span>
            <div class="text-h6 font-weight-bold text-error mt-1">
              {{ formatCurrency(debt.totalDebt) }}
            </div>
          </v-card>
        </v-col>
      </v-row>

      <div class="d-flex ga-2 mb-5">
        <v-chip color="error" variant="tonal"
          >غير مدفوع: {{ debt.unpaidCount }}</v-chip
        >
        <v-chip color="warning" variant="tonal">
          مدفوع جزئياً: {{ debt.partiallyPaidCount }}
        </v-chip>
        <v-chip color="success" variant="tonal"
          >مدفوع بالكامل: {{ debt.paidCount }}</v-chip
        >
      </div>

      <v-card class="app-card" no-padding>
        <v-data-table
          :headers="headers"
          :items="debt.cars"
          item-value="carId"
          no-data-text="لا توجد ديون على هذا المركز"
        >
          <template #item.debt="{ item }">
            <span class="font-weight-bold text-error">
              {{ formatCurrency(item.debt) }}
            </span>
          </template>
        </v-data-table>
      </v-card>
    </template>
  </div>
</template>
