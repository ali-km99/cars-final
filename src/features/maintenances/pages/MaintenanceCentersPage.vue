<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useMaintenanceCenterStore } from "../store/maintenance-center.store";
import AppModal from "@/shared/components/AppModal.vue";
import MaintenanceCenterFormModal from "../components/MaintenanceCenterFormModal.vue";
import type { MaintenanceCenter } from "../models/maintenance-center.model";

const centerStore = useMaintenanceCenterStore();
const router = useRouter();

const formModalOpen = ref(false);
const editingCenter = ref<MaintenanceCenter | null>(null);

const deleteDialog = ref(false);
const deletingCenter = ref<MaintenanceCenter | null>(null);

onMounted(() => centerStore.fetchCenters());

function openCreate() {
  editingCenter.value = null;
  formModalOpen.value = true;
}

function openEdit(center: MaintenanceCenter) {
  editingCenter.value = center;
  formModalOpen.value = true;
}

function confirmDelete(center: MaintenanceCenter) {
  deletingCenter.value = center;
  deleteDialog.value = true;
}

async function handleDelete() {
  if (!deletingCenter.value) return;
  try {
    await centerStore.removeCenter(deletingCenter.value.id);
  } finally {
    deleteDialog.value = false;
    deletingCenter.value = null;
  }
}

function viewDebts(center: MaintenanceCenter) {
  router.push(`/maintenance-centers/${center.id}/debts`);
}

const headers = [
  { title: "اسم المركز", key: "name" },
  { title: "ملاحظات", key: "notes" },
  { title: "إجراءات", key: "actions", sortable: false, align: "end" as const },
];
</script>

<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <div class="d-flex flex-column">
        <span class="font-weight-bold text-2xl">مراكز الصيانة</span>
        <span class="text-sm text-medium-emphasis"
          >إدارة مراكز الصيانة المتعامل معها</span
        >
      </div>
      <v-btn
        color="accent"
        prepend-icon="mdi-plus"
        rounded="lg"
        style="text-transform: none; font-weight: 600"
        @click="openCreate"
      >
        إضافة مركز صيانة
      </v-btn>
    </div>

    <v-card class="app-card" no-padding>
      <v-data-table
        :headers="headers"
        :items="centerStore.centers"
        :loading="centerStore.loading"
        item-value="id"
        no-data-text="لا توجد مراكز صيانة حتى الآن"
        loading-text="جاري التحميل..."
      >
        <template #item.notes="{ item }">{{ item.notes || "—" }}</template>
        <template #item.actions="{ item }">
          <div class="d-flex justify-end gap-1">
            <v-btn
              icon="mdi-cash-multiple"
              size="small"
              variant="text"
              color="warning"
              title="عرض الديون"
              @click="viewDebts(item)"
            />
            <v-btn
              icon="mdi-pencil"
              size="small"
              variant="text"
              color="primary"
              @click="openEdit(item)"
            />
            <v-btn
              icon="mdi-delete"
              size="small"
              variant="text"
              color="error"
              @click="confirmDelete(item)"
            />
          </div>
        </template>
      </v-data-table>
    </v-card>

    <MaintenanceCenterFormModal
      v-model="formModalOpen"
      :editing-center="editingCenter"
    />

    <AppModal v-model="deleteDialog" title="تأكيد الحذف" :max-width="420">
      <div class="d-flex flex-column align-center text-center pa-4 ga-4">
        <v-avatar color="error" variant="tonal" size="64" rounded="xl">
          <v-icon icon="mdi-delete-outline" size="32" color="error" />
        </v-avatar>
        <p class="text-body-1 font-weight-bold">
          هل أنت متأكد من حذف مركز
          <strong>{{ deletingCenter?.name }}</strong
          >؟
        </p>
        <p class="text-caption text-medium-emphasis">
          لا يمكن حذف مركز مرتبط بعمليات صيانة مسجلة
        </p>
        <div class="d-flex ga-3 w-100">
          <v-btn
            variant="tonal"
            color="secondary"
            block
            style="text-transform: none"
            @click="deleteDialog = false"
          >
            إلغاء
          </v-btn>
          <v-btn
            color="error"
            block
            style="text-transform: none; font-weight: 600"
            @click="handleDelete"
          >
            نعم، احذف
          </v-btn>
        </div>
      </div>
    </AppModal>
  </div>
</template>
