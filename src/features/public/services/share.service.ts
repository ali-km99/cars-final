import api from "@/core/api/axios";

import type { ApiEnvelope } from "@/core/api/types";
import type {
  BatchToggleRequest,
  GenerateShareLinkRequest,
  GenerateShareLinkResponse,
  PublicCarData,
  ShareAnalytics,
} from "../models/share.model";
import publicApi from "@/core/api/Publicaxios";

export const shareService = {
  // ─── محمية (تحتاج JWT) ────────────────────────────────────────────────────

  /** POST /api/cars/{id}/generate-share-link */
  generateLink(carId: number, payload: GenerateShareLinkRequest) {
    return api.post<ApiEnvelope<GenerateShareLinkResponse>>(
      `/cars/${carId}/generate-share-link`,
      payload,
    );
  },

  /** PATCH /api/public-shares/batch-toggle */
  batchToggle(payload: BatchToggleRequest) {
    return api.patch<ApiEnvelope<{ success: boolean }>>(
      "/public-shares/batch-toggle",
      payload,
    );
  },

  /** GET /api/cars/{id}/share-analytics */
  getAnalytics(carId: number) {
    return api.get<ApiEnvelope<ShareAnalytics>>(
      `/cars/${carId}/share-analytics`,
    );
  },

  // ─── عامة (بدون JWT — publicApi) ──────────────────────────────────────────

  /** GET /public/cars/{token} */
  getPublicCar(token: string) {
    return publicApi.get<ApiEnvelope<PublicCarData>>(`/public/cars/${token}`);
  },
};
