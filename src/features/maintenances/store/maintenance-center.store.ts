import { defineStore } from "pinia";
import { ref } from "vue";
import { useUiStore } from "@/core/store/ui.store";
import { maintenanceCenterService } from "../services/maintenance-center.service";
import type {
  MaintenanceCenter,
  MaintenanceCenterCreateDto,
  MaintenanceCenterUpdateDto,
} from "../models/maintenance-center.model";
import type { MaintenanceCenterDebtDto } from "../models/maintenance-debt.model";

export const useMaintenanceCenterStore = defineStore(
  "maintenanceCenters",
  () => {
    const centers = ref<MaintenanceCenter[]>([]);
    const currentCenterDebt = ref<MaintenanceCenterDebtDto | null>(null);
    const loading = ref(false);
    const loadingDebt = ref(false);
    const saving = ref(false);
    const error = ref<string | null>(null);
    const uiStore = useUiStore();

    async function fetchCenters() {
      loading.value = true;
      error.value = null;
      try {
        const { data: envelope } = await maintenanceCenterService.getAll();
        centers.value = envelope.data;
      } catch (err: any) {
        const message =
          err?.response?.data?.message || "فشل تحميل مراكز الصيانة";
        error.value = message;
        uiStore.showAlert(message, "error");
      } finally {
        loading.value = false;
      }
    }

    async function createCenter(payload: MaintenanceCenterCreateDto) {
      saving.value = true;
      try {
        const { data: envelope } =
          await maintenanceCenterService.create(payload);
        centers.value.push(envelope.data);
        centers.value.sort((a, b) => a.name.localeCompare(b.name, "ar"));
        uiStore.showAlert("تم إضافة مركز الصيانة بنجاح", "success");
        return envelope.data;
      } catch (err: any) {
        const message =
          err?.response?.data?.message || "فشل إضافة مركز الصيانة";
        uiStore.showAlert(message, "error");
        throw err;
      } finally {
        saving.value = false;
      }
    }

    async function updateCenter(
      id: number,
      payload: MaintenanceCenterUpdateDto,
    ) {
      saving.value = true;
      try {
        const { data: envelope } = await maintenanceCenterService.update(
          id,
          payload,
        );
        const idx = centers.value.findIndex((c) => c.id === id);
        if (idx !== -1) centers.value[idx] = envelope.data;
        uiStore.showAlert("تم تحديث مركز الصيانة بنجاح", "success");
        return envelope.data;
      } catch (err: any) {
        const message =
          err?.response?.data?.message || "فشل تحديث مركز الصيانة";
        uiStore.showAlert(message, "error");
        throw err;
      } finally {
        saving.value = false;
      }
    }

    async function removeCenter(id: number) {
      try {
        await maintenanceCenterService.remove(id);
        centers.value = centers.value.filter((c) => c.id !== id);
        uiStore.showAlert("تم حذف مركز الصيانة بنجاح", "success");
      } catch (err: any) {
        const message = err?.response?.data?.message || "فشل حذف مركز الصيانة";
        uiStore.showAlert(message, "error");
        throw err;
      }
    }

    async function fetchCenterDebts(id: number) {
      loadingDebt.value = true;
      try {
        const { data: envelope } = await maintenanceCenterService.getDebts(id);
        currentCenterDebt.value = envelope.data;
        return envelope.data;
      } catch (err: any) {
        const message =
          err?.response?.data?.message || "فشل تحميل تقرير ديون المركز";
        uiStore.showAlert(message, "error");
        throw err;
      } finally {
        loadingDebt.value = false;
      }
    }

    return {
      centers,
      currentCenterDebt,
      loading,
      loadingDebt,
      saving,
      error,
      fetchCenters,
      createCenter,
      updateCenter,
      removeCenter,
      fetchCenterDebts,
    };
  },
);
