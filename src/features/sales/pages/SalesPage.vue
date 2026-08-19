<script setup lang="ts">
import { onMounted, reactive, ref, computed } from "vue";
import { useSaleStore } from "../store/sale.store";
import { useCarStore } from "@/features/cars/store/car.store";
import { useCustomerStore } from "@/features/customers/store/customer.store";
import AppModal from "@/shared/components/AppModal.vue";
import {
  formatCurrency,
  formatDate,
  resolveImageUrl,
} from "@/core/utils/formatters";
import type { SaleCreateDto } from "../models/sale.model";

interface CarOptionItem {
  value: number;
  title: string;
  brand: string;
  model: string;
  year: number;
  sellingPrice: number;
  mileage: number;
  mileageUnit: string;
  imageUrl: string;
}

const saleStore = useSaleStore();
const carStore = useCarStore();
const customerStore = useCustomerStore();

const dialogOpen = ref(false);
const saving = ref(false);
const formValid = ref(false);

const form = reactive<SaleCreateDto>({
  carId: 0,
  customerId: 0,
  soldPrice: 0,
  soldDate: new Date().toISOString().substring(0, 10),
  notes: "",
});

const rules = {
  required: (v: unknown) =>
    (v !== null && v !== undefined && v !== "" && v !== 0) || "هذا الحقل مطلوب",
};

const carDetailsDialog = ref(false);
const selectedCarDetail = ref<CarOptionItem | null>(null);

const carOptions = computed<CarOptionItem[]>(() =>
  carStore.cars
    .filter((c) => c.statusName !== "Sold")
    .map((c) => ({
      value: c.id,
      title: `${c.brand} ${c.model} (${c.year})`,
      brand: c.brand,
      model: c.model,
      year: c.year,
      sellingPrice: c.sellingPrice,
      mileage: c.mileage ?? 0,
      mileageUnit: c.mileageUnit ?? "km",
      imageUrl: c.primaryImageUrl ?? "",
    })),
);
const customerOptions = computed(() =>
  customerStore.customers.map((c) => ({ value: c.id, title: c.name })),
);

function openCarDetails(car: CarOptionItem) {
  selectedCarDetail.value = car;
  carDetailsDialog.value = true;
}

onMounted(() => {
  saleStore.fetchSales();
  carStore.fetchCars();
  customerStore.fetchCustomers();
});

async function handleSave() {
  if (!formValid.value) return;
  saving.value = true;
  try {
    await saleStore.createSale({ ...form });
    dialogOpen.value = false;
  } finally {
    saving.value = false;
  }
}

const headers = [
  { title: "السيارة", key: "carTitle" },
  { title: "العميل", key: "customerName" },
  { title: "سعر البيع", key: "soldPrice" },
  { title: "الربح", key: "profit" },
  { title: "التاريخ", key: "soldDate" },
];
</script>

