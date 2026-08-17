import api from "@/core/api/axios";
import type { ApiEnvelope } from "@/core/api/types";
import type {
  Maintenance,
  MaintenanceCreateDto,
  MaintenanceUpdateDto,
  MaintenancePaymentDto,
  CreateMaintenancePaymentDto,
} from "../models/maintenance.model";

export const maintenanceService = {
  getByCarId(carId: number) {
    return api.get<ApiEnvelope<Maintenance[]>>(`cars/${carId}/maintenances`);
  },

  create(payload: MaintenanceCreateDto, carId: number) {
    return api.post<ApiEnvelope<Maintenance>>(
      `cars/${carId}/maintenances`,
      payload,
    );
  },

  delete(carId: number, maintenanceId: number) {
    return api.delete<ApiEnvelope<null>>(
      `cars/${carId}/maintenances/${maintenanceId}`,
    );
  },

  update(carId: number, maintenanceId: number, payload: MaintenanceUpdateDto) {
    return api.put<ApiEnvelope<Maintenance>>(
      `cars/${carId}/maintenances/${maintenanceId}`,
      payload,
    );
  },

  // ─── جديد: تفاصيل صيانة مستقلة ─────────────────────────────────────────
  getById(maintenanceId: number) {
    return api.get<ApiEnvelope<Maintenance>>(`maintenances/${maintenanceId}`);
  },

  // ─── جديد: الدفعات ──────────────────────────────────────────────────────
  getPayments(maintenanceId: number) {
    return api.get<ApiEnvelope<MaintenancePaymentDto[]>>(
      `maintenances/${maintenanceId}/payments`,
    );
  },

  createPayment(maintenanceId: number, payload: CreateMaintenancePaymentDto) {
    return api.post<ApiEnvelope<MaintenancePaymentDto>>(
      `maintenances/${maintenanceId}/payments`,
      payload,
    );
  },
};
