<script setup lang="ts">
import { onMounted, reactive, ref, computed } from "vue";
import { useMaintenanceStore } from "../store/maintenance.store";
import { useCarStore } from "@/features/cars/store/car.store";
import AppModal from "@/shared/components/AppModal.vue";
import {
  formatCurrency,
  formatDate,
  resolveImageUrl,
} from "@/core/utils/formatters";
import type { MaintenanceCreateDto } from "../models/maintenance.model";

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

const maintenanceStore = useMaintenanceStore();
const carStore = useCarStore();

const dialogOpen = ref(false);
const saving = ref(false);
const formValid = ref(false);
const selectedCarId = ref<number | null>(null);

const form = reactive<MaintenanceCreateDto>({
  carId: 0,
  issueDescription: "",
  repairCost: 0,
});
const editDialogOpen = ref(false);
const updating = ref(false);

const editForm = reactive({
  id: 0,
  carId: 0,
  issueDescription: "",
  repairCost: 0,
});
const rules = {
  required: (v: unknown) =>
    (v !== null && v !== undefined && v !== "" && v !== 0) || "هذا الحقل مطلوب",
};
function openEditModal(item: any) {
  editForm.id = item.id;
  editForm.carId = item.carId;
  editForm.issueDescription = item.issueDescription;
  editForm.repairCost = item.repairCost;

  editDialogOpen.value = true;
}

