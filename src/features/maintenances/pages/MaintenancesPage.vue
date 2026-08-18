<script setup lang="ts">
import { onMounted, reactive, ref, computed } from "vue";
import { useMaintenanceStore } from "../store/maintenance.store";
import { useMaintenanceCenterStore } from "../store/maintenance-center.store";
import { useCarStore } from "@/features/cars/store/car.store";
import AppModal from "@/shared/components/AppModal.vue";
import MaintenanceCenterFormModal from "../components/MaintenanceCenterFormModal.vue";
import MaintenancePaymentModal from "../components/MaintenancePaymentModal.vue";
import { usePaymentStatus } from "../composables/usePaymentStatus";
import {
  formatCurrency,
  formatDate,
  resolveImageUrl,
} from "@/core/utils/formatters";
import type {
  Maintenance,
  MaintenanceCreateDto,
  MaintenanceUpdateDto,
} from "../models/maintenance.model";
import type { MaintenanceCenter } from "../models/maintenance-center.model";

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
const centerStore = useMaintenanceCenterStore();
const carStore = useCarStore();
const { getStatusMeta } = usePaymentStatus();

const dialogOpen = ref(false);
const saving = ref(false);
const formValid = ref(false);
const selectedCarId = ref<number | null>(null);

const form = reactive<MaintenanceCreateDto>({
  carId: 0,
  maintenanceCenterId: 0,
  issueDescription: "",
  repairCost: 0,
  initialPaidAmount: undefined,
  paymentNotes: "",
});

const editDialogOpen = ref(false);
const updating = ref(false);
const editingMaintenance = ref<Maintenance | null>(null);

const editForm = reactive({
  id: 0,
  carId: 0,
  issueDescription: "",
  repairCost: 0,
  maintenanceCenterId: 0,
});

// ─── مودال إضافة مركز سريع (يُستخدم من فورم الإضافة والتعديل) ───────────
const centerDialogOpen = ref(false);
const centerDialogTarget = ref<"add" | "edit" | null>(null);

function openCenterDialog(target: "add" | "edit") {
  centerDialogTarget.value = target;
  centerDialogOpen.value = true;
}

function handleCenterSaved(center: MaintenanceCenter) {
  if (centerDialogTarget.value === "add") {
    form.maintenanceCenterId = center.id;
  } else if (centerDialogTarget.value === "edit") {
    editForm.maintenanceCenterId = center.id;
  }
}

// ─── مودال تفاصيل + دفعات ────────────────────────────────────────────────
const detailsDialog = ref(false);
const detailsMaintenance = ref<Maintenance | null>(null);
const paymentModalOpen = ref(false);

function openDetails(item: Maintenance) {
  detailsMaintenance.value = item;
  detailsDialog.value = true;
}

function openPaymentModal() {
  paymentModalOpen.value = true;
}

async function handlePaid() {
  if (!selectedCarId.value) return;
  await maintenanceStore.fetchByCarId(selectedCarId.value);
  if (detailsMaintenance.value) {
    const updated = maintenanceStore.maintenances.find(
      (m) => m.id === detailsMaintenance.value?.id,
    );
    if (updated) detailsMaintenance.value = updated;
  }
}

const rules = {
  required: (v: unknown) =>
    (v !== null && v !== undefined && v !== "" && v !== 0) || "هذا الحقل مطلوب",
  repairCostGT: (v: number) => v > 0 || "التكلفة يجب أن تكون أكبر من صفر",
};

const editRepairCostRule = computed(
  () => (v: number) =>
    v >= (editingMaintenance.value?.totalPaid || 0) ||
    `لا يمكن أن تكون التكلفة أقل من المبلغ المدفوع (${formatCurrency(
      editingMaintenance.value?.totalPaid || 0,
    )})`,
);

function openEditModal(item: Maintenance) {
  editingMaintenance.value = item;
  editForm.id = item.id;
  editForm.carId = item.carId;
  editForm.issueDescription = item.issueDescription;
  editForm.repairCost = item.repairCost;
  editForm.maintenanceCenterId = item.maintenanceCenterId;
  editDialogOpen.value = true;
}

