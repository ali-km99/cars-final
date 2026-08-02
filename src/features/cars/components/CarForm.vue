<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useFeatureStore } from "../store/feature.store";
import type { CarCreateDto } from "../models/car.model";

type CarFormInitialValue = Partial<CarCreateDto> & {
  features?: {
    technology?: string[];
    interior?: string[];
    exterior?: string[];
  };
};

const props = defineProps<{
  initialValue?: CarFormInitialValue;
  loading?: boolean;
}>();

const emit = defineEmits<{
  submit: [CarCreateDto, File[]];
}>();

const formValid = ref(false);
const images = ref<File[]>([]);
const currentTab = ref(0);
const featureStore = useFeatureStore();

const selectedFeatureIds = computed({
  get: () => form.featureIds || [],
  set: (value: number[]) => {
    form.featureIds = value;
  },
});

function getFeatureIdsFromInitialValue(value?: CarFormInitialValue) {
  const featureNames = new Set<string>([
    ...(value?.features?.technology || []),
    ...(value?.features?.interior || []),
    ...(value?.features?.exterior || []),
  ]);

  return featureStore.features
    .filter((feature) => {
      const normalizedName = feature.name?.trim().toLowerCase();
      return normalizedName
        ? featureNames.has(normalizedName) ||
            featureNames.has(feature.name || "")
        : false;
    })
    .map((feature) => feature.id);
}

function syncFormFromInitialValue(value?: CarFormInitialValue) {
  if (!value) {
    form.featureIds = [];
    return;
  }

  Object.assign(form, value);

  if (value.features && Object.keys(value.features).length) {
    form.featureIds = getFeatureIdsFromInitialValue(value);
  } else if (Array.isArray(value.featureIds)) {
    form.featureIds = value.featureIds;
  } else {
    form.featureIds = [];
  }
}

// الحالة الابتدائية للفورم
const form = reactive<CarCreateDto>({
  brand: props.initialValue?.brand || "",
  model: props.initialValue?.model || "",
  year: props.initialValue?.year || new Date().getFullYear(),
  color: props.initialValue?.color || "",
  costPrice: props.initialValue?.costPrice || 0,
  shippingCost: props.initialValue?.shippingCost || 0,
  sellingPrice: props.initialValue?.sellingPrice || 0,
  statusId: props.initialValue?.statusId || 1,
  notes: props.initialValue?.notes || "",
  exteriorColor: props.initialValue?.exteriorColor || "",
  interiorColor: props.initialValue?.interiorColor || "",
  bodyCondition: props.initialValue?.bodyCondition || "",
  bodyType: props.initialValue?.bodyType || "",
  condition: props.initialValue?.condition || "",
  engineSize: props.initialValue?.engineSize || null,
  fuelType: props.initialValue?.fuelType || null,
  mileage: props.initialValue?.mileage || null,
  specs: props.initialValue?.specs || null,
  mileageUnit: props.initialValue?.mileageUnit || "KM",
  numberOfSeats: props.initialValue?.numberOfSeats || null,
  vinNumber: props.initialValue?.vinNumber || null,
  transmission: props.initialValue?.transmission || null,
  featureIds: props.initialValue?.featureIds || [],
  hasCustomsClearance: props.initialValue?.hasCustomsClearance || false,
  hasInsurance: props.initialValue?.hasInsurance || false,
  hasLicense: props.initialValue?.hasLicense || false,
});

watch(
  () => props.initialValue,
  (val) => {
    syncFormFromInitialValue(val);
  },
  { deep: true },
);

watch(
  () => featureStore.features,
  () => {
    if (props.initialValue?.features) {
      form.featureIds = getFeatureIdsFromInitialValue(props.initialValue);
    }
  },
  { deep: true },
);

onMounted(() => {
  featureStore.fetchFeatures();
});

// الخيارات الثابتة
const statusOptions = [
  { value: 1, title: "جاهزة" },
  { value: 2, title: "تحت الصيانة" },
  { value: 3, title: "قيد الشحن" },
  { value: 4, title: "مباعة" },
];

const transmissionOptions = [
  { value: "Automatic", title: "أوتوماتيك" },
  { value: "Manual", title: "عادي / مانيوال" },
  { value: "CVT", title: "سي في تي (CVT)" },
];

const conditionOptions = [
  { value: "New", title: "جديدة" },
  { value: "Used", title: "مستعملة" },
  { value: "Like New", title: "شبه جديدة" },
];

const fuelTypeOptions = [
  { value: "Petrol", title: "بنزين" },
  { value: "Diesel", title: "ديزل" },
  { value: "Hybrid", title: "هجين (Hybrid)" },
  { value: "Electric", title: "كهربائية بالكامل" },
];

