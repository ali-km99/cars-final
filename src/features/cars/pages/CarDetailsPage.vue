<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useCarStore } from "../store/car.store";
import { useMaintenanceStore } from "@/features/maintenances/store/maintenance.store";
import { useCarStatus } from "../composables/useCarStatus";
import {
  formatCurrency,
  formatDate,
  calculateProfit,
  resolveImageUrl,
} from "@/core/utils/formatters";
import CarImagesModal from "../components/CarImagesModal.vue";

import { useUiStore } from "@/core/store/ui.store.ts";

import ShareLinkModal from "../components/ShareLinkModal.vue";
import ShareAnalyticsCard from "../components/ShareAnalyticsCard.vue";
const route = useRoute();
const router = useRouter();
const carStore = useCarStore();
const uiStore = useUiStore();
const maintenanceStore = useMaintenanceStore();
const { getStatusMeta } = useCarStatus();

const carId = computed(() => {
  const id = Number(route.params.id);
  return id;
});

onMounted(async () => {
  if (carId.value) {
    await carStore.fetchCarById(carId.value);
    await maintenanceStore.fetchByCarId(carId.value);
  }
});

const car = computed(() => {
  return carStore.currentCar;
});
const statusMeta = computed(() => getStatusMeta(car.value?.statusName || ""));

const images = computed(() => car.value?.images ?? []);

// قائمة الصور النهائية: من images[] فقط
const galleryImages = computed(() => {
  if (!car.value?.images?.length) return [];
  return car.value.images.map((img) => ({
    id: img.id,
    url: resolveImageUrl(img.imageUrl),
  }));
});

const imageActionLoading = ref<number | null>(null);
const showImagesModal = ref(false);
const showShareModal = ref(false);

async function handleSetPrimary(imageId: number) {
  imageActionLoading.value = imageId;
  try {
    await carStore.setPrimaryImage(carId.value, imageId);
  } finally {
    imageActionLoading.value = null;
  }
}

async function handleDeleteImage(imageId: number) {
  if (!confirm("هل أنت متأكد من حذف هذه الصورة؟")) return;
  imageActionLoading.value = imageId;
  try {
    await carStore.deleteImage(carId.value, imageId);
  } finally {
    imageActionLoading.value = null;
  }
}

const totalRepairCost = computed(() =>
  maintenanceStore.maintenances.reduce((sum, m) => sum + m.repairCost, 0),
);

const profit = computed(() => {
  if (!car.value) return 0;
  return calculateProfit(
    car.value.sellingPrice,
    car.value.costPrice || 0,
    car.value.shippingCost || 0,
    totalRepairCost.value,
  );
});

async function handleDelete() {
  if (!confirm("هل أنت متأكد من حذف هذه السيارة؟")) return;
  await carStore.deleteCar(carId.value);
  router.push("/cars");
}

const copyVin = async () => {
  if (car.value?.vinNumber)
    try {
      await navigator.clipboard.writeText(car.value?.vinNumber);

      uiStore.showAlert("تم نسخ رقم الهيكل ✅", "success");
    } catch (err) {
      console.error(err);

      uiStore.showAlert("فشل النسخ ❌", "error");
    }
};
</script>

