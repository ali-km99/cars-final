<script setup lang="ts">
import { onMounted, computed, ref } from "vue";
import { useTransactionStore } from "../store/transaction.store";
import { formatCurrency, formatDate } from "@/core/utils/formatters";

const transactionStore = useTransactionStore();

onMounted(() => transactionStore.fetchTransactions());

// Filter state
const filterType = ref<string | null>(null); // 'Income' | 'Expense' | null
const filterRelated = ref<string | null>(null);
const filterDescription = ref<string>("");
const dateFrom = ref<string | null>(null);
const dateTo = ref<string | null>(null);

// UI States
const showAdvancedFilters = ref(false);
const menuFrom = ref(false);
const menuTo = ref(false);

// Derived list of related entities
const relatedOptions = computed(() => {
  const set = new Set<string>();
  transactionStore.transactions.forEach((t: any) => {
    if (t.relatedEntity) set.add(t.relatedEntity);
  });
  return Array.from(set);
});

// Filtered transactions
const filteredTransactions = computed(() => {
  return transactionStore.transactions.filter((t: any) => {
    if (filterType.value && t.type !== filterType.value) return false;
    if (filterRelated.value && t.relatedEntity !== filterRelated.value)
      return false;
    if (filterDescription.value) {
      const needle = filterDescription.value.trim().toLowerCase();
      if (needle && !(t.description || "").toLowerCase().includes(needle))
        return false;
    }
    if (dateFrom.value) {
      const from = new Date(dateFrom.value).setHours(0, 0, 0, 0);
      const itemDate = new Date(t.date).setHours(0, 0, 0, 0);
      if (isNaN(itemDate) || itemDate < from) return false;
    }
    if (dateTo.value) {
      const to = new Date(dateTo.value).setHours(23, 59, 59, 999);
      const itemDate = new Date(t.date).getTime();
      if (isNaN(itemDate) || itemDate > to) return false;
    }
    return true;
  });
});

// Active filters count indicator
const activeFiltersCount = computed(() => {
  let count = 0;
  if (filterType.value) count++;
  if (filterRelated.value) count++;
  if (filterDescription.value) count++;
  if (dateFrom.value) count++;
  if (dateTo.value) count++;
  return count;
});

// Financial totals
const totalIncome = computed(() =>
  filteredTransactions.value
    .filter((t: any) => t.type === "Income")
    .reduce((s: number, t: any) => s + t.amount, 0),
);
const totalExpense = computed(() =>
  filteredTransactions.value
    .filter((t: any) => t.type === "Expense")
    .reduce((s: number, t: any) => s + t.amount, 0),
);
const net = computed(() => totalIncome.value - totalExpense.value);

function clearFilters() {
  filterType.value = null;
  filterRelated.value = null;
  filterDescription.value = "";
  dateFrom.value = null;
  dateTo.value = null;
}

function printReport() {
  window.print();
}

function getEntityLabel(entity: string) {
  switch (entity) {
    case "Maintenance":
      return "صيانة";
    case "Sale":
      return "بيع";
    case "Car":
      return "شراء سيارة";
    case "Expense":
      return "مصروفات";
    default:
      return entity;
  }
}

function getEntityColor(entity: string) {
  switch (entity) {
    case "Maintenance":
      return "warning";
    case "Sale":
      return "teal";
    case "Car":
      return "info";
    case "Expense":
      return "#D3AF37";
    default:
      return "grey";
  }
}

function getEntityIcon(entity: string) {
  switch (entity) {
    case "Maintenance":
      return "mdi-wrench";
    case "Sale":
      return "mdi-cash-plus";
    case "Car":
      return "mdi-car";
    case "Expense":
      return "mdi-cash-minus";
    default:
      return "mdi-help-circle";
  }
}

const headers = [
  { title: "النوع", key: "type", align: "start" },
  { title: "الوصف", key: "description", align: "start" },
  { title: "القيد", key: "relatedEntity", align: "center" },
  { title: "المبلغ", key: "amount", align: "end" },
  { title: "التاريخ", key: "date", align: "end" },
] as const;
</script>