const specsOptions = [
  { value: "Korean", title: "كوري" },
  { value: "USA", title: "أمريكي" },
  { value: "Gulf", title: "خليجي" },
  { value: "European", title: "أوروبي" },
  { value: "Japanese", title: "ياباني" },
];

const mileageUnitOptions = [
  { value: "KM", title: "كيلومتر" },
  { value: "MI", title: "ميل" },
];

// شروط التحقق (Validation)
const currentYear = new Date().getFullYear();
const rules = {
  required: (v: unknown) =>
    (v !== null && v !== undefined && v !== "") || "هذا الحقل مطلوب",
  maxLen: (max: number) => (v: string) =>
    !v || v.length <= max || `يجب ألا يتجاوز طول النص ${max} حرفاً`,
  yearRange: (v: number) =>
    !v ||
    (v >= 1990 && v <= currentYear + 1) ||
    `السنة يجب أن تكون بين 1990 و ${currentYear + 1}`,
  costPriceGT: (v: number) =>
    (v !== null && v > 0) || "يجب أن يكون سعر التكلفة أكبر من 0",
  shippingCostGTE: (v: number) =>
    (v !== null && v >= 0) || "يجب أن تكون تكلفة الشحن 0 أو أكثر",
  sellingPriceGT: (v: number) =>
    (v !== null && v > 0) || "يجب أن يكون سعر البيع أكبر من 0",
  vinExact: (v: string) =>
    !v || v.length === 17 || "رقم الشاصي (VIN) يجب أن يتكون من 17 خانة بالضبط",
  engineSizeGT: (v: number) =>
    !v || v > 0 || "حجم المحرك يجب أن يكون أكبر من 0",
  seatsRange: (v: number) =>
    !v || (v >= 1 && v <= 20) || "عدد المقاعد يجب أن يكون بين 1 و 20 مقعداً",
};

function handleSubmit() {
  if (!formValid.value) return;
  emit("submit", { ...form }, images.value);
}
</script>

