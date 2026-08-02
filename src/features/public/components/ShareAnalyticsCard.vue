<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { shareService } from "../services/share.service";
import type { ShareAnalytics } from "../models/share.model";

const props = defineProps<{ carId: number }>();
const baseUrl = window.location.origin;
const loading = ref(true);
const notFound = ref(false);
const data = ref<ShareAnalytics | null>(null);

// تغيير النوع ليكون string أو null
const copiedLinkId = ref<string | null>(null);

async function copyUrl(token: string, shareId: string | number) {
  const fullUrl = `${baseUrl}/public/car/${token}`;
  await navigator.clipboard.writeText(fullUrl);

  // تحويل الـ id دائماً إلى string لتفادي اختلاف الأنواع
  const idStr = String(shareId);
  copiedLinkId.value = idStr;

  setTimeout(() => {
    if (copiedLinkId.value === idStr) {
      copiedLinkId.value = null;
    }
  }, 2500);
}

onMounted(async () => {
  try {
    const { data: env } = await shareService.getAnalytics(props.carId);
    data.value = env.data;
  } catch (err: any) {
    if (err?.response?.status === 404) notFound.value = true;
  } finally {
    loading.value = false;
  }
});

const chartSeries = computed(() => [
  {
    name: "المشاهدات",
    data: data.value?.viewsOverTime.map((v) => v.count) ?? [],
  },
]);

const chartOptions = computed(() => ({
  chart: {
    type: "area",
    background: "transparent",
    toolbar: { show: false },
    sparkline: { enabled: true },
  },
  stroke: { curve: "smooth", width: 2 },
  fill: {
    type: "gradient",
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.4,
      opacityTo: 0,
      stops: [0, 100],
    },
  },
  colors: ["#D4AF37"],
  tooltip: {
    style: { fontFamily: "Cairo" },
    x: {
      formatter: (_: number, { dataPointIndex }: { dataPointIndex: number }) =>
        data.value?.viewsOverTime[dataPointIndex]?.date ?? "",
    },
    y: { formatter: (v: number) => `${v} مشاهدة` },
  },
}));
</script>

<template>
  <v-card class="app-card pa-5">
    <div class="d-flex align-center ga-2 mb-4">
      <v-icon icon="mdi-chart-line" color="accent" size="18" />
      <span class="text-lg font-bold">إحصائيات المشاركة</span>
    </div>

    <div v-if="loading" class="d-flex justify-center py-6">
      <v-progress-circular indeterminate color="accent" size="32" />
    </div>

    <div v-else-if="notFound" class="d-flex flex-column align-center py-6 ga-2">
      <v-icon icon="mdi-chart-bar-stacked" size="40" color="grey" />
      <span class="text-medium-emphasis">لم يتم توليد رابط مشاركة بعد</span>
    </div>

    <div v-else-if="data">
      <!-- Total Views -->
      <div class="d-flex align-center justify-space-between mb-4">
        <div>
          <span class="text-sm d-block">إجمالي المشاهدات</span>
          <span class="text-h4 font-weight-bold text-gold">{{
            data.totalViews
          }}</span>
        </div>
        <v-avatar color="accent" variant="tonal" size="46" rounded="lg">
          <v-icon icon="mdi-eye-outline" color="accent" />
        </v-avatar>
      </div>

      <!-- Mini chart -->
      <apexchart
        v-if="data.viewsOverTime.length > 1"
        type="area"
        height="80"
        :options="chartOptions"
        :series="chartSeries"
      />

      <!-- Links list -->
      <div v-if="data.links?.length" class="mt-4">
        <div class="d-flex align-center justify-space-between mb-2">
          <span class="text-xs text-medium-emphasis"> روابط المشاركة :</span>
          <v-chip size="x-small" variant="tonal" color="accent">
            {{ data.links.length }} روابط
          </v-chip>
        </div>

        <v-list density="compact" class="pa-0">
          <v-list-item
            v-for="link in data.links"
            :key="link.shareId"
            class="px-0"
          >
            <!-- icon -->
            <template #prepend>
              <v-icon
                icon="mdi-link-variant"
                size="16"
                color="grey"
                class="me-2"
              />
            </template>

            <!-- token / link -->
            <v-list-item-title class="d-flex align-center ga-2">
              <span class="text-truncate">
                {{ baseUrl }}/public/car/{{ link.token }}
              </span>

              <v-btn
                :icon="
                  copiedLinkId === String(link.shareId)
                    ? 'mdi-check'
                    : 'mdi-content-copy'
                "
                :color="
                  copiedLinkId === String(link.shareId) ? 'success' : undefined
                "
                size="x-small"
                variant="text"
                @click="copyUrl(link.token, link.shareId)"
              />
            </v-list-item-title>

            <!-- views -->
            <template #append>
              <v-chip size="x-small" color="accent" variant="tonal">
                {{ link.viewsCount }} مشاهدة
              </v-chip>
            </template>
          </v-list-item>
        </v-list>
      </div>
    </div>
  </v-card>
</template>
