import api from "@/core/api/axios";
import type { ApiEnvelope } from "@/core/api/types";
import type {
  MaintenanceDebtFilter,
  MaintenanceDebtReportDto,
} from "../models/maintenance-debt.model";

export const maintenanceDebtService = {
  getReport(filter?: MaintenanceDebtFilter) {
    return api.get<ApiEnvelope<MaintenanceDebtReportDto>>(
      "/maintenance-debts",
      { params: filter },
    );
  },
};