<template>
  <v-form
    v-model="formValid"
    lazy-validation
    @submit.prevent="handleSubmit"
    class="p-4 md:p-6 rounded-2xl"
  >
    <v-tabs
      v-model="currentTab"
      bg-color="transparent"
      color="primary"
      grow
      class="mb-6 border-b border-slate-200"
    >
      <v-tab :value="0" class="font-bold text-base">
        <v-icon start icon="mdi-car-info" /> البيانات الأساسية
      </v-tab>
      <v-tab :value="1" class="font-bold text-base">
        <v-icon start icon="mdi-engine" /> المواصفات الفنية
      </v-tab>
      <v-tab :value="2" class="font-bold text-base">
        <v-icon start icon="mdi-car-info" /> الإجرائات القانونية/ كماليات
        السيارة
      </v-tab>
      <v-tab :value="3" class="font-bold text-base">
        <v-icon start icon="mdi-cash-multiple" /> البيانات المالية والإضافية
      </v-tab>
    </v-tabs>

    <v-window v-model="currentTab">
      <v-window-item :value="0">
        <div class="p-6 rounded-xl bg-white shadow-sm border border-slate-100">
          <v-row dense>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.brand"
                label="الماركة (Brand)"
                :rules="[rules.required, rules.maxLen(100)]"
                prepend-inner-icon="mdi-car-box"
                variant="outlined"
                density="comfortable"
                rounded="lg"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.model"
                label="الموديل (Model)"
                :rules="[rules.required, rules.maxLen(100)]"
                prepend-inner-icon="mdi-car-info"
                variant="outlined"
                density="comfortable"
                rounded="lg"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model.number="form.year"
                label="سنة الصنع"
                type="number"
                :rules="[rules.required, rules.yearRange]"
                prepend-inner-icon="mdi-calendar-range"
                variant="outlined"
                density="comfortable"
                rounded="lg"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="form.exteriorColor"
                label="اللون الخارجي"
                :rules="[rules.required, rules.maxLen(50)]"
                prepend-inner-icon="mdi-palette"
                variant="outlined"
                density="comfortable"
                rounded="lg"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="form.interiorColor"
                label="اللون الداخلي"
                :rules="[rules.maxLen(50)]"
                prepend-inner-icon="mdi-palette-swatch-outline"
                variant="outlined"
                density="comfortable"
                rounded="lg"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                v-model="form.statusId"
                :items="statusOptions"
                label="حالة السيارة في النظام"
                :rules="[rules.required]"
                prepend-inner-icon="mdi-list-status"
                variant="outlined"
                density="comfortable"
                rounded="lg"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.vinNumber"
                label="رقم الشاصي (VIN)"
                :rules="[rules.vinExact]"
                prepend-inner-icon="mdi-numeric-7-box-outline"
                variant="outlined"
                density="comfortable"
                rounded="lg"
                counter="17"
              />
            </v-col>
          </v-row>
        </div>
      </v-window-item>

      <v-window-item :value="1">
        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <v-row dense>
            <v-col cols="12" md="4">
              <v-select
                v-model="form.transmission"
                :items="transmissionOptions"
                label="ناقل الحركة"
                prepend-inner-icon="mdi-car-shift-pattern"
                variant="outlined"
                density="comfortable"
                rounded="lg"
                clearable
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-select
                v-model="form.condition"
                :items="conditionOptions"
                label="حالة الاستخدام"
                prepend-inner-icon="mdi-star-check-outline"
                variant="outlined"
                density="comfortable"
                rounded="lg"
                clearable
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-select
                v-model="form.fuelType"
                :items="fuelTypeOptions"
                label="نوع الوقود"
                prepend-inner-icon="mdi-gas-station"
                variant="outlined"
                density="comfortable"
                rounded="lg"
                clearable
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-select
                v-model="form.specs"
                :items="specsOptions"
                label="المواصفات / الاستيراد"
                prepend-inner-icon="mdi-earth"
                variant="outlined"
                density="comfortable"
                rounded="lg"
                clearable
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model.number="form.engineSize"
                label="حجم المحرك (مثال: 2.0)"
                type="number"
                step="0.1"
                :rules="[rules.engineSizeGT]"
                prepend-inner-icon="mdi-engine-outline"
                variant="outlined"
                density="comfortable"
                rounded="lg"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model.number="form.numberOfSeats"
                label="عدد المقاعد"
                type="number"
                :rules="[rules.seatsRange]"
                prepend-inner-icon="mdi-car-seat"
                variant="outlined"
                density="comfortable"
                rounded="lg"
              />
            </v-col>

            <v-col cols="12" md="8">
              <v-text-field
                v-model.number="form.mileage"
                label="المسافة المقطوعة (العداد)"
                type="number"
                prepend-inner-icon="mdi-speedometer"
                variant="outlined"
                density="comfortable"
                rounded="lg"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-select
                v-model="form.mileageUnit"
                :items="mileageUnitOptions"
                label="الوحدة"
                variant="outlined"
                density="comfortable"
                rounded="lg"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.bodyType"
                label="نوع الهيكل (سيدان، SUV...)"
                prepend-inner-icon="mdi-car-sports"
                variant="outlined"
                density="comfortable"
                rounded="lg"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.bodyCondition"
                label="حالة الهيكل الخارجي"
                prepend-inner-icon="mdi-car-wrench"
                variant="outlined"
                density="comfortable"
                rounded="lg"
              />
            </v-col>
          </v-row>
        </div>
      </v-window-item>
      <v-window-item :value="2">
        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div class="mb-4">
            <h3 class="text-lg font-bold text-slate-800">
              الإجراءات القانونية
            </h3>
            <p class="text-sm text-slate-500">
              حدد الحالة القانونية للسيارة والوثائق المرتبطة بها
            </p>
          </div>
          <v-row dense>
            <v-col cols="12" md="4">
              <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <v-switch
                  v-model="form.hasCustomsClearance"
                  color="success"
                  :base-color="form.hasCustomsClearance ? 'success' : 'error'"
                  inset
                  hide-details
                >
                  <template #label>
                    <div class="flex items-center gap-2">
                      <v-icon
                        :color="form.hasCustomsClearance ? 'success' : 'error'"
                        size="18"
                      >
                        {{
                          form.hasCustomsClearance
                            ? "mdi-archive-check"
                            : "mdi-archive-arrow-down"
                        }}
                      </v-icon>
                      <span class="font-medium text-slate-700"
                        >التخليص الجمركي</span
                      >
                      <v-icon
                        :color="form.hasCustomsClearance ? 'success' : 'error'"
                        size="18"
                      >
                        {{
                          form.hasCustomsClearance
                            ? "mdi-check-circle"
                            : "mdi-close-circle"
                        }}
                      </v-icon>
                    </div>
                  </template>
                </v-switch>
              </div>
            </v-col>

            <v-col cols="12" md="4">
              <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <v-switch
                  v-model="form.hasInsurance"
                  color="success"
                  :base-color="form.hasInsurance ? 'success' : 'error'"
                  inset
                  hide-details
                >
                  <template #label>
                    <div class="flex items-center gap-2">
                      <v-icon
                        :color="form.hasInsurance ? 'success' : 'error'"
                        size="18"
                      >
                        {{
                          form.hasInsurance
                            ? "mdi-shield-check"
                            : "mdi-shield-off"
                        }}
                      </v-icon>
                      <span class="font-medium text-slate-700">التأمين</span>
                      <v-icon
                        :color="form.hasInsurance ? 'success' : 'error'"
                        size="18"
                      >
                        {{
                          form.hasInsurance
                            ? "mdi-check-circle"
                            : "mdi-close-circle"
                        }}
                      </v-icon>
                    </div>
                  </template>
                </v-switch>
              </div>
            </v-col>

            <v-col cols="12" md="4">
              <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <v-switch
                  v-model="form.hasLicense"
                  color="success"
                  :base-color="form.hasLicense ? 'success' : 'error'"
                  inset
                  hide-details
                >
                  <template #label>
                    <div class="flex items-center gap-2">
                      <v-icon
                        :color="form.hasLicense ? 'success' : 'error'"
                        size="18"
                      >
                        {{
                          form.hasLicense
                            ? "mdi-card-account-details"
                            : "mdi-card-account-details-outline"
                        }}
                      </v-icon>
                      <span class="font-medium text-slate-700"
                        >تسجيل السيارة</span
                      >
                      <v-icon
                        :color="form.hasLicense ? 'success' : 'error'"
                        size="18"
                      >
                        {{
                          form.hasLicense
                            ? "mdi-check-circle"
                            : "mdi-close-circle"
                        }}
                      </v-icon>
                    </div>
                  </template>
                </v-switch>
              </div>
            </v-col>

            <v-col cols="12">
              <div class="mb-2">
                <p class="text-sm font-semibold text-slate-700">
                  الكماليات / المميزات
                </p>
                <p class="text-xs text-slate-500">
                  اختر المزايا الإضافية التي تتوفر في السيارة
                </p>
              </div>
              <v-select
                v-model="selectedFeatureIds"
                :items="featureStore.features"
                item-title="name"
                item-value="id"
                label="الكماليات / المميزات"
                multiple
                chips
                clearable
                prepend-inner-icon="mdi-star-cog"
                variant="outlined"
                density="comfortable"
                rounded="lg"
                :loading="featureStore.loading"
                :hint="
                  featureStore.features.length
                    ? 'اختر الكماليات التي ترغب في ربطها بالسيارة'
                    : 'جارٍ تحميل الكماليات...'
                "
                persistent-hint
              />
            </v-col>
          </v-row>
        </div>
      </v-window-item>

      <v-window-item :value="3">
        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <v-row dense>
            <v-col cols="12" md="4">
              <v-text-field
                v-model.number="form.costPrice"
                label="سعر التكلفة"
                type="number"
                :rules="[rules.required, rules.costPriceGT]"
                prepend-inner-icon="mdi-currency-usd"
                variant="outlined"
                density="comfortable"
                rounded="lg"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model.number="form.shippingCost"
                label="تكلفة الشحن"
                type="number"
                :rules="[rules.shippingCostGTE]"
                prepend-inner-icon="mdi-truck-delivery-outline"
                variant="outlined"
                density="comfortable"
                rounded="lg"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model.number="form.sellingPrice"
                label="سعر البيع المقترح"
                type="number"
                :rules="[rules.required, rules.sellingPriceGT]"
                prepend-inner-icon="mdi-cash-check"
                variant="outlined"
                density="comfortable"
                rounded="lg"
              />
            </v-col>

            <v-col cols="12">
              <v-textarea
                v-model="form.notes"
                label="ملاحظات وتفاصيل إضافية عن السيارة"
                prepend-inner-icon="mdi-note-text-outline"
                variant="outlined"
                density="comfortable"
                rounded="lg"
                rows="3"
              />
            </v-col>

            <v-col cols="12">
              <v-file-input
                v-model="images"
                label="ألبوم صور السيارة"
                multiple
                accept="image/*"
                prepend-inner-icon="mdi-camera-plus-outline"
                variant="outlined"
                density="comfortable"
                rounded="lg"
                show-size
                chips
                class="bg-slate-50 border-dashed border-2 border-slate-200 rounded-lg"
              />
            </v-col>
          </v-row>
        </div>
      </v-window-item>
    </v-window>

    <div
      class="flex justify-between items-center mt-6 pt-4 border-t border-slate-200"
    >
      <div>
        <v-btn
          v-if="currentTab > 0"
          variant="outlined"
          color="secondary"
          rounded="lg"
          @click="currentTab--"
        >
          السابق
        </v-btn>
      </div>

      <div class="flex gap-2">
        <v-btn
          v-if="currentTab < 2"
          color="primary"
          rounded="lg"
          @click="currentTab++"
        >
          التالي
        </v-btn>

        <v-btn
          v-if="currentTab === 2"
          type="submit"
          color="success"
          size="large"
          rounded="lg"
          :loading="loading"
          :disabled="!formValid"
          class="px-8 font-weight-bold"
          prepend-icon="mdi-content-save-check"
        >
          حفظ وإدخال السيارة
        </v-btn>
      </div>
    </div>
  </v-form>
</template>

<style scoped>
:deep(.v-field__prepend-inner .v-icon) {
  color: #64748b !important;
}
</style>