async function handleUpdate() {
  if (!formValid.value) return;

  updating.value = true;

  try {
    await maintenanceStore.updateMaintenance(
      editForm.id,
      {
        issueDescription: editForm.issueDescription,
        repairCost: editForm.repairCost,
      },
      editForm.carId,
    );

    editDialogOpen.value = false;
  } finally {
    updating.value = false;
  }
}
const carOptions = computed<CarOptionItem[]>(() =>
  carStore.cars.map((c) => ({
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

onMounted(async () => {
  await carStore.fetchCars();
  if (carStore.cars.length) {
    selectedCarId.value = carStore.cars[0].id;
    maintenanceStore.fetchByCarId(selectedCarId.value);
  }
});

function handleCarChange(carId: number | null) {
  if (!carId) {
    selectedCarId.value = null;
    maintenanceStore.resetMaintenances();
    return;
  }

  selectedCarId.value = carId;
  maintenanceStore.resetMaintenances();
  maintenanceStore.fetchByCarId(carId);
}

function onDelete(id: number) {
  if (!confirm("هل أنت متأكد من حذف سجل الصيانة؟")) return;

  if (!selectedCarId.value) return;

  maintenanceStore.deleteMaintenance(selectedCarId.value, id);
}

async function handleSave() {
  if (!formValid.value) return;
  saving.value = true;
  try {
    await maintenanceStore.createMaintenance({ ...form }, form.carId);
    dialogOpen.value = false;
    form.issueDescription = "";
    form.repairCost = 0;
    if (selectedCarId.value === form.carId) {
      maintenanceStore.fetchByCarId(form.carId);
    }
  } finally {
    saving.value = false;
  }
}

const headers = [
  { title: "وصف العطل", key: "issueDescription" },
  { title: "تكلفة الإصلاح", key: "repairCost" },
  { title: "التاريخ", key: "createdAt" },
  { title: "إجراءات", key: "actions", sortable: false },
];
</script>

<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <div class="d-flex align-center ga-3 mb-1">
          <v-avatar color="accent" rounded="lg" size="40">
            <v-icon icon="mdi-car-cog" color="white" size="22" />
          </v-avatar>
          <span class="text-2xl font-bold"> الصيانة </span>
        </div>
        <span class="text-sm text-medium-emphasis"> سجل صيانة السيارات </span>
      </div>
      <v-btn
        color="accent"
        prepend-icon="mdi-plus"
        rounded="lg"
        style="text-transform: none; font-weight: 600"
        @click="dialogOpen = true"
      >
        إضافة صيانة
      </v-btn>
    </div>

    <v-card class="app-card pa-4 mb-5">
      <v-autocomplete
        :model-value="selectedCarId"
        :items="carOptions"
        item-title="title"
        item-value="value"
        label="اختر السيارة لعرض سجل صيانتها"
        variant="outlined"
        density="comfortable"
        rounded="lg"
        hide-details
        prepend-inner-icon="mdi-magnify"
        clearable
        :menu-props="{ maxHeight: 320 }"
        @update:model-value="handleCarChange"
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
                <div class="text-caption font-weight-medium text-primary">
                  سعر السيارة: {{ formatCurrency(item.raw.sellingPrice) }}
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
          </v-list-item>
        </template>
        <template #selection="{ item }">
          <div class="d-flex align-center gap-2">
            <v-avatar size="28" rounded="lg">
              <v-img v-if="item.raw.imageUrl" :src="item.raw.imageUrl" cover />
              <v-icon v-else icon="mdi-car" size="18" />
            </v-avatar>
            <span>{{ item.raw.title }}</span>
          </div>
        </template>
      </v-autocomplete>
    </v-card>

    <v-card class="app-card" no-padding>
      <v-data-table
        :key="selectedCarId ?? 'none'"
        :headers="headers"
        :items="maintenanceStore.maintenances"
        :loading="maintenanceStore.loading"
        :no-data-text="
          selectedCarId
            ? 'لا يوجد سجل صيانة لهذه السيارة'
            : 'اختر سيارة لعرض سجل الصيانة'
        "
      >
        <template #item.repairCost="{ item }">{{
          formatCurrency(item.repairCost)
        }}</template>
        <template #item.createdAt="{ item }">{{
          formatDate(item.createdAt)
        }}</template>
        <template #item.actions="{ item }">
          <v-btn
            icon="mdi-pencil"
            color="primary"
            variant="text"
            @click="openEditModal(item)"
          />
          <v-btn
            icon="mdi-delete"
            color="error"
            variant="text"
            @click="onDelete(item.id)"
          />
        </template>
      </v-data-table>
    </v-card>

    <AppModal v-model="dialogOpen" title="إضافة سجل صيانة">
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
          class="mb-2"
          prepend-inner-icon="mdi-magnify"
          clearable
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
                  <div class="text-caption font-weight-medium text-primary">
                    سعر السيارة: {{ formatCurrency(item.raw.sellingPrice) }}
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
        <v-textarea
          v-model="form.issueDescription"
          label="وصف العطل"
          :rules="[rules.required]"
          variant="outlined"
          density="comfortable"
          rounded="lg"
          rows="3"
          class="mb-2"
        />
        <v-text-field
          v-model.number="form.repairCost"
          label="تكلفة الإصلاح"
          type="number"
          :rules="[rules.required]"
          variant="outlined"
          density="comfortable"
          rounded="lg"
          prefix="$"
        />
      </v-form>
      <template #actions>
        <v-spacer />
        <v-btn variant="text" @click="dialogOpen = false">إلغاء</v-btn>
        <v-btn color="accent" :loading="saving" @click="handleSave">حفظ</v-btn>
      </template>
    </AppModal>
    <AppModal v-model="editDialogOpen" title="تعديل سجل الصيانة">
      <v-form v-model="formValid" @submit.prevent="handleUpdate">
        <v-textarea
          v-model="editForm.issueDescription"
          label="وصف العطل"
          :rules="[rules.required]"
          variant="outlined"
          density="comfortable"
          rounded="lg"
          rows="3"
          class="mb-2"
        />

        <v-text-field
          v-model.number="editForm.repairCost"
          label="تكلفة الإصلاح"
          type="number"
          :rules="[rules.required]"
          variant="outlined"
          density="comfortable"
          rounded="lg"
          prefix="$"
        />
      </v-form>

      <template #actions>
        <v-spacer />
        <v-btn variant="text" @click="editDialogOpen = false">إلغاء</v-btn>
        <v-btn color="primary" :loading="updating" @click="handleUpdate">
          تحديث
        </v-btn>
      </template>
    </AppModal>
  </div>
</template>
