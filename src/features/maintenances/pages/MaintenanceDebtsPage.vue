<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useMaintenanceDebtStore } from "../store/maintenance-debt.store";
import { useMaintenanceCenterStore } from "../store/maintenance-center.store";
import MaintenancePaymentModal from "../components/MaintenancePaymentModal.vue";
import { usePaymentStatus } from "../composables/usePaymentStatus";
import { formatCurrency, formatDate } from "@/core/utils/formatters";
import type {
  MaintenanceDebtFilter,
  MaintenanceDebtItemDto,
} from "../models/maintenance-debt.model";

const router = useRouter();
const debtStore = useMaintenanceDebtStore();
const centerStore = useMaintenanceCenterStore();
const { getStatusMeta } = usePaymentStatus();

const filter = reactive<MaintenanceDebtFilter>({
  centerId: undefined,
  carId: undefined,
  status: undefined,
  dateFrom: undefined,
  dateTo: undefined,
});

const statusOptions = [
  { title: "الكل", value: undefined },
  { title: "غير مدفوع", value: "Unpaid" },
  { title: "مدفوع جزئياً", value: "PartiallyPaid" },
  { title: "مدفوع بالكامل", value: "Paid" },
];

const centerOptions = computed(() =>
  centerStore.centers.map((c) => ({ value: c.id, title: c.name })),
);

function applyFilters() {
  debtStore.fetchReport({ ...filter });
}

function resetFilters() {
  filter.centerId = undefined;
  filter.carId = undefined;
  filter.status = undefined;
  filter.dateFrom = undefined;
  filter.dateTo = undefined;
  applyFilters();
}

onMounted(() => {
  centerStore.fetchCenters();
  debtStore.fetchReport();
});

const paymentModalOpen = ref(false);
const selectedItem = ref<MaintenanceDebtItemDto | null>(null);

function openPayment(item: MaintenanceDebtItemDto) {
  selectedItem.value = item;
  paymentModalOpen.value = true;
}

async function handlePaid() {
  await debtStore.fetchReport({ ...filter });
}

function goToDetails(item: MaintenanceDebtItemDto) {
  router.push(`/cars/${item.carId}`);
}

const headers = [
  { title: "السيارة", key: "carLabel" },
  { title: "المركز", key: "centerName" },
  { title: "الوصف", key: "issueDescription" },
  { title: "التكلفة", key: "repairCost" },
  { title: "المدفوع", key: "totalPaid" },
  { title: "المتبقي", key: "remainingAmount" },
  { title: "الحالة", key: "paymentStatus" },
  { title: "التاريخ", key: "createdAt" },
  { title: "إجراءات", key: "actions", sortable: false },
];
</script>

