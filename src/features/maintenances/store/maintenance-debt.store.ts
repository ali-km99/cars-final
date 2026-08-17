import { defineStore } from "pinia";
import { ref } from "vue";
import { useUiStore } from "@/core/store/ui.store";
import { maintenanceDebtService } from "../services/maintenance-debt.service";
import type {
  MaintenanceDebtFilter,
  MaintenanceDebtReportDto,
} from "../models/maintenance-debt.model";

export const useMaintenanceDebtStore = defineStore("maintenanceDebts", () => {
  const report = ref<MaintenanceDebtReportDto | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const uiStore = useUiStore();

  async function fetchReport(filter?: MaintenanceDebtFilter) {
    loading.value = true;
    error.value = null;
    try {
      const { data: envelope } = await maintenanceDebtService.getReport(filter);
      report.value = envelope.data;
    } catch (err: any) {
      const message = err?.response?.data?.message || "فشل تحميل كشف الديون";
      error.value = message;
      uiStore.showAlert(message, "error");
    } finally {
      loading.value = false;
    }
  }

  return { report, loading, error, fetchReport };
});
