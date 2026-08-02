import api from "@/core/api/axios";
import type { ApiEnvelope } from "@/core/api/types";
import type {
  FeatureDto,
  FeatureDtoListApiResponse,
} from "../models/car.model";

const RESOURCE = "/features";

export const featureService = {
  getAll() {
    return api.get<ApiEnvelope<FeatureDtoListApiResponse["data"]>>(RESOURCE);
  },

  getById(id: number) {
    return api.get<ApiEnvelope<FeatureDto>>(`${RESOURCE}/${id}`);
  },

  create(payload: Omit<FeatureDto, "id">) {
    return api.post<ApiEnvelope<FeatureDto>>(RESOURCE, payload);
  },

  update(id: number, payload: Partial<FeatureDto>) {
    return api.put<ApiEnvelope<FeatureDto>>(`${RESOURCE}/${id}`, payload);
  },

  remove(id: number) {
    return api.delete<ApiEnvelope<null>>(`${RESOURCE}/${id}`);
  },
};