<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6 flex-wrap ga-3">
      <div class="d-flex flex-column">
        <span class="font-weight-bold text-2xl">كشف ديون الصيانة</span>
        <span class="text-sm text-medium-emphasis">
          تقرير شامل لكل عمليات الصيانة غير المسددة بالكامل
        </span>
      </div>
    </div>

    <!-- الفلاتر -->
    <v-card class="app-card pa-4 mb-5">
      <v-row dense>
        <v-col cols="12" sm="6" md="3">
          <v-select
            v-model="filter.centerId"
            :items="centerOptions"
            item-title="title"
            item-value="value"
            label="مركز الصيانة"
            variant="outlined"
            density="comfortable"
            rounded="lg"
            hide-details
            clearable
            :loading="centerStore.loading"
          />
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-select
            v-model="filter.status"
            :items="statusOptions"
            item-title="title"
            item-value="value"
            label="حالة الدفع"
            variant="outlined"
            density="comfortable"
            rounded="lg"
            hide-details
          />
        </v-col>
        <v-col cols="6" md="3">
          <v-text-field
            v-model="filter.dateFrom"
            label="من تاريخ"
            type="date"
            variant="outlined"
            density="comfortable"
            rounded="lg"
            hide-details
          />
        </v-col>
        <v-col cols="6" md="3">
          <v-text-field
            v-model="filter.dateTo"
            label="إلى تاريخ"
            type="date"
            variant="outlined"
            density="comfortable"
            rounded="lg"
            hide-details
          />
        </v-col>
      </v-row>
      <div class="d-flex justify-end ga-2 mt-3">
        <v-btn
          variant="text"
          size="small"
          color="error"
          prepend-icon="mdi-refresh"
          @click="resetFilters"
        >
          إعادة تعيين
        </v-btn>
        <v-btn
          color="accent"
          size="small"
          style="text-transform: none; font-weight: 600"
          @click="applyFilters"
        >
          تطبيق الفلاتر
        </v-btn>
      </div>
    </v-card>

    <!-- بطاقات الملخص -->
    <v-row v-if="debtStore.report" class="mb-5">
      <v-col cols="6" md="3">
        <v-card class="app-card pa-4">
          <span class="text-caption text-medium-emphasis">إجمالي التكلفة</span>
          <div class="text-h6 font-weight-bold mt-1">
            {{ formatCurrency(debtStore.report.totalRepairCost) }}
          </div>
        </v-card>
      </v-col>
      <v-col cols="6" md="3">
        <v-card class="app-card pa-4">
          <span class="text-caption text-medium-emphasis">إجمالي المدفوع</span>
          <div class="text-h6 font-weight-bold text-success mt-1">
            {{ formatCurrency(debtStore.report.totalPaid) }}
          </div>
        </v-card>
      </v-col>
      <v-col cols="6" md="3">
        <v-card class="app-card pa-4">
          <span class="text-caption text-medium-emphasis">إجمالي الدين</span>
          <div class="text-h6 font-weight-bold text-error mt-1">
            {{ formatCurrency(debtStore.report.totalDebt) }}
          </div>
        </v-card>
      </v-col>
      <v-col cols="6" md="3">
        <v-card class="app-card pa-4">
          <span class="text-caption text-medium-emphasis">عدد العمليات</span>
          <div class="d-flex ga-1 mt-2 flex-wrap">
            <v-chip size="x-small" color="error" variant="tonal"
              >{{ debtStore.report.unpaidCount }} غير مدفوع</v-chip
            >
            <v-chip size="x-small" color="warning" variant="tonal"
              >{{ debtStore.report.partiallyPaidCount }} جزئي</v-chip
            >
            <v-chip size="x-small" color="success" variant="tonal"
              >{{ debtStore.report.paidCount }} مدفوع</v-chip
            >
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- الجدول -->
    <v-card class="app-card" no-padding>
      <v-data-table
        :headers="headers"
        :items="debtStore.report?.items || []"
        :loading="debtStore.loading"
        item-value="maintenanceId"
        no-data-text="لا توجد نتائج مطابقة"
      >
        <template #item.repairCost="{ item }">{{
          formatCurrency(item.repairCost)
        }}</template>
        <template #item.totalPaid="{ item }">{{
          formatCurrency(item.totalPaid)
        }}</template>
        <template #item.remainingAmount="{ item }">
          <span class="font-weight-bold text-error">{{
            formatCurrency(item.remainingAmount)
          }}</span>
        </template>
        <template #item.paymentStatus="{ item }">
          <v-chip
            :color="getStatusMeta(item.paymentStatus).color"
            size="small"
            variant="tonal"
          >
            <v-icon
              :icon="getStatusMeta(item.paymentStatus).icon"
              size="14"
              start
            />
            {{ getStatusMeta(item.paymentStatus).label }}
          </v-chip>
        </template>
        <template #item.createdAt="{ item }">{{
          formatDate(item.createdAt)
        }}</template>
        <template #item.actions="{ item }">
          <div class="d-flex ga-1">
            <v-btn
              v-if="item.paymentStatus !== 'Paid'"
              icon="mdi-cash-plus"
              size="small"
              variant="text"
              color="success"
              title="تسجيل دفعة"
              @click="openPayment(item)"
            />
            <v-btn
              icon="mdi-eye-outline"
              size="small"
              variant="text"
              color="primary"
              title="عرض تفاصيل السيارة"
              @click="goToDetails(item)"
            />
          </div>
        </template>
      </v-data-table>
    </v-card>

    <MaintenancePaymentModal
      v-model="paymentModalOpen"
      :maintenance-id="selectedItem?.maintenanceId ?? null"
      :remaining-amount="selectedItem?.remainingAmount ?? 0"
      @paid="handlePaid"
    />
  </div>
</template>
