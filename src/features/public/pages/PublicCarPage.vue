<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { shareService } from "../services/share.service";
import type { PublicCarData, PublicPageState } from "../models/share.model";
import { resolveImageUrl } from "@/core/utils/formatters"; // استيراد الدالة

const route = useRoute();
const token = route.params.token as string;

const state = ref<PublicPageState>("loading");
const car = ref<PublicCarData | null>(null);
const activeImage = ref(0);

// دالة حاسبة أو استخدام مباشر لضمان معالجة مصفوفة الصور كاملة
const formattedImages = computed(() => {
  if (!car.value?.images) return [];
  return car.value.images
    .map((img) => resolveImageUrl(img))
    .filter((img): img is string => Boolean(img));
});

const specGroups = computed(() => {
  if (!car.value) return [];
  const c = car.value;
  return [
    {
      icon: "mdi-speedometer",
      label: "المسافة المقطوعة",
      value: c.mileage
        ? `${c.mileage.toLocaleString()} ${c.mileageUnit ?? "km"}`
        : null,
    },
    { icon: "mdi-car-door", label: "هيكل السيارة", value: c.bodyType },
    {
      icon: "mdi-account-multiple",
      label: "عدد المقاعد",
      value: c.numberOfSeats ? `${c.numberOfSeats} مقاعد` : null,
    },
    { icon: "mdi-cog-transfer", label: "ناقل الحركة", value: c.transmission },
    { icon: "mdi-check-decagram", label: "الحالة", value: c.condition },
    { icon: "mdi-gas-station", label: "الوقود", value: c.fuelType },
    { icon: "mdi-engine", label: "حجم المحرك", value: c.engineSize },
    { icon: "mdi-palette", label: "اللون الخارجي", value: c.exteriorColor },
    { icon: "mdi-seat", label: "اللون الداخلي", value: c.interiorColor },
  ].filter((s) => s.value);
});

const contactIcon: Record<string, string> = {
  هاتف: "mdi-phone",
  واتساب: "mdi-whatsapp",
  تيليغرام: "mdi-telegram",
  إيميل: "mdi-email",
};

function getContactHref(label: string, value: string): string {
  if (label === "واتساب") return `https://wa.me/${value.replace(/\D/g, "")}`;
  if (label === "تيليغرام") return `https://t.me/${value}`;
  if (label === "إيميل") return `mailto:${value}`;
  return `tel:${value}`;
}

onMounted(async () => {
  try {
    const { data: envelope } = await shareService.getPublicCar(token);
    car.value = envelope.data;
    state.value = "ok";
  } catch (err: any) {
    const status = err?.response?.status;
    state.value =
      status === 404 ? "not-found" : status === 403 ? "expired" : "error";
  }
});
</script>

