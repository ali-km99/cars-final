<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import {
  dashboardService,
  type DashboardStats,
} from "../services/dashboard.service";
import { useUiStore } from "@/core/store/ui.store";
import { formatCurrency, formatDate } from "@/core/utils/formatters";

// ─────────────────────────────────────────────────────────────
// Stores & Router
// ─────────────────────────────────────────────────────────────
const router = useRouter();
const uiStore = useUiStore();

// ─────────────────────────────────────────────────────────────
// Dashboard data
// ─────────────────────────────────────────────────────────────
const loading = ref(true);
const stats = ref<DashboardStats>({
  totalCars: 0,
  availableCars: 0,
  soldCars: 0,
  inMaintenanceCars: 0,
  inShipping: 0,
  totalRevenue: 0,
  totalProfit: 0,
  totalMaintenanceCost: 0,
  monthlySales: [],
  recentSales: [],
});

// ─────────────────────────────────────────────────────────────
// Fleet donut chart (ApexCharts)
// ─────────────────────────────────────────────────────────────
const isDark = computed(() => uiStore.isDark);

const donutSeries = computed(() => [
  stats.value.availableCars,
  stats.value.inShipping,
  stats.value.inMaintenanceCars,
]);

const donutOptions = computed(() => ({
  chart: {
    type: "donut",
    background: "transparent",
    animations: { enabled: true, speed: 600 },
  },
  labels: ["جاهزة للبيع", "قيد الشحن", "في الصيانة"],
  colors: ["#2E7D32", "#D4AF37", "#ED6C02"],
  legend: {
    position: "bottom",
    labels: { colors: isDark.value ? "#fff" : "#0D1B2A" },
    fontFamily: "Cairo, sans-serif",
  },
  dataLabels: {
    enabled: true,
    style: { fontFamily: "Cairo, sans-serif", fontSize: "13px" },
    dropShadow: { enabled: false },
  },
  plotOptions: {
    pie: {
      donut: {
        size: "68%",
        labels: {
          show: true,
          total: {
            show: true,
            label: "إجمالي",
            color: isDark.value ? "#fff" : "#0D1B2A",
            fontFamily: "Cairo, sans-serif",
            fontSize: "14px",
            formatter: () => String(stats.value.totalCars),
          },
        },
      },
    },
  },
  stroke: { width: 2, colors: [isDark.value ? "#1B263B" : "#fff"] },
  tooltip: {
    style: { fontFamily: "Cairo, sans-serif" },
    y: { formatter: (v: number) => `${v} سيارة` },
  },
  theme: { mode: isDark.value ? "dark" : "light" },
}));

// ─────────────────────────────────────────────────────────────
// Monthly revenue bar chart
// ─────────────────────────────────────────────────────────────
const barSeries = computed(() => [
  {
    name: "الإيرادات",
    type: "column", // 👈 أعمدة
    data: stats.value.monthlySales.map((m) => m.revenue),
  },
  {
    name: "عدد المبيعات",
    type: "line", // 👈 خط
    data: stats.value.monthlySales.map((m) => m.count),
  },
]);
const barOptions = computed(() => ({
  chart: {
    type: "line", // مهم في combo
    background: "transparent",
    toolbar: { show: false },
    fontFamily: "Cairo, sans-serif",
  },

  colors: ["#D4AF37", "#0288D1"],

  stroke: {
    width: [0, 3], // 👈 الأعمدة بدون stroke، الخط واضح
    curve: "smooth",
  },

  plotOptions: {
    bar: {
      borderRadius: 6,
      columnWidth: "45%",
    },
  },

  dataLabels: { enabled: false },

  xaxis: {
    categories: stats.value.monthlySales.map((m) => {
      const [y, mo] = m.month.split("-");
      return new Date(Number(y), Number(mo) - 1).toLocaleDateString("ar-EG", {
        month: "short",
        year: "2-digit",
      });
    }),
  },

  // 🔥 محورين مختلفين
  yaxis: [
    {
      title: { text: "الإيرادات" },
      labels: {
        formatter: (v: number) => formatCurrency(v),
      },
    },
    {
      opposite: true,
      title: { text: "عدد المبيعات" },
      labels: {
        formatter: (v: number) => Math.round(v).toString(),
      },
    },
  ],

  tooltip: {
    shared: true,
    intersect: false,
    y: [
      {
        formatter: (v: number) => formatCurrency(v),
      },
      {
        formatter: (v: number) => `${v} عملية بيع`,
      },
    ],
  },

  markers: {
    size: 4, // 👈 نقاط على الخط
  },

  legend: {
    labels: { colors: isDark.value ? "#fff" : "#0D1B2A" },
  },

  grid: {
    borderColor: isDark.value ? "#28344a" : "#e6e9ee",
  },

  theme: {
    mode: isDark.value ? "dark" : "light",
  },
}));