<template>
  <div class="transactions-page">
    <!-- Header Section -->
    <div
      class="d-flex flex-wrap justify-space-between align-center ga-4 mb-6 print-hide"
    >
      <div>
        <h1 class="text-2xl font-weight-bold mb-1">العمليات المالية</h1>
        <p class="text-sm text-medium-emphasis mb-0">
          سجل وشاشة تفاصيل كافة الإيرادات والمصروفات الحالية
        </p>
      </div>

      <!-- Actions (Print & Actions) -->
      <div class="d-flex align-center ga-2">
        <v-btn
          color="primary"
          variant="flat"
          prepend-icon="mdi-printer"
          rounded="lg"
          @click="printReport"
        >
          طباعة التقرير
        </v-btn>
      </div>
    </div>

    <!-- Printable Report Header (Appears ONLY in Print Mode) -->
    <div class="print-only mb-6">
      <div class="d-flex justify-space-between align-center border-b pb-4 mb-4">
        <div>
          <h2 class="text-xl font-weight-bold">تقرير العمليات المالية</h2>
          <p class="text-caption text-grey">
            تاريخ الاستخراج: {{ formatDate(new Date().toISOString()) }}
          </p>
        </div>
        <div class="text-left">
          <div class="text-subtitle-2 font-weight-bold">
            إجمالي النتائج: {{ filteredTransactions.length }} عملية
          </div>
        </div>
      </div>
    </div>

    <!-- Smart Filter Bar -->
    <v-card class="app-card mb-6 pa-4 print-hide" rounded="lg" elevation="0">
      <div class="d-flex flex-wrap align-center ga-3">
        <!-- Quick Search -->
        <v-text-field
          v-model="filterDescription"
          placeholder="بحث بالوصف..."
          prepend-inner-icon="mdi-magnify"
          density="compact"
          variant="outlined"
          hide-details
          clearable
          class="flex-grow-1 min-w-[200px]"
        />

        <!-- Type Quick Select -->
        <v-select
          v-model="filterType"
          :items="[
            { label: 'الكل', value: null },
            { label: 'دخل', value: 'Income' },
            { label: 'مصروف', value: 'Expense' },
          ]"
          item-title="label"
          item-value="value"
          density="compact"
          variant="outlined"
          hide-details
          placeholder="نوع العملية"
          style="max-width: 140px"
        />

        <!-- Toggle Advanced Filters Button -->
        <v-btn
          variant="tonal"
          color="accent"
          density="comfortable"
          rounded="lg"
          @click="showAdvancedFilters = !showAdvancedFilters"
        >
          <v-icon icon="mdi-filter-variant" class="me-1" />
          فلاتر إضافية
          <v-badge
            v-if="activeFiltersCount > 0"
            :content="activeFiltersCount"
            color="error"
            inline
            class="ms-1"
          />
          <v-icon
            :icon="showAdvancedFilters ? 'mdi-chevron-up' : 'mdi-chevron-down'"
            class="ms-1"
          />
        </v-btn>

        <!-- Clear Filters Button -->
        <v-btn
          v-if="activeFiltersCount > 0"
          variant="text"
          color="grey"
          density="comfortable"
          icon="mdi-filter-off-outline"
          title="مسح الكل"
          @click="clearFilters"
        />
      </div>

      <!-- Advanced Expandable Filters Panel -->
      <v-expand-transition>
        <div v-show="showAdvancedFilters" class="pt-4 mt-4 border-t">
          <v-row dense>
            <!-- Related Entity Filter -->
            <v-col cols="12" sm="4">
              <v-select
                v-model="filterRelated"
                :items="relatedOptions"
                label="نوع القيد"
                density="compact"
                variant="outlined"
                clearable
                hide-details
              >
                <template #item="{ item, props }">
                  <v-list-item
                    v-bind="props"
                    :title="getEntityLabel(item.value)"
                  />
                </template>
                <template #selection="{ item }">
                  {{ getEntityLabel(item.value) }}
                </template>
              </v-select>
            </v-col>

            <!-- Date From Filter -->
            <v-col cols="12" sm="4">
              <v-menu v-model="menuFrom" :close-on-content-click="false">
                <template #activator="{ props }">
                  <v-text-field
                    v-bind="props"
                    v-model="dateFrom"
                    label="من تاريخ"
                    prepend-inner-icon="mdi-calendar-start"
                    density="compact"
                    variant="outlined"
                    readonly
                    clearable
                    hide-details
                    @click:clear="dateFrom = null"
                  />
                </template>
                <v-date-picker v-model="dateFrom" @input="menuFrom = false" />
              </v-menu>
            </v-col>

            <!-- Date To Filter -->
            <v-col cols="12" sm="4">
              <v-menu v-model="menuTo" :close-on-content-click="false">
                <template #activator="{ props }">
                  <v-text-field
                    v-bind="props"
                    v-model="dateTo"
                    label="إلى تاريخ"
                    prepend-inner-icon="mdi-calendar-end"
                    density="compact"
                    variant="outlined"
                    readonly
                    clearable
                    hide-details
                    @click:clear="dateTo = null"
                  />
                </template>
                <v-date-picker v-model="dateTo" @input="menuTo = false" />
              </v-menu>
            </v-col>
          </v-row>
        </div>
      </v-expand-transition>
    </v-card>

    <!-- Summary Metrics Cards -->
    <v-row class="mb-6">
      <v-col cols="12" sm="4">
        <v-card class="app-card pa-4" elevation="0" rounded="lg">
          <div class="d-flex justify-space-between align-center">
            <span class="text-lg text-medium-emphasis">إجمالي الدخل</span>
            <v-avatar color="success" variant="tonal" size="32">
              <v-icon icon="mdi-arrow-bottom-left" size="18" />
            </v-avatar>
          </div>
          <div class="text-lg font-weight-bold text-success mt-2">
            {{ formatCurrency(totalIncome) }}
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="4">
        <v-card class="app-card pa-4" elevation="0" rounded="lg">
          <div class="d-flex justify-space-between align-center">
            <span class="text-lg text-medium-emphasis text-nowrap"
              >إجمالي المصروفات</span
            >
            <v-avatar color="error" variant="tonal" size="32">
              <v-icon icon="mdi-arrow-top-right" size="18" />
            </v-avatar>
          </div>
          <div class="text-lg font-weight-bold text-error mt-2">
            {{ formatCurrency(totalExpense) }}
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="4">
        <v-card class="app-card pa-4" elevation="0" rounded="lg">
          <div class="d-flex justify-space-between align-center">
            <span class="text-lg text-medium-emphasis">صافي الربح</span>
            <v-avatar color="warning" variant="tonal" size="32">
              <v-icon icon="mdi-scale-balance" size="18" />
            </v-avatar>
          </div>
          <div class="text-lg font-weight-bold text-gold mt-2">
            {{ formatCurrency(net) }}
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Data Table Card -->
    <v-card class="app-card border rounded-lg overflow-hidden" elevation="0">
      <v-data-table
        :headers="headers"
        :items="filteredTransactions"
        :loading="transactionStore.loading"
        no-data-text="لا توجد عمليات مالية مطابقة للفلاتر"
        hover
      >
        <!-- Type Column -->
        <template #item.type="{ item }">
          <v-chip
            :color="item.type === 'Income' ? 'success' : 'error'"
            size="small"
            variant="tonal"
            class="font-weight-medium"
          >
            {{ item.type === "Income" ? "دخل" : "مصروف" }}
          </v-chip>
        </template>

        <!-- Related Entity Column -->
        <template #item.relatedEntity="{ item }">
          <v-chip
            :color="getEntityColor(item.relatedEntity)"
            size="small"
            variant="tonal"
            :prepend-icon="getEntityIcon(item.relatedEntity)"
          >
            {{ getEntityLabel(item.relatedEntity) }}
          </v-chip>
        </template>

        <!-- Amount Column -->
        <template #item.amount="{ item }">
          <span
            :class="item.type === 'Income' ? 'text-success' : 'text-error'"
            class="font-weight-bold"
          >
            {{ formatCurrency(item.amount) }}
          </span>
        </template>

        <!-- Date Column -->
        <template #item.date="{ item }">
          <span class="text-body-2 dir-ltr d-inline-block">
            {{ formatDate(item.date) }}
          </span>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<style scoped>