async function handleUpdate() {
  if (!formValid.value) return;
  updating.value = true;
  try {
    const payload: MaintenanceUpdateDto = {
      issueDescription: editForm.issueDescription,
      repairCost: editForm.repairCost,
      maintenanceCenterId: editForm.maintenanceCenterId,
    };
    await maintenanceStore.updateMaintenance(
      editForm.id,
      payload,
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

const centerOptions = computed(() =>
  centerStore.centers.map((c) => ({ value: c.id, title: c.name })),
);

onMounted(async () => {
  await Promise.all([carStore.fetchCars(), centerStore.fetchCenters()]);
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

function onDelete(item: Maintenance) {
  if (item.totalPaid > 0) return; // محمي أصلاً بتعطيل الزر بالواجهة
  if (!confirm("هل أنت متأكد من حذف سجل الصيانة؟")) return;
  if (!selectedCarId.value) return;
  maintenanceStore.deleteMaintenance(selectedCarId.value, item.id);
}

async function handleSave() {
  if (!formValid.value) return;
  saving.value = true;
  try {
    await maintenanceStore.createMaintenance({ ...form });
    dialogOpen.value = false;
    Object.assign(form, {
      issueDescription: "",
      repairCost: 0,
      initialPaidAmount: undefined,
      paymentNotes: "",
    });
    if (selectedCarId.value === form.carId) {
      maintenanceStore.fetchByCarId(form.carId);
    }
  } finally {
    saving.value = false;
  }
}

const headers = [
  { title: "وصف العطل", key: "issueDescription" },
  { title: "المركز", key: "centerName" },
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

    <!-- ─── اختيار السيارة ────────────────────────────────────────────── -->
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
              <v-avatar size="48" rounded="lg" class="me-2">
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
              <div class="text-caption text-medium-emphasis d-flex flex-column">
                <span>الموديل: {{ item.raw.brand }} {{ item.raw.model }}</span>
                <span
                  >السنة: {{ item.raw.year }} • الكيلومتر:
                  {{ item.raw.mileage.toLocaleString() }}
                  {{ item.raw.mileageUnit }}</span
                >
                <span>السعر: {{ formatCurrency(item.raw.sellingPrice) }}</span>
              </div>
            </template>
          </v-list-item>
        </template>
        <template #selection="{ item }">
          <div class="d-flex align-center gap-2">
            <v-avatar size="28" rounded="lg">
              <v-img
                v-if="item.raw.imageUrl"
                :src="resolveImageUrl(item.raw.imageUrl)"
                cover
              />
              <v-icon v-else icon="mdi-car" size="18" />
            </v-avatar>
            <span>{{ item.raw.title }}</span>
          </div>
        </template>
      </v-autocomplete>
    </v-card>

    <!-- ─── الجدول ─────────────────────────────────────────────────────── -->
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
              icon="mdi-eye-outline"
              color="secondary"
              variant="text"
              size="small"
              title="التفاصيل والدفعات"
              @click="openDetails(item)"
            />
            <v-btn
              icon="mdi-pencil"
              color="primary"
              variant="text"
              size="small"
              @click="openEditModal(item)"
            />
            <v-tooltip
              :text="
                item.totalPaid > 0
                  ? 'لا يمكن حذف صيانة تحتوي على دفعات مسجلة'
                  : 'حذف'
              "
              location="top"
            >
              <template #activator="{ props: tip }">
                <span v-bind="tip">
                  <v-btn
                    icon="mdi-delete"
                    color="error"
                    variant="text"
                    size="small"
                    :disabled="item.totalPaid > 0"
                    @click="onDelete(item)"
                  />
                </span>
              </template>
            </v-tooltip>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- ─── مودال إضافة صيانة ─────────────────────────────────────────── -->
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
                <v-avatar size="46" rounded="lg" class="me-2">
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
                <div
                  class="text-caption text-medium-emphasis d-flex flex-column"
                >
                  <span
                    >الموديل: {{ item.raw.brand }} {{ item.raw.model }}</span
                  >
                  <span
                    >السنة: {{ item.raw.year }} • الكيلومتر:
                    {{ item.raw.mileage.toLocaleString() }}
                    {{ item.raw.mileageUnit }}</span
                  >
                  <span
                    >السعر: {{ formatCurrency(item.raw.sellingPrice) }}</span
                  >
                </div>
              </template>
            </v-list-item>
          </template>
          <template #selection="{ item }">
            <div class="d-flex align-center gap-2">
              <v-avatar size="26" rounded="lg">
                <v-img
                  v-if="item.raw.imageUrl"
                  :src="resolveImageUrl(item.raw.imageUrl)"
                  cover
                />
                <v-icon v-else icon="mdi-car" size="16" />
              </v-avatar>
              <span>{{ item.raw.title }}</span>
            </div>
          </template>
        </v-autocomplete>

        <div class="d-flex ga-2 align-start mb-2">
          <v-select
            v-model="form.maintenanceCenterId"
            :items="centerOptions"
            item-title="title"
            item-value="value"
            label="مركز الصيانة"
            :rules="[rules.required]"
            variant="outlined"
            density="comfortable"
            rounded="lg"
            :loading="centerStore.loading"
            class="flex-grow-1"
          />
          <v-btn
            icon="mdi-plus"
            color="accent"
            variant="tonal"
            class="mt-1"
            @click="openCenterDialog('add')"
          />
        </div>

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
          :rules="[rules.required, rules.repairCostGT]"
          variant="outlined"
          density="comfortable"
          rounded="lg"
          prefix="$"
          class="mb-2"
        />

        <v-divider class="mb-3" />
        <span class="text-caption text-medium-emphasis mb-2 d-block">
          دفعة أولى (اختياري)
        </span>

        <v-text-field
          v-model.number="form.initialPaidAmount"
          label="مبلغ الدفعة الأولى"
          type="number"
          variant="outlined"
          density="comfortable"
          rounded="lg"
          prefix="$"
          class="mb-2"
        />

        <v-textarea
          v-model="form.paymentNotes"
          label="ملاحظة الدفعة"
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

    <!-- ─── مودال تعديل صيانة ─────────────────────────────────────────── -->
    <AppModal v-model="editDialogOpen" title="تعديل سجل الصيانة">
      <v-form v-model="formValid" @submit.prevent="handleUpdate">
        <div class="d-flex ga-2 align-start mb-2">
          <v-select
            v-model="editForm.maintenanceCenterId"
            :items="centerOptions"
            item-title="title"
            item-value="value"
            label="مركز الصيانة"
            variant="outlined"
            density="comfortable"
            rounded="lg"
            :loading="centerStore.loading"
            class="flex-grow-1"
          />
          <v-btn
            icon="mdi-plus"
            color="accent"
            variant="tonal"
            class="mt-1"
            @click="openCenterDialog('edit')"
          />
        </div>

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
          :rules="[rules.required, rules.repairCostGT, editRepairCostRule]"
          variant="outlined"
          density="comfortable"
          rounded="lg"
          prefix="$"
          :hint="
            editingMaintenance
              ? `المبلغ المدفوع حالياً: ${formatCurrency(editingMaintenance.totalPaid)}`
              : ''
          "
          persistent-hint
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

    <!-- ─── مودال إضافة مركز سريع (مشترك بين الإضافة والتعديل) ─────────── -->
    <MaintenanceCenterFormModal
      v-model="centerDialogOpen"
      @saved="handleCenterSaved"
    />

    <!-- ─── مودال التفاصيل + الدفعات ──────────────────────────────────── -->
    <AppModal
      v-model="detailsDialog"
      title="تفاصيل الصيانة والدفعات"
      :max-width="620"
    >
      <div v-if="detailsMaintenance">
        <v-row dense class="mb-4">
          <v-col cols="6" sm="3">
            <span class="text-caption text-medium-emphasis d-block"
              >التكلفة</span
            >
            <span class="font-weight-bold">{{
              formatCurrency(detailsMaintenance.repairCost)
            }}</span>
          </v-col>
          <v-col cols="6" sm="3">
            <span class="text-caption text-medium-emphasis d-block"
              >المدفوع</span
            >
            <span class="font-weight-bold text-success">{{
              formatCurrency(detailsMaintenance.totalPaid)
            }}</span>
          </v-col>
          <v-col cols="6" sm="3">
            <span class="text-caption text-medium-emphasis d-block"
              >المتبقي</span
            >
            <span class="font-weight-bold text-error">{{
              formatCurrency(detailsMaintenance.remainingAmount)
            }}</span>
          </v-col>
          <v-col cols="6" sm="3">
            <span class="text-caption text-medium-emphasis d-block"
              >الحالة</span
            >
            <v-chip
              :color="getStatusMeta(detailsMaintenance.paymentStatus).color"
              size="small"
              variant="tonal"
            >
              {{ getStatusMeta(detailsMaintenance.paymentStatus).label }}
            </v-chip>
          </v-col>
        </v-row>

        <div class="d-flex align-center justify-space-between mb-3">
          <span class="font-weight-bold">سجل الدفعات</span>
          <v-btn
            v-if="detailsMaintenance.paymentStatus !== 'Paid'"
            color="accent"
            size="small"
            prepend-icon="mdi-cash-plus"
            style="text-transform: none; font-weight: 600"
            @click="openPaymentModal"
          >
            تسجيل دفعة
          </v-btn>
        </div>

        <v-list v-if="detailsMaintenance.payments.length" density="compact">
          <v-list-item
            v-for="payment in detailsMaintenance.payments"
            :key="payment.id"
            class="px-0"
          >
            <div class="d-flex align-center justify-space-between w-100">
              <div>
                <span class="font-weight-bold text-success d-block">{{
                  formatCurrency(payment.amount)
                }}</span>
                <span class="text-caption text-medium-emphasis">{{
                  formatDate(payment.paymentDate)
                }}</span>
                <span v-if="payment.notes" class="text-caption d-block">{{
                  payment.notes
                }}</span>
              </div>
            </div>
          </v-list-item>
        </v-list>
        <div v-else class="text-center py-6 text-medium-emphasis text-caption">
          لا توجد دفعات مسجلة بعد
        </div>
      </div>

      <template #actions>
        <v-spacer />
        <v-btn variant="text" @click="detailsDialog = false">إغلاق</v-btn>
      </template>
    </AppModal>

    <MaintenancePaymentModal
      v-model="paymentModalOpen"
      :maintenance-id="detailsMaintenance?.id ?? null"
      :remaining-amount="detailsMaintenance?.remainingAmount ?? 0"
      @paid="handlePaid"
    />
  </div>
</template>