// ─────────────────────────────────────────────────────────────
// Financial stat cards
// ─────────────────────────────────────────────────────────────
const financialCards = computed(() => [
  {
    label: "صافي الأرباح",
    value: formatCurrency(stats.value.totalProfit),
    icon: "mdi-trending-up",
    color: stats.value.totalProfit >= 0 ? "success" : "error",
    tooltip: "الفرق بين إجمالي الإيرادات وتكاليف الشراء والصيانة",
  },
  {
    label: "إجمالي الإيرادات",
    value: formatCurrency(stats.value.totalRevenue),
    icon: "mdi-cash-multiple",
    color: "accent",
    tooltip: "مجموع مبالغ جميع عمليات البيع المنجزة",
  },
  {
    label: "تكاليف الصيانة",
    value: formatCurrency(stats.value.totalMaintenanceCost),
    icon: "mdi-wrench-clock",
    color: "warning",
    tooltip: "إجمالي ما أُنفق على صيانة السيارات حتى الآن",
  },
]);

// ─────────────────────────────────────────────────────────────
// Fleet status cards
// ─────────────────────────────────────────────────────────────
const fleetCards = computed(() => [
  {
    label: "جاهزة للبيع",
    value: stats.value.availableCars,
    icon: "mdi-car-key",
    color: "success",
    bgClass: "fleet-ready",
    tooltip: "السيارات المتاحة وجاهزة للبيع فوراً",
  },
  {
    label: "مباعة",
    value: stats.value.soldCars,
    icon: "mdi-tag-check",
    color: "accent",
    bgClass: "fleet-sold",
    tooltip: "إجمالي السيارات التي تم بيعها",
  },
  {
    label: "في الصيانة",
    value: stats.value.inMaintenanceCars,
    icon: "mdi-car-wrench",
    color: "warning",
    bgClass: "fleet-maintenance",
    tooltip: "السيارات التي تخضع حالياً للصيانة",
  },
  {
    label: "إجمالي الأسطول",
    value: stats.value.totalCars,
    icon: "mdi-car-multiple",
    color: "primary",
    bgClass: "fleet-total",
    tooltip: "العدد الإجمالي لجميع السيارات في المعرض",
  },
]);

// ─────────────────────────────────────────────────────────────
// Quick actions definition
// ─────────────────────────────────────────────────────────────
const quickActions = [
  {
    label: "إضافة سيارة",
    icon: "mdi-car",
    color: "accent",
    tooltip: "إضافة سيارة جديدة إلى المخزون",
    action: () => router.push("/cars/add"),
  },
  {
    label: "تسجيل بيع",
    icon: "mdi-cash-register",
    color: "success",
    tooltip: "تسجيل عملية بيع سيارة لعميل",
    action: () => router.push("/sales"),
  },
  {
    label: "إضافة صيانة",
    icon: "mdi-car-cog",
    color: "warning",
    tooltip: "تسجيل عملية صيانة لإحدى السيارات",
    action: () => router.push("/maintenances"),
  },
  {
    label: "إضافة عميل",
    icon: "mdi-account-plus",
    color: "info",
    tooltip: "إضافة عميل جديد إلى قاعدة البيانات",
    action: () => router.push("/customers"),
  },
];

// ─────────────────────────────────────────────────────────────
// Load data
// ─────────────────────────────────────────────────────────────
async function loadStats() {
  loading.value = true;
  try {
    const { data: envelope } = await dashboardService.getStats();
    stats.value = envelope.data;
  } catch {
    uiStore.showAlert("فشل تحميل بيانات لوحة التحكم", "error");
  } finally {
    loading.value = false;
  }
}

onMounted(loadStats);

// ─────────────────────────────────────────────────────────────
// Today's date
// ─────────────────────────────────────────────────────────────
const today = new Intl.DateTimeFormat("ar-EG", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
}).format(new Date());

const profitClass = computed(() =>
  stats.value.totalProfit >= 0 ? "text-success" : "text-error",
);
</script>