<template>
  <div
    v-if="carStore.loading"
    class="flex items-center justify-center min-h-[400px] font-cairo"
  >
    <v-progress-circular indeterminate color="accent" size="48" />
  </div>

  <div v-else-if="!car" class="p-8 text-center font-cairo">
    <p class="text-xl font-bold text-primary dark:text-white">
      لا توجد بيانات متاحة لهذه المركبة
    </p>
    <p class="text-gray mt-2">
      {{ carStore.error || "يرجى التحقق من اتصال الشبكة أو معرف السيارة." }}
    </p>
    <v-btn
      color="accent"
      class="mt-4 rounded-lg font-bold"
      @click="router.push('/cars')"
      >العودة للمنظومة</v-btn
    >
  </div>

  <div
    v-else
    class="min-h-screen p-4 lg:p-8 text-primary dark:text-white font-cairo transition-colors duration-300"
  >
    <div
      class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-4 border-b border-gray/20 dark:border-surface-dark"
    >
      <div class="flex items-center gap-3">
        <v-btn
          icon="mdi-arrow-right"
          variant="tonal"
          color="accent"
          density="comfortable"
          class="rounded-lg border border-accent/30 shadow-soft"
          @click="router.push('/cars')"
        />
        <div>
          <div class="flex items-center gap-2 flex-wrap">
            <h1
              class="text-xl lg:text-3xl font-black tracking-tight text-primary dark:text-white"
            >
              {{ car.brand }} {{ car.model }}
            </h1>
            <v-chip
              :color="statusMeta.color"
              size="small"
              variant="flat"
              class="font-bold"
            >
              {{ statusMeta.label }}
            </v-chip>
          </div>
          <div class="flex justify-between items-center">
            <p
              class="text-sm text-gray dark:text-gray/80 font-medium mt-1 mx-2"
            >
              سنة الصنع:
              <span class="text-accent dark:text-accent-light font-black">{{
                car.year
              }}</span>
            </p>
            <p
              v-if="car.vinNumber"
              class="text-sm text-gray dark:text-gray/80 font-medium mt-1 mx-2 flex items-center gap-2"
            >
              رقم الهيكل:
              <span class="text-accent dark:text-accent-light font-black">
                {{ car.vinNumber }}
              </span>

              <!-- Tooltip + زر النسخ -->
              <v-tooltip text="نسخ رقم الهيكل" location="top right">
                <template #activator="{ props }">
                  <button
                    v-bind="props"
                    @click="copyVin"
                    class="text-xs px-2 py-1 rounded bg-accent text-white hover:opacity-80 transition flex items-center"
                  >
                    <i class="mdi mdi-content-copy"></i>
                  </button>
                </template>
              </v-tooltip>
            </p>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-2 self-end sm:self-center">
        <v-btn
          icon="mdi-share-variant-outline"
          color="teal"
          variant="tonal"
          class="rounded-lg border border-teal-500/30 shadow-gold"
          @click="showShareModal = true"
        />
        <v-btn
          icon="mdi-image-multiple"
          color="blue"
          variant="tonal"
          class="rounded-lg border border-accent/30 shadow-gold"
          @click="showImagesModal = true"
        />
        <v-btn
          icon="mdi-pencil-outline"
          color="primary"
          variant="tonal"
          class="rounded-lg dark:text-white border border-primary/10 dark:border-white/5 shadow-gold"
          @click="router.push(`/cars/${carId}/edit`)"
        />
        <v-btn
          icon="mdi-delete-outline"
          color="error"
          variant="tonal"
          class="rounded-lg shadow-gold"
          @click="handleDelete"
        />
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      <div class="lg:col-span-2 space-y-6">
        <v-card
          class="rounded-xl2 overflow-hidden relative border border-accent/20 dark:border-white/5 dark:bg-surface-dark group shadow-soft-lg"
        >
          <div dir="ltr" v-if="galleryImages.length">
            <v-carousel
              height="450"
              hide-delimiter-background
              show-arrows="hover"
            >
              <v-carousel-item
                v-for="img in galleryImages"
                :key="img.id"
                :src="img.url"
                cover
              />
            </v-carousel>
          </div>
          <div
            v-else
            class="flex flex-col items-center justify-center bg-primary text-white h-[350px] lg:h-[450px]"
          >
            <v-icon icon="mdi-car-sports" size="80" class="text-accent mb-2" />
            <span class="text-sm opacity-70"
              >لا توجد صور متوفرة لهذه السيارة</span
            >
          </div>

          <div
            class="hidden md:flex absolute bottom-2 right-4 left-4 backdrop-blur-sm p-4 rounded-xl border-2 border-accent/40 items-center justify-between text-white shadow-gold"
          >
            <div>
              <span class="text-xs text-accent-light font-bold block mb-1"
                >سعر البيع المقترح المعروض</span
              >
              <span class="text-2xl font-black text-accent">{{
                formatCurrency(car.sellingPrice)
              }}</span>
            </div>
            <div class="text-left" v-if="profit">
              <span class="text-xs text-green-400 block mb-1"
                >الربح المتوقع</span
              >
              <span
                :class="profit >= 0 ? 'text-green-400' : 'text-red-400'"
                class="text-lg font-bold"
              >
                {{ formatCurrency(profit) }}
              </span>
            </div>
          </div>
        </v-card>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div
            class="p-4 rounded-xl2 border border-accent/20 dark:border-white/5 flex items-center gap-3 shadow-soft"
          >
            <div
              class="p-2.5 bg-accent/10 dark:bg-accent/20 rounded-lg text-accent-dark dark:text-accent-light"
            >
              <v-icon icon="mdi-speedometer" />
            </div>
            <div>
              <span class="text-xs text-gray dark:text-gray/70 block"
                >المسافة</span
              >
              <span class="text-sm font-black text-primary dark:text-white">{{
                car.mileage ? `${car.mileage} ${car.mileageUnit}` : "0"
              }}</span>
            </div>
          </div>
          <div
            class="p-4 rounded-xl2 border border-accent/20 dark:border-white/5 flex items-center gap-3 shadow-soft"
          >
            <div
              class="p-2.5 bg-accent/10 dark:bg-accent/20 rounded-lg text-accent-dark dark:text-accent-light"
            >
              <v-icon icon="mdi-transmission-tower" />
            </div>
            <div>
              <span class="text-xs text-gray dark:text-gray/70 block"
                >الناقل</span
              >
              <span class="text-sm font-black text-primary dark:text-white">{{
                car.transmission || "غير محدد"
              }}</span>
            </div>
          </div>
          <div
            class="p-4 rounded-xl2 border border-accent/20 dark:border-white/5 flex items-center gap-3 shadow-soft"
          >
            <div
              class="p-2.5 bg-accent/10 dark:bg-accent/20 rounded-lg text-accent-dark dark:text-accent-light"
            >
              <v-icon icon="mdi-gas-station" />
            </div>
            <div>
              <span class="text-xs text-gray dark:text-gray/70 block"
                >الوقود</span
              >
              <span class="text-sm font-black text-primary dark:text-white">{{
                car.fuelType || "غير محدد"
              }}</span>
            </div>
          </div>
          <div
            class="p-4 rounded-xl2 border border-accent/20 dark:border-white/5 flex items-center gap-3 shadow-soft"
          >
            <div
              class="p-2.5 bg-accent/10 dark:bg-accent/20 rounded-lg text-accent-dark dark:text-accent-light"
            >
              <v-icon icon="mdi-palette" />
            </div>
            <div>
              <span class="text-xs text-gray dark:text-gray/70 block"
                >اللون</span
              >
              <span class="text-sm font-black text-primary dark:text-white">{{
                car.exteriorColor || "غير محدد"
              }}</span>
            </div>
          </div>
        </div>

        <v-card
          class="rounded-xl2 p-6 border border-accent/20 dark:border-white/5 shadow-soft"
        >
          <div
            class="flex items-center gap-2 mb-6 border-b border-gray/10 dark:border-white/5 pb-3"
          >
            <v-icon
              icon="mdi-text-box-search-outline"
              color="accent"
              size="24"
            />
            <h2 class="text-lg font-bold text-primary dark:text-white">
              المواصفات التفصيلية للمركبة
            </h2>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 gap-y-6 gap-x-4">
            <div>
              <span class="text-xs text-gray dark:text-gray/60 block mb-1"
                >اللون الداخلي</span
              >
              <span class="font-bold text-primary dark:text-white">{{
                car.interiorColor || "غير محدد"
              }}</span>
            </div>
            <div>
              <span class="text-xs text-gray dark:text-gray/60 block mb-1"
                >حالة السيارة</span
              >
              <span class="font-bold text-primary dark:text-white">{{
                car.condition || "غير محدد"
              }}</span>
            </div>
            <div>
              <span class="text-xs text-gray dark:text-gray/60 block mb-1"
                >نوع الهيكل</span
              >
              <span class="font-bold text-primary dark:text-white">{{
                car.bodyType || "غير محدد"
              }}</span>
            </div>
            <div>
              <span class="text-xs text-gray dark:text-gray/60 block mb-1">
                موصفات</span
              >
              <span class="font-bold text-primary dark:text-white">{{
                car.specs || "غير محدد"
              }}</span>
            </div>
            <div>
              <span class="text-xs text-gray dark:text-gray/60 block mb-1"
                >حالة الهيكل</span
              >
              <span class="font-bold text-primary dark:text-white">{{
                car.bodyCondition || "غير محدد"
              }}</span>
            </div>
            <div>
              <span class="text-xs text-gray dark:text-gray/60 block mb-1"
                >عدد المقاعد</span
              >
              <span class="font-bold text-primary dark:text-white">{{
                car.numberOfSeats || "غير محدد"
              }}</span>
            </div>
            <div>
              <span class="text-xs text-gray dark:text-gray/60 block mb-1"
                >حجم المحرك</span
              >
              <span class="font-bold text-primary dark:text-white">{{
                car.engineSize || "غير محدد"
              }}</span>
            </div>
            <div v-if="car.vinNumber" class="col-span-2 sm:col-span-1">
              <span class="text-xs text-gray dark:text-gray/60 block mb-1"
                >رقم الشاصي (VIN)</span
              >
              <span
                class="font-mono text-sm font-bold text-accent dark:text-accent-light px-2 py-0.5 rounded border border-accent/30 block w-max"
              >
                {{ car.vinNumber }}
              </span>
            </div>
          </div>

          <div
            v-if="
              car.features &&
              (car.features.technology?.length ||
                car.features.interior?.length ||
                car.features.exterior?.length)
            "
            class="mt-8 pt-6 border-t border-gray/10 dark:border-white/5"
          >
            <h3
              class="font-bold text-sm text-primary dark:text-white mb-4 flex items-center gap-1"
            >
              <v-icon icon="mdi-star" size="18" color="accent" /> باقة الإضافات
              الحصرية
            </h3>
            <div class="space-y-4">
              <div
                v-if="car.features.technology?.length"
                class="flex flex-col sm:flex-row sm:items-center gap-2"
              >
                <span
                  class="text-xs font-bold text-gray dark:text-gray/70 sm:w-20"
                  >الأنظمة الرقمية:</span
                >
                <div class="flex flex-wrap gap-1.5">
                  <v-chip
                    v-for="feat in car.features.technology"
                    :key="feat"
                    size="x-small"
                    color="accent"
                    variant="outlined"
                    class="rounded-md font-bold border-accent/40"
                    >{{ feat }}</v-chip
                  >
                </div>
              </div>
              <div
                v-if="car.features.interior?.length"
                class="flex flex-col sm:flex-row sm:items-center gap-2"
              >
                <span
                  class="text-xs font-bold text-gray dark:text-gray/70 sm:w-20"
                  >الراحة والداخلية:</span
                >
                <div class="flex flex-wrap gap-1.5">
                  <v-chip
                    v-for="feat in car.features.interior"
                    :key="feat"
                    size="x-small"
                    color="accent"
                    variant="outlined"
                    class="rounded-md font-bold border-accent/40"
                    >{{ feat }}</v-chip
                  >
                </div>
              </div>
              <div
                v-if="car.features.exterior?.length"
                class="flex flex-col sm:flex-row sm:items-center gap-2"
              >
                <span
                  class="text-xs font-bold text-gray dark:text-gray/70 sm:w-20"
                  >الهيكل الخارجي:</span
                >
                <div class="flex flex-wrap gap-1.5">
                  <v-chip
                    v-for="feat in car.features.exterior"
                    :key="feat"
                    size="x-small"
                    color="accent"
                    variant="outlined"
                    class="rounded-md font-bold border-accent/40"
                    >{{ feat }}</v-chip
                  >
                </div>
              </div>
            </div>
          </div>
        </v-card>

        <v-card
          class="rounded-xl2 p-6 border border-accent/10 dark:border-white/5 shadow-soft"
        >
          <div class="flex items-center gap-2 mb-4">
            <v-icon icon="mdi-wrench-clock" color="accent" size="24" />
            <h2 class="text-lg font-bold text-primary dark:text-white">
              سجل الدعم الفني والصيانة
            </h2>
          </div>

          <v-list
            v-if="maintenanceStore.maintenances.length"
            class="p-0 bg-transparent divide-y divide-gray/10 dark:divide-white/5"
          >
            <v-list-item
              v-for="m in maintenanceStore.maintenances"
              :key="m.id"
              class="px-0 py-3"
            >
              <div class="flex justify-between items-start w-full">
                <div>
                  <h4 class="font-bold text-sm text-primary dark:text-white">
                    {{ m.issueDescription }}
                  </h4>
                  <p class="text-xs text-gray dark:text-gray/60 mt-0.5">
                    <v-icon icon="mdi-calendar" size="12" />
                    {{ formatDate(m.createdAt) }}
                  </p>
                </div>
                <v-chip
                  size="small"
                  color="error"
                  variant="flat"
                  class="font-bold"
                >
                  {{ formatCurrency(m.repairCost) }}
                </v-chip>
              </div>
            </v-list-item>
          </v-list>

          <div
            v-else
            class="text-center py-6 bg-bg-light dark:bg-primary/30 rounded-xl2 border-2 border-dashed border-accent/20"
          >
            <v-icon
              icon="mdi-check-circle-outline"
              color="success"
              size="32"
              class="mb-1"
            />
            <p class="text-sm text-gray dark:text-gray/80 font-medium">
              السيارة سليمة تماماً، لا توجد إصلاحات مسجلة
            </p>
          </div>
        </v-card>
      </div>

      <div class="space-y-6">
        <div
          class="md:hidden bg-white dark:bg-surface-dark p-5 rounded-xl2 border-2 border-accent shadow-gold"
        >
          <span class="text-xs text-gray dark:text-gray/70 font-bold block mb-1"
            >سعر البيع الحالي للمركبة</span
          >
          <div class="flex justify-between items-baseline">
            <span
              class="text-2xl font-black text-accent dark:text-accent-light"
              >{{ formatCurrency(car.sellingPrice) }}</span
            >
            <span
              v-if="profit"
              :class="profit >= 0 ? 'text-green-500' : 'text-red-500'"
              class="text-xs font-bold bg-bg-light dark:bg-primary px-2 py-1 rounded"
            >
              الربح المباشر: {{ formatCurrency(profit) }}
            </span>
          </div>
        </div>

        <ShareAnalyticsCard :carId="carId" />

        <v-card
          class="rounded-xl2 overflow-hidden bg-primary-light border-2 border-accent shadow-gold text-white"
        >
          <div
            class="p-6 bg-linear-to-br from-primary via-primary to-secondary dark:from-surface-dark dark:to-primary"
          >
            <div class="flex items-center gap-2 mb-5">
              <v-icon icon="mdi-finance" color="accent" size="24" />
              <h2 class="text-lg font-bold text-white">
                البيانات المالية الاستثمارية
              </h2>
            </div>

            <div class="space-y-4">
              <div class="flex justify-between items-center opacity-90">
                <span class="text-sm font-medium text-gray-200"
                  >صافي قيمة الشراء</span
                >
                <span class="text-sm font-bold font-mono">{{
                  formatCurrency(car.costPrice || 0)
                }}</span>
              </div>
              <div class="flex justify-between items-center opacity-90">
                <span class="text-sm font-medium text-gray-200"
                  >تكاليف والشحن والجمارك</span
                >
                <span class="text-sm font-bold font-mono">{{
                  formatCurrency(car.shippingCost || 0)
                }}</span>
              </div>
              <div class="flex justify-between items-center opacity-90">
                <span class="text-sm font-medium text-gray-200"
                  >إجمالي مدفوعات الصيانة</span
                >
                <span class="text-sm font-bold font-mono text-red-300">{{
                  formatCurrency(totalRepairCost)
                }}</span>
              </div>

              <v-divider class="my-3 border-white/10" />

              <div
                class="flex justify-between items-center bg-white/5 dark:bg-primary/40 p-3 rounded-lg border border-accent/40"
              >
                <div>
                  <span
                    class="text-xs text-accent-light dark:text-accent font-bold block"
                    >العائد المالي الصافي المتوقع</span
                  >
                  <span
                    :class="profit >= 0 ? 'text-green-400' : 'text-red-400'"
                    class="text-xl font-black font-mono"
                  >
                    {{ formatCurrency(profit) }}
                  </span>
                </div>
                <div class="p-2 bg-accent/20 rounded-lg">
                  <v-icon
                    :icon="
                      profit >= 0 ? 'mdi-trending-up' : 'mdi-trending-down'
                    "
                    :color="profit >= 0 ? 'accent' : 'error'"
                    size="24"
                  />
                </div>
              </div>
            </div>
          </div>
        </v-card>

        <v-card
          class="rounded-xl2 p-6 border-accent/10 dark:border-white/5 shadow-soft"
        >
          <div
            class="flex items-center gap-2 mb-4 border-b border-gray/10 dark:border-white/5 pb-2"
          >
            <v-icon icon="mdi-file-shield-outline" color="accent" size="24" />
            <h2 class="text-sm font-bold text-primary dark:text-white">
              المستندات الإدارية والقانونية
            </h2>
          </div>

          <div class="space-y-3">
            <div
              class="flex items-center justify-between p-2.5 rounded-lg border"
              :class="
                car.hasLicense
                  ? 'bg-green-50/10 border-green-500/30'
                  : 'bg-red-50/10 border-red-500/30'
              "
            >
              <div class="flex items-center gap-2">
                <v-icon
                  :icon="
                    car.hasLicense ? 'mdi-check-circle' : 'mdi-close-circle'
                  "
                  :color="car.hasLicense ? 'success' : 'error'"
                  size="20"
                />
                <span class="text-xs font-bold text-primary dark:text-white"
                  >تسجيل المركبة</span
                >
              </div>
            </div>

            <div
              class="flex items-center justify-between p-2.5 rounded-lg border"
              :class="
                car.hasInsurance
                  ? 'bg-green-50/10 border-green-500/30'
                  : 'bg-red-50/10 border-red-500/30'
              "
            >
              <div class="flex items-center gap-2">
                <v-icon
                  :icon="
                    car.hasInsurance ? 'mdi-check-circle' : 'mdi-close-circle'
                  "
                  :color="car.hasInsurance ? 'success' : 'error'"
                  size="20"
                />
                <span class="text-xs font-bold text-primary dark:text-white"
                  >التأمين الأجباري</span
                >
              </div>
            </div>

            <div
              class="flex items-center justify-between p-2.5 rounded-lg border"
              :class="
                car.hasCustomsClearance
                  ? 'bg-green-50/10 border-green-500/30'
                  : 'bg-red-50/10 border-red-500/30'
              "
            >
              <div class="flex items-center gap-2">
                <v-icon
                  :icon="
                    car.hasCustomsClearance
                      ? 'mdi-check-circle'
                      : 'mdi-close-circle'
                  "
                  :color="car.hasCustomsClearance ? 'success' : 'error'"
                  size="20"
                />
                <span class="text-xs font-bold text-primary dark:text-white"
                  >التخليص والإجراء الجمركي</span
                >
              </div>
            </div>
          </div>
        </v-card>

        <v-card
          v-if="car.paymentMethod"
          class="rounded-xl2 p-5 border-accent/20 shadow-soft"
        >
          <span class="text-xs text-gray dark:text-gray/60 block mb-1 font-bold"
            >آلية السداد المطلوبة</span
          >
          <div
            class="flex items-center gap-2 text-primary dark:text-white font-bold"
          >
            <v-icon
              icon="mdi-credit-card-outline"
              size="20"
              class="text-accent"
            />
            <span>{{ car.paymentMethod }}</span>
          </div>
        </v-card>

        <v-card
          v-if="car.notes"
          class="rounded-xl2 p-5 bg-amber-50/10 dark:bg-amber-950/20 border border-amber-500/30 shadow-soft"
        >
          <h3
            class="font-bold text-xs text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-1"
          >
            <v-icon icon="mdi-alert-circle-outline" size="16" color="warning" />
            ملاحظات سرية للمنظومة
          </h3>
          <p
            class="text-xs text-amber-800 dark:text-amber-300 leading-relaxed whitespace-pre-wrap"
          >
            {{ car.notes }}
          </p>
        </v-card>

        <div
          class="text-center py-2 rounded-xl2 border border-gray/10 dark:border-white/5 shadow-soft"
        >
          <span class="text-[11px] text-gray dark:text-gray/60 block"
            >تاريخ تسجيل وتصدير البيانات</span
          >
          <span
            class="text-xs font-bold text-primary dark:text-accent font-mono"
            >{{ formatDate(car.createdAt) }}</span
          >
        </div>
      </div>
    </div>

    <CarImagesModal
      v-model="showImagesModal"
      :carId="carId"
      :images="images"
      :loadingImageId="imageActionLoading"
      @setPrimary="handleSetPrimary"
      @deleteImage="handleDeleteImage"
    />

    <ShareLinkModal v-model="showShareModal" :carId="carId" />
  </div>
</template>

<style>
.v-carousel__controls {
  bottom: 20px !important;
}
</style>