<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <div class="d-flex align-center ga-3 mb-1">
          <v-avatar color="accent" rounded="lg" size="40">
            <v-icon icon="mdi-cash-register" color="white" size="22" />
          </v-avatar>
          <span class="text-2xl font-bold"> المبيعات </span>
        </div>
        <span class="text-sm text-medium-emphasis">
          تسجيل وعرض عمليات البيع
        </span>
      </div>
      <v-btn
        color="accent"
        prepend-icon="mdi-plus"
        rounded="lg"
        style="text-transform: none; font-weight: 600"
        @click="dialogOpen = true"
      >
        تسجيل عملية بيع
      </v-btn>
    </div>

    <v-card class="app-card" no-padding>
      <v-data-table
        :headers="headers"
        :items="saleStore.sales"
        :loading="saleStore.loading"
        no-data-text="لا توجد مبيعات حتى الآن"
      >
        <template #item.soldPrice="{ item }">{{
          formatCurrency(item.soldPrice)
        }}</template>
        <template #item.profit="{ item }">
          <span
            :class="item.profit >= 0 ? 'text-success' : 'text-error'"
            class="font-weight-bold"
          >
            {{ formatCurrency(item.profit) }}
          </span>
        </template>
        <template #item.soldDate="{ item }">{{
          formatDate(item.soldDate)
        }}</template>
      </v-data-table>
    </v-card>

    <AppModal v-model="dialogOpen" title="تسجيل عملية بيع">
      <v-form v-model="formValid" @submit.prevent="handleSave">
        <v-autocomplete
          v-model="form.carId"
          :items="carOptions"
          item-title="title"
          item-value="value"
          label="السيارة"
          :rules="[rules.required]"
          variant="outlined"
          density="comfortable"
          rounded="lg"
          prepend-inner-icon="mdi-magnify"
          clearable
          class="mb-2"
          :menu-props="{ maxHeight: 320 }"
        >
          <template #item="{ item, props }">
            <v-list-item v-bind="props" class="px-2">
              <template #prepend>
                <v-avatar size="42" rounded="lg" class="me-2">
                  <v-img
                    v-if="item.raw.imageUrl"
                    :src="resolveImageUrl(item.raw.imageUrl)"
                    cover
                  />
                  <v-icon v-else icon="mdi-car" color="grey-darken-1" />
                </v-avatar>
              </template>
              <template #title>
                <div class="font-weight-medium">{{ item.raw.title }}</div>
              </template>
              <template #subtitle>
                <div class="d-flex flex-column gap-1 mt-1">
                  <div class="font-weight-medium text-primary">
                    سعر البيع: {{ formatCurrency(item.raw.sellingPrice) }}
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    <v-icon size="14" class="me-1" color="grey-darken-1">
                      mdi-speedometer
                    </v-icon>
                    {{
                      item.raw.mileage ? item.raw.mileage.toLocaleString() : "0"
                    }}
                    {{ item.raw.mileageUnit || "km" }}
                  </div>
                </div>
              </template>
              <template #append>
                <v-btn
                  icon="mdi-information-outline"
                  size="small"
                  variant="text"
                  color="primary"
                  @click.stop="openCarDetails(item.raw)"
                />
              </template>
            </v-list-item>
          </template>
          <template #selection="{ item }">
            <div class="d-flex align-center gap-2">
              <v-avatar size="28" rounded="lg">
                <v-img
                  v-if="item.raw.imageUrl"
                  :src="item.raw.imageUrl"
                  cover
                />
                <v-icon v-else icon="mdi-car" size="18" />
              </v-avatar>
              <span>{{ item.raw.title }}</span>
            </div>
          </template>
        </v-autocomplete>
        <v-autocomplete
          v-model="form.customerId"
          :items="customerOptions"
          item-title="title"
          item-value="value"
          label="العميل"
          :rules="[rules.required]"
          variant="outlined"
          density="comfortable"
          rounded="lg"
          prepend-inner-icon="mdi-account-search"
          clearable
          class="mb-2"
        />
        <v-text-field
          v-model.number="form.soldPrice"
          label="سعر البيع"
          type="number"
          :rules="[rules.required]"
          variant="outlined"
          density="comfortable"
          rounded="lg"
          prefix="$"
          class="mb-2"
        />
        <v-text-field
          v-model="form.soldDate"
          label="تاريخ البيع"
          type="date"
          variant="outlined"
          density="comfortable"
          rounded="lg"
          class="mb-2"
        />
        <v-textarea
          v-model="form.notes"
          label="ملاحظات"
          variant="outlined"
          density="comfortable"
          rounded="lg"
          rows="2"
        />
      </v-form>
      <template #actions>
        <v-spacer />
        <v-btn variant="text" @click="dialogOpen = false">إلغاء</v-btn>
        <v-btn color="accent" :loading="saving" @click="handleSave">حفظ</v-btn>
      </template>
    </AppModal>

    <v-dialog v-model="carDetailsDialog" max-width="480">
      <v-card v-if="selectedCarDetail">
        <v-card-title class="d-flex align-center justify-space-between">
          <span>تفاصيل السيارة</span>
          <v-btn
            icon="mdi-close"
            variant="text"
            @click="carDetailsDialog = false"
          />
        </v-card-title>
        <v-card-text>
          <div class="d-flex align-center gap-3 mb-3">
            <v-avatar size="72" rounded="lg">
              <v-img
                v-if="selectedCarDetail.imageUrl"
                :src="resolveImageUrl(selectedCarDetail.imageUrl)"
                cover
              />
              <v-icon v-else icon="mdi-car" size="32" />
            </v-avatar>
            <div>
              <div class="font-weight-bold">
                {{ selectedCarDetail.brand }} {{ selectedCarDetail.model }} ({{
                  selectedCarDetail.year
                }})
              </div>
              <div class="text-sm text-medium-emphasis">
                سعر البيع: {{ formatCurrency(selectedCarDetail.sellingPrice) }}
              </div>
            </div>
          </div>
          <div class="text-sm">
            <div>
              الكيلومترات:
              {{
                selectedCarDetail.mileage
                  ? selectedCarDetail.mileage.toLocaleString()
                  : "0"
              }}
              {{ selectedCarDetail.mileageUnit || "km" }}
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>
