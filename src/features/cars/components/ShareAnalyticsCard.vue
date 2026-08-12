<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import QrcodeVue from "qrcode.vue";
import { shareService } from "../../public/services/share.service";
import type { ShareAnalytics } from "../../public/models/share.model";

const props = defineProps<{ carId: number }>();
const baseUrl = window.location.origin;
const loading = ref(true);
const notFound = ref(false);
const data = ref<ShareAnalytics | null>(null);

// متغيرات الـ QR Code والطباعة
const selectedQrUrl = ref<string | null>(null);
const qrDialog = ref(false);

// تغيير النوع ليكون string أو null
const copiedLinkId = ref<string | null>(null);

async function copyUrl(token: string, shareId: string | number) {
  const fullUrl = `${baseUrl}/public/car/${token}`;
  await navigator.clipboard.writeText(fullUrl);

  const idStr = String(shareId);
  copiedLinkId.value = idStr;

  setTimeout(() => {
    if (copiedLinkId.value === idStr) {
      copiedLinkId.value = null;
    }
  }, 2500);
}

// فتح نافذة الـ QR للروابط المتعددة
function openQrDialog(token: string) {
  selectedQrUrl.value = `${baseUrl}/public/car/${token}`;
  qrDialog.value = true;
}

// دالة الطباعة الخاصة بـ QR Code
function printQrCode(url: string) {
  const canvas =
    (document.querySelector("#qr-code-canvas canvas") as HTMLCanvasElement) ||
    (document.querySelector("#single-qr-canvas canvas") as HTMLCanvasElement);

  const qrImageSrc = canvas ? canvas.toDataURL("image/png") : "";

  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html dir="rtl">
    <head>
      <title>طباعة QR Code</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          margin: 0;
        }
        .qr-card {
          border: 2px solid #ddd;
          padding: 24px;
          border-radius: 12px;
          text-align: center;
          max-width: 300px;
        }
        img {
          width: 200px;
          height: 200px;
        }
        p {
          word-break: break-all;
          font-size: 12px;
          color: #555;
          margin-top: 12px;
        }
      </style>
    </head>
    <body>
      <div class="qr-card">
        <h3>رمز مشاركة السيارة</h3>
        <img id="qr-img" src="${qrImageSrc}" alt="QR Code" />
        <p>${url}</p>
      </div>

      <script>
        const img = document.getElementById("qr-img");

        if (img.complete) {
          setTimeout(() => window.print(), 300);
        } else {
          img.onload = () => {
            setTimeout(() => window.print(), 300);
          };
        }

        window.onafterprint = () => {
          window.close();
        };
      <\/script>
    </body>
    </html>
  `);

  printWindow.document.close();
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

              <!-- Copy Button -->
              <v-btn
                :icon="
                  copiedLinkId === String(link.shareId)
                    ? 'mdi-check'
                    : 'mdi-content-copy'
                "
                :color="
                  copiedLinkId === String(link.shareId) ? 'success' : undefined
                "
                size="small"
                variant="text"
                title="نسخ الرابط"
                @click="copyUrl(link.token, link.shareId)"
              />

              <!-- QR Dialog Button (فقط عند وجود أكثر من رابط) -->
              <v-btn
                v-if="data.links.length > 1"
                icon="mdi-qrcode"
                size="small"
                variant="text"
                color="accent"
                title="عرض QR Code"
                @click="openQrDialog(link.token)"
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

        <!-- حالة وجود رابط واحد فقط: يظهر الـ QR مباشرة ومعه زر طباعة -->
        <div
          v-if="data.links.length === 1"
          class="d-flex flex-column align-center justify-center mt-6 pt-4 border-t ga-3"
        >
          <div id="single-qr-canvas" class="bg-white pa-3 rounded-lg border">
            <qrcode-vue
              :value="`${baseUrl}/public/car/${data.links[0].token}`"
              :size="150"
              level="H"
            />
          </div>

          <v-btn
            color="accent"
            variant="tonal"
            size="small"
            prepend-icon="mdi-printer"
            @click="printQrCode(`${baseUrl}/public/car/${data.links[0].token}`)"
          >
            طباعة الـ QR Code
          </v-btn>
        </div>
      </div>
    </div>
  </v-card>

  <!-- نافذة منبثقة للـ QR (في حالة الروابط المتعددة) -->
  <v-dialog v-model="qrDialog" max-width="360">
    <v-card dir="rtl" class="pa-5 text-center rounded-xl">
      <div class="d-flex justify-space-between align-center mb-4">
        <span class="font-weight-bold">رمز الـ QR للمشاركة</span>
        <v-btn
          icon="mdi-close"
          variant="text"
          size="small"
          @click="qrDialog = false"
        />
      </div>

      <div v-if="selectedQrUrl" class="d-flex flex-column align-center ga-4">
        <div id="qr-code-canvas" class="bg-white pa-4 rounded-lg border">
          <qrcode-vue :value="selectedQrUrl" :size="180" level="H" />
        </div>

        <span
          dir="ltr"
          class="text-caption text-medium-emphasis text-truncate style-url"
        >
          {{ selectedQrUrl }}
        </span>

        <v-btn
          block
          color="accent"
          prepend-icon="mdi-printer"
          @click="printQrCode(selectedQrUrl)"
        >
          طباعة الـ QR Code
        </v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.style-url {
  max-width: 100%;
}
</style>
