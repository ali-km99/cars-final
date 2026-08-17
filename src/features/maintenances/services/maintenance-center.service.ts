import api from "@/core/api/axios";
import type { ApiEnvelope } from "@/core/api/types";
import type {
  MaintenanceCenter,
  MaintenanceCenterCreateDto,
  MaintenanceCenterUpdateDto,
} from "../models/maintenance-center.model";
import type { MaintenanceCenterDebtDto } from "../models/maintenance-debt.model";

const RESOURCE = "/maintenance-centers";

export const maintenanceCenterService = {
  getAll() {
    return api.get<ApiEnvelope<MaintenanceCenter[]>>(RESOURCE);
  },

  getById(id: number) {
    return api.get<ApiEnvelope<MaintenanceCenter>>(`${RESOURCE}/${id}`);
  },

  create(payload: MaintenanceCenterCreateDto) {
    return api.post<ApiEnvelope<MaintenanceCenter>>(RESOURCE, payload);
  },

  update(id: number, payload: MaintenanceCenterUpdateDto) {
    return api.put<ApiEnvelope<MaintenanceCenter>>(
      `${RESOURCE}/${id}`,
      payload,
    );
  },

  remove(id: number) {
    return api.delete<ApiEnvelope<null>>(`${RESOURCE}/${id}`);
  },

  getDebts(id: number) {
    return api.get<ApiEnvelope<MaintenanceCenterDebtDto>>(
      `${RESOURCE}/${id}/debts`,
    );
  },
};