<template>
  <div>
    <!-- ══════════════════════════════════════════════════════
         Page Header
    ═══════════════════════════════════════════════════════ -->
    <div class="d-flex align-center justify-space-between mb-6 flex-wrap ga-3">
      <div>
        <div class="d-flex align-center ga-3 mb-1">
          <v-avatar color="accent" rounded="lg" size="40">
            <v-icon icon="mdi-view-dashboard" color="white" size="22" />
          </v-avatar>
          <span class="text-2xl font-bold">لوحة التحكم</span>
        </div>
        <span class="text-sm text-medium-emphasis">
          نظرة شاملة على أداء معرض السيارات المالي والتشغيلي
        </span>
      </div>
      <v-chip
        prepend-icon="mdi-calendar-today"
        variant="tonal"
        color="accent"
        size="small"
      >
        {{ today }}
      </v-chip>
    </div>

    <!-- ══════════════════════════════════════════════════════
         Quick Actions Bar
    ═══════════════════════════════════════════════════════ -->
    <v-card class="app-card pa-4 mb-6">
      <div class="d-flex align-center ga-2 mb-3">
        <v-icon icon="mdi-lightning-bolt" color="accent" size="18" />
        <span class="text-base font-weight-bold">إجراءات سريعة</span>
      </div>
      <div class="d-flex flex-wrap ga-3">
        <v-tooltip
          v-for="action in quickActions"
          :key="action.label"
          :text="action.tooltip"
          location="bottom"
        >
          <template #activator="{ props: tip }">
            <v-btn
              v-bind="tip"
              :color="action.color"
              :prepend-icon="action.icon"
              variant="tonal"
              rounded="lg"
              style="text-transform: none; font-weight: 600"
              @click="action.action"
            >
              {{ action.label }}
            </v-btn>
          </template>
        </v-tooltip>
      </div>
    </v-card>

    <!-- Loading skeleton -->
    <div v-if="loading">
      <v-row>
        <v-col v-for="n in 8" :key="n" cols="12" sm="6" md="3">
          <v-skeleton-loader type="card" class="rounded-xl" />
        </v-col>
      </v-row>
    </div>

    <template v-else>
      <!-- ══════════════════════════════════════════════════
           Section 1 — Financial Overview
      ═══════════════════════════════════════════════════ -->
      <div class="d-flex align-center ga-2 mb-4">
        <v-icon icon="mdi-cash-multiple" color="accent" />
        <span class="text-base font-bold text-nowrap">البيانات المالية</span>
        <v-divider class="flex-grow-1 ms-2" />
      </div>

      <v-row class="mb-2">
        <v-col
          v-for="(card, i) in financialCards"
          :key="card.label"
          cols="12"
          sm="4"
        >
          <v-card
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{
              opacity: 1,
              y: 0,
              transition: { duration: 400, delay: i * 80 },
            }"
            class="app-card pa-5 h-100"
          >
            <div class="d-flex align-start justify-space-between">
              <div class="flex-grow-1">
                <div class="d-flex align-center ga-2 mb-1">
                  <span class="text-caption text-medium-emphasis font-cairo">
                    {{ card.label }}
                  </span>
                  <v-tooltip
                    :text="card.tooltip"
                    location="top"
                    max-width="220"
                  >
                    <template #activator="{ props: tip }">
                      <v-icon
                        v-bind="tip"
                        icon="mdi-information-outline"
                        size="13"
                        color="grey"
                        style="cursor: help"
                      />
                    </template>
                  </v-tooltip>
                </div>
                <div
                  class="text-h5 font-weight-bold mt-1"
                  :class="card.label === 'صافي الأرباح' ? profitClass : ''"
                >
                  {{ card.value }}
                </div>
              </div>
              <v-avatar
                :color="card.color"
                variant="tonal"
                size="50"
                rounded="lg"
              >
                <v-icon :icon="card.icon" :color="card.color" size="24" />
              </v-avatar>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- ══════════════════════════════════════════════════
           Section 2 — Fleet Status
      ═══════════════════════════════════════════════════ -->
      <div class="d-flex align-center ga-2 mb-4 mt-6">
        <v-icon icon="mdi-car-multiple" color="accent" />
        <span class="text-base font-bold text-nowrap">حالة أسطول السيارات</span>
        <v-divider class="flex-grow-1 ms-2" />
        <v-btn
          variant="text"
          color="accent"
          size="small"
          prepend-icon="mdi-arrow-left"
          style="text-transform: none"
          @click="router.push('/cars')"
        >
          عرض الكل
        </v-btn>
      </div>

      <v-row class="mb-2">
        <v-col
          v-for="(card, i) in fleetCards"
          :key="card.label"
          cols="6"
          sm="6"
          md="3"
        >
          <v-card
            v-motion
            :initial="{ opacity: 0, scale: 0.94 }"
            :enter="{
              opacity: 1,
              scale: 1,
              transition: { duration: 400, delay: 200 + i * 70 },
            }"
            class="app-card pa-5 h-100 fleet-card"
            :class="card.bgClass"
          >
            <v-tooltip :text="card.tooltip" location="top">
              <template #activator="{ props: tip }">
                <div
                  v-bind="tip"
                  class="d-flex flex-column align-center text-center ga-2"
                >
                  <v-avatar
                    :color="card.color"
                    variant="tonal"
                    size="52"
                    rounded="xl"
                  >
                    <v-icon :icon="card.icon" :color="card.color" size="26" />
                  </v-avatar>
                  <span class="text-h4 font-weight-bold">{{ card.value }}</span>
                  <span class="text-body-2 text-medium-emphasis font-cairo">{{
                    card.label
                  }}</span>
                </div>
              </template>
            </v-tooltip>
          </v-card>
        </v-col>
      </v-row>

      <!-- ══════════════════════════════════════════════════
           Section 3 — Charts Row (Donut + Bar)
      ═══════════════════════════════════════════════════ -->
      <div class="d-flex align-center ga-2 mb-4 mt-6">
        <v-icon icon="mdi-chart-bar" color="accent" />
        <span class="text-base font-bold text-nowrap">المؤشرات البيانية</span>
        <v-divider class="flex-grow-1 ms-2" />
      </div>

      <v-row>
        <!-- Donut: fleet distribution -->
        <v-col cols="12" md="4">
          <v-card class="app-card pa-5 h-100">
            <div class="d-flex align-center ga-2 mb-4">
              <v-icon icon="mdi-chart-donut" color="accent" size="18" />
              <span class="font-weight-bold font-cairo">توزيع الأسطول</span>
              <v-tooltip
                text="النسب المئوية لحالة السيارات: 
                1- جاهزة، 2- قيد الشحن ،3- قيد الصيانة"
                location="top"
              >
                <template #activator="{ props: tip }">
                  <v-icon
                    v-bind="tip"
                    icon="mdi-information-outline"
                    size="14"
                    color="grey"
                    style="cursor: help"
                  />
                </template>
              </v-tooltip>
            </div>

            <div v-if="stats.totalCars > 0">
              <apexchart
                type="donut"
                height="280"
                :options="donutOptions"
                :series="donutSeries"
              />
            </div>
            <div
              v-else
              class="d-flex flex-column align-center justify-center py-10"
            >
              <v-icon icon="mdi-car-off" size="48" color="grey" />
              <span class="text-caption text-medium-emphasis mt-2 font-cairo"
                >لا توجد سيارات بعد</span
              >
            </div>
          </v-card>
        </v-col>

        <!-- Bar: monthly revenue -->
        <v-col cols="12" md="8">
          <v-card class="app-card pa-5 h-100">
            <div class="d-flex align-center ga-2 mb-4">
              <v-icon icon="mdi-chart-bar" color="accent" size="18" />
              <span class="text-subtitle-2 font-weight-bold font-cairo"
                >الإيرادات الشهرية</span
              >
              <v-tooltip
                text="الإيرادات الشهرية من عمليات البيع خلال الفترة الماضية"
                location="top"
              >
                <template #activator="{ props: tip }">
                  <v-icon
                    v-bind="tip"
                    icon="mdi-information-outline"
                    size="14"
                    color="grey"
                    style="cursor: help"
                  />
                </template>
              </v-tooltip>
            </div>

            <div v-if="stats.monthlySales.length > 0">
              <apexchart
                type="bar"
                height="260"
                :options="barOptions"
                :series="barSeries"
              />
            </div>
            <div
              v-else
              class="d-flex flex-column align-center justify-center py-10"
            >
              <v-icon icon="mdi-chart-bar-stacked" size="48" color="grey" />
              <span class="text-caption text-medium-emphasis mt-2"
                >لا توجد بيانات مبيعات</span
              >
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- ══════════════════════════════════════════════════
           Section 4 — Recent Sales Table
      ═══════════════════════════════════════════════════ -->
      <div class="d-flex align-center ga-2 mb-4 mt-6">
        <v-icon icon="mdi-receipt-text-clock" color="accent" />
        <span class="text-base font-bold text-nowrap">آخر المبيعات</span>
        <v-divider class="flex-grow-1 ms-2" />
        <v-btn
          variant="text"
          color="accent"
          size="small"
          prepend-icon="mdi-arrow-left"
          style="text-transform: none"
          @click="router.push('/sales')"
        >
          عرض الكل
        </v-btn>
      </div>

      <v-card class="app-card pa-0">
        <v-table density="comfortable">
          <thead>
            <tr>
              <th class="text-body-2 font-weight-bold">
                <div class="d-flex align-center ga-1">
                  <v-icon icon="mdi-car" size="15" color="accent" /> السيارة
                </div>
              </th>
              <th class="text-body-2 font-weight-bold">
                <div class="d-flex align-center ga-1">
                  <v-icon icon="mdi-account" size="15" color="accent" /> العميل
                </div>
              </th>
              <th class="text-body-2 font-weight-bold">
                <div class="d-flex align-center ga-1">
                  <v-icon icon="mdi-cash" size="15" color="accent" /> سعر البيع
                </div>
              </th>
              <th class="text-body-2 font-weight-bold">
                <div class="d-flex align-center ga-1">
                  <v-icon icon="mdi-trending-up" size="15" color="accent" />
                  الربح
                </div>
              </th>
              <th class="text-body-2 font-weight-bold">
                <div class="d-flex align-center ga-1">
                  <v-icon icon="mdi-calendar" size="15" color="accent" />
                  التاريخ
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="sale in stats.recentSales"
              :key="sale.soldDate + sale.carTitle"
              class="sale-row"
            >
              <td>
                <div class="d-flex align-center ga-2 py-2">
                  <v-avatar
                    color="primary"
                    variant="tonal"
                    size="32"
                    rounded="lg"
                  >
                    <v-icon icon="mdi-car" size="16" />
                  </v-avatar>
                  <span class="text-body-2 font-weight-medium">{{
                    sale.carTitle
                  }}</span>
                </div>
              </td>
              <td>
                <div class="d-flex align-center ga-2">
                  <v-avatar
                    color="secondary"
                    variant="tonal"
                    size="28"
                    rounded="circle"
                  >
                    <v-icon icon="mdi-account" size="14" />
                  </v-avatar>
                  <span class="text-sm">{{ sale.customerName }}</span>
                </div>
              </td>
              <td>
                <span class="text-sm font-weight-bold text-gold">
                  {{ formatCurrency(sale.soldPrice) }}
                </span>
              </td>
              <td>
                <v-chip
                  :color="
                    sale.profit > 0
                      ? 'success'
                      : sale.profit < 0
                        ? 'error'
                        : 'secondary'
                  "
                  size="small"
                  variant="tonal"
                  :prepend-icon="
                    sale.profit > 0
                      ? 'mdi-trending-up'
                      : sale.profit < 0
                        ? 'mdi-trending-down'
                        : 'mdi-minus'
                  "
                  class="font-weight-bold"
                >
                  {{ formatCurrency(sale.profit) }}
                </v-chip>
              </td>
              <td class="text-caption text-medium-emphasis">
                {{ formatDate(sale.soldDate) }}
              </td>
            </tr>

            <tr v-if="!stats.recentSales.length">
              <td colspan="5" class="text-center py-10 text-medium-emphasis">
                <v-icon
                  icon="mdi-receipt-text-remove"
                  size="36"
                  class="mb-2 d-block mx-auto"
                />
                لا توجد مبيعات حديثة
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card>
    </template>
  </div>
</template>

<style scoped>
/* Fleet cards subtle accent background */
.fleet-card {
  transition: transform 0.2s ease;
}
.fleet-card:hover {
  transform: translateY(-3px);
}

.fleet-ready {
  border-right: 3px solid #2e7d32 !important;
}
.fleet-sold {
  border-right: 3px solid #d4af37 !important;
}
.fleet-maintenance {
  border-right: 3px solid #ed6c02 !important;
}
.fleet-total {
  border-right: 3px solid #0d1b2a !important;
}

.sale-row {
  transition: background-color 0.15s ease;
}
.sale-row:hover {
  background-color: rgba(212, 175, 55, 0.06) !important;
}
</style>