/* Hidden by default in normal view */
.print-only {
  display: none;
}

/* ==========================================
   Print Stylesheet (Media Print Rules)
   ========================================== */
@media print {
  /* 1. Hide Global System Elements (Navbar, Sidebar, Footers, Actions) */
  :global(nav),
  :global(aside),
  :global(.v-navigation-drawer),
  :global(.v-app-bar),
  :global(.v-footer),
  .print-hide,
  :deep(.v-pagination),
  :deep(.v-data-table-footer) {
    display: none !important;
  }

  /* 2. Show Only Printable Header */
  .print-only {
    display: block !important;
  }

  /* 3. Reset Layout Margins & Padding from Parent Containers */
  :global(html),
  :global(body),
  :global(#app),
  :global(.v-application),
  :global(.v-main) {
    background: white !important;
    color: black !important;
    margin: 0 !important;
    padding: 0 !important;
    width: 100% !important;
    height: auto !important;
    overflow: visible !important;
  }

  /* 4. Page Content Spacing Optimization */
  .transactions-page {
    padding: 10mm !important;
    margin: 0 !important;
    width: 100% !important;
  }

  /* 5. Clean Table Formatting for Paper */
  :deep(.v-table) {
    background: transparent !important;
    border: 1px solid #ccc !important;
    width: 100% !important;
  }

  :deep(th) {
    background-color: #f1f3f5 !important;
    color: #000 !important;
    font-weight: bold !important;
    border-bottom: 2px solid #000 !important;
  }

  :deep(td) {
    border-bottom: 1px solid #ddd !important;
    font-size: 12px !important;
  }

  .app-card {
    border: 1px solid #ddd !important;
    box-shadow: none !important;
    background: white !important;
  }
}
</style>
