import { defineStore } from "pinia";
import { ref } from "vue";
import { useUiStore } from "@/core/store/ui.store";
import { maintenanceService } from "../services/maintenance.service";
import type {
  Maintenance,
  MaintenanceCreateDto,
} from "../models/maintenance.model";

export const useMaintenanceStore = defineStore("maintenances", () => {
  const maintenances = ref<Maintenance[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const uiStore = useUiStore();

  function resetMaintenances() {
    maintenances.value = [];
    error.value = null;
  }

  async function fetchByCarId(carId: number) {
    loading.value = true;
    resetMaintenances();
    try {
      const { data: envelope } = await maintenanceService.getByCarId(carId);
      maintenances.value = envelope.data;
    } catch (err: any) {
      const message = err?.response?.data?.message || "فشل تحميل الصيانات";
      error.value = message;
      uiStore.showAlert(message, "error");
    } finally {
      loading.value = false;
    }
  }

  async function createMaintenance(
    payload: MaintenanceCreateDto,
    carId: number,
  ) {
    try {
      const { data: envelope } = await maintenanceService.create(
        payload,
        carId,
      );
      maintenances.value.unshift(envelope.data);
      uiStore.showAlert("تم إضافة سجل الصيانة بنجاح", "success");
      return envelope.data;
    } catch (err: any) {
      const message = err?.response?.data?.message || "فشل إضافة سجل الصيانة";
      uiStore.showAlert(message, "error");
      throw err;
    }
  }
  async function deleteMaintenance(carId: number, id: number) {
    try {
      await maintenanceService.delete(carId, id);

      // حذف من الليست محلياً
      maintenances.value = maintenances.value.filter((m) => m.id !== id);

      uiStore.showAlert("تم حذف سجل الصيانة بنجاح", "success");
    } catch (err: any) {
      const message = err?.response?.data?.message || "فشل حذف سجل الصيانة";

      uiStore.showAlert(message, "error");
      throw err;
    }
  }

  async function updateMaintenance(
    id: number,
    payload: { issueDescription: string; repairCost: number },
    carId: number,
  ) {
    try {
      const { data: envelope } = await maintenanceService.update(
        carId,
        id,
        payload,
      );

      const index = maintenances.value.findIndex((m) => m.id === id);

      if (index !== -1) {
        maintenances.value[index] = envelope.data;
      }

      uiStore.showAlert("تم تحديث سجل الصيانة بنجاح", "success");

      return envelope.data;
    } catch (err: any) {
      const message = err?.response?.data?.message || "فشل تحديث سجل الصيانة";

      uiStore.showAlert(message, "error");
      throw err;
    }
  }

  return {
    maintenances,
    loading,
    error,
    resetMaintenances,
    fetchByCarId,
    createMaintenance,
    deleteMaintenance,
    updateMaintenance,
  };
});