<template>
  <!-- ── Loading ─────────────────────────────────────────────────────── -->
  <div
    v-if="state === 'loading'"
    class="flex justify-center items-center h-screen"
  >
    <v-progress-circular indeterminate color="accent" size="52" />
  </div>

  <!-- ── Error States ─────────────────────────────────────────────────── -->
  <div
    v-else-if="state !== 'ok'"
    class="flex flex-col items-center justify-center text-center p-8 h-screen"
  >
    <v-avatar
      :color="state === 'expired' ? 'warning' : 'error'"
      variant="tonal"
      size="80"
      rounded="xl"
      class="mb-4"
    >
      <v-icon
        :icon="
          state === 'expired' ? 'mdi-clock-remove-outline' : 'mdi-link-off'
        "
        size="40"
      />
    </v-avatar>
    <h2 class="text-xl font-bold mb-2">
      {{ state === "expired" ? "الرابط غير فعّال" : "الرابط غير موجود" }}
    </h2>
    <p class="text-sm opacity-75">
      {{
        state === "expired"
          ? "هذا الرابط غير فعّال أو انتهت صلاحيته، تواصل مع المعرض للحصول على رابط جديد"
          : "الرابط الذي فتحته غير صحيح أو لم يعد موجوداً"
      }}
    </p>
  </div>

  <!-- ── Car View ──────────────────────────────────────────────────────── -->
  <div dir="rtl" v-else-if="car" class="min-h-screen bg-[var(--bg-app)]">
    <!-- Hero Header -->
    <div
      class="px-4 py-5 bg-gradient-to-r from-[#0d1b2a] to-[#1b263b] border-b-2 border-[#d4af37]/30"
    >
      <div class="flex items-center justify-between max-w-[680px] mx-auto">
        <div class="flex items-center gap-3">
          <div
            class="w-9 h-9 rounded-xl bg-[#d4af37]/15 border border-[#d4af37]/40 flex items-center justify-center"
          >
            <v-icon icon="mdi-car-sports" color="accent" size="20" />
          </div>
          <span class="text-[#fff] text-base font-bold"> معرض السيارات </span>
        </div>
        <v-chip
          color="accent"
          variant="flat"
          size="small"
          class="!text-[#0d1b2a] !font-bold"
        >
          للبيع
        </v-chip>
      </div>
    </div>

    <div class="max-w-[680px] mx-auto px-4 pb-10">
      <!-- Image Gallery -->
      <div class="mt-4 mb-5">
        <!-- Main image -->
        <div class="bg-gray-500/10 rounded-xl overflow-hidden mb-2">
          <v-img
            v-if="formattedImages.length"
            :src="formattedImages[activeImage]"
            height="300"
            cover
            class="w-full"
          />
          <div
            v-else
            class="flex items-center justify-center h-[300px] bg-gray-500/10"
          >
            <v-icon icon="mdi-car" size="80" color="grey" />
          </div>
        </div>

        <!-- Thumbnails -->
        <div
          v-if="formattedImages.length > 1"
          class="flex gap-2 overflow-x-auto pb-1"
        >
          <div
            v-for="(img, i) in formattedImages"
            :key="i"
            class="cursor-pointer rounded-lg overflow-hidden flex-shrink-0 transition-all outline outline-2"
            :class="
              activeImage === i
                ? 'opacity-100 outline-[#d4af37]'
                : 'opacity-60 outline-transparent'
            "
            @click="activeImage = i"
          >
            <v-img :src="img" width="72" height="56" cover />
          </div>
        </div>
      </div>

      <!-- Title & Price -->
      <div class="mb-5">
        <h1 class="text-xl font-bold mb-2">{{ car.title }}</h1>
        <div
          class="inline-flex items-center gap-2 bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-xl px-3.5 py-1.5"
        >
          <v-icon icon="mdi-tag" color="accent" size="18" />
          <span class="text-xl font-bold text-gold">
            {{
              new Intl.NumberFormat("ar-LY", {
                style: "currency",
                currency: "LYD",
                maximumFractionDigits: 0,
              }).format(car.sellingPrice)
            }}
          </span>
        </div>
      </div>

      <!-- Specs Grid -->
      <v-card class="app-card pa-4 mb-5">
        <div class="flex items-center gap-2 mb-4">
          <v-icon icon="mdi-format-list-bulleted" color="accent" size="18" />
          <span class="font-bold">المواصفات</span>
        </div>
        <v-row dense>
          <v-col v-for="spec in specGroups" :key="spec.label" cols="6" sm="4">
            <div
              class="bg-gray-500/10 hover:bg-[#d4af37]/10 transition-colors p-3 rounded-lg flex items-start gap-2"
            >
              <v-icon :icon="spec.icon" color="accent" size="18" class="mt-1" />
              <div>
                <span class="font-bold block">{{ spec.label }}</span>
                <span class="font-weight-medium">{{ spec.value }}</span>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-card>

      <!-- Features -->
      <v-card
        v-if="
          car.features &&
          (car.features.technology?.length ||
            car.features.interior?.length ||
            car.features.exterior?.length)
        "
        class="app-card pa-4 mb-5"
      >
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
                class="text-xs font-bold text-gray dark:text-gray/70 sm:w-20 text-nowrap"
                >الأنظمة الرقمية:</span
              >
              <div class="flex flex-wrap gap-3">
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
                class="text-xs font-bold text-gray dark:text-gray/70 sm:w-20 text-nowrap"
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
                class="text-xs font-bold text-gray dark:text-gray/70 sm:w-20 text-nowrap"
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

      <!-- Contact -->
      <v-card class="app-card pa-4">
        <div class="flex items-center gap-2 mb-4">
          <v-icon icon="mdi-phone-outline" color="accent" size="18" />
          <span class="font-weight-bold">تواصل معنا</span>
        </div>

        <div v-if="car.contactAddress" class="flex items-center gap-2 mb-4">
          <v-icon icon="mdi-map-marker-outline" color="grey" size="16" />
          <span class="text-body-2 text-medium-emphasis">{{
            car.contactAddress
          }}</span>
        </div>

        <div class="flex flex-col gap-3">
          <a
            v-for="contact in car.contacts"
            :key="contact.label + contact.value"
            :href="getContactHref(contact.label, contact.value)"
            target="_blank"
            class="text-decoration-none"
          >
            <v-btn
              :prepend-icon="contactIcon[contact.label] ?? 'mdi-phone'"
              :color="
                contact.label === 'واتساب'
                  ? 'success'
                  : contact.label === 'تيليغرام'
                    ? 'info'
                    : 'accent'
              "
              variant="tonal"
              block
              rounded="lg"
              class="!normal-case !font-semibold !text-[15px]"
            >
              {{ contact.label }}: {{ contact.value }}
            </v-btn>
          </a>
        </div>
      </v-card>
    </div>
  </div>
</template>
