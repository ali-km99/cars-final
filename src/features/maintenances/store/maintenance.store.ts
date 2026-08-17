import { defineStore } from "pinia";
import { ref } from "vue";
import { useUiStore } from "@/core/store/ui.store";
import { maintenanceService } from "../services/maintenance.service";
import type {
  Maintenance,
  MaintenanceCreateDto,
  MaintenanceUpdateDto,
  CreateMaintenancePaymentDto,
} from "../models/maintenance.model";

export const useMaintenanceStore = defineStore("maintenances", () => {
  const maintenances = ref<Maintenance[]>([]);
  const currentMaintenance = ref<Maintenance | null>(null);
  const loading = ref(false);
  const loadingPayments = ref(false);
  const savingPayment = ref(false);
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

  async function fetchMaintenanceById(maintenanceId: number) {
    try {
      const { data: envelope } =
        await maintenanceService.getById(maintenanceId);
      currentMaintenance.value = envelope.data;
      return envelope.data;
    } catch (err: any) {
      const message =
        err?.response?.data?.message || "فشل تحميل بيانات الصيانة";
      uiStore.showAlert(message, "error");
      throw err;
    }
  }

  async function createMaintenance(payload: MaintenanceCreateDto) {
    try {
      const { data: envelope } = await maintenanceService.create(
        payload,
        payload.carId,
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
    payload: MaintenanceUpdateDto,
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
      if (currentMaintenance.value?.id === id) {
        currentMaintenance.value = envelope.data;
      }
      uiStore.showAlert("تم تحديث سجل الصيانة بنجاح", "success");
      return envelope.data;
    } catch (err: any) {
      const message = err?.response?.data?.message || "فشل تحديث سجل الصيانة";
      uiStore.showAlert(message, "error");
      throw err;
    }
  }

  // ─── الدفعات ──────────────────────────────────────────────────────────────
  async function fetchPayments(maintenanceId: number) {
    loadingPayments.value = true;
    try {
      const { data: envelope } =
        await maintenanceService.getPayments(maintenanceId);
      if (currentMaintenance.value?.id === maintenanceId) {
        currentMaintenance.value.payments = envelope.data;
      }
      return envelope.data;
    } catch (err: any) {
      const message = err?.response?.data?.message || "فشل تحميل الدفعات";
      uiStore.showAlert(message, "error");
      throw err;
    } finally {
      loadingPayments.value = false;
    }
  }

  async function createPayment(
    maintenanceId: number,
    payload: CreateMaintenancePaymentDto,
  ) {
    savingPayment.value = true;
    try {
      await maintenanceService.createPayment(maintenanceId, payload);
      uiStore.showAlert("تم تسجيل الدفعة بنجاح", "success");

      // إعادة جلب بيانات الصيانة لتحديث totalPaid/remainingAmount/paymentStatus/payments
      const updated = await fetchMaintenanceById(maintenanceId);
      const index = maintenances.value.findIndex((m) => m.id === maintenanceId);
      if (index !== -1) {
        maintenances.value[index] = updated;
      }
      return updated;
    } catch (err: any) {
      const message = err?.response?.data?.message || "فشل تسجيل الدفعة";
      uiStore.showAlert(message, "error");
      throw err;
    } finally {
      savingPayment.value = false;
    }
  }

  return {
    maintenances,
    currentMaintenance,
    loading,
    loadingPayments,
    savingPayment,
    error,
    resetMaintenances,
    fetchByCarId,
    fetchMaintenanceById,
    createMaintenance,
    deleteMaintenance,
    updateMaintenance,
    fetchPayments,
    createPayment,
  };
});
