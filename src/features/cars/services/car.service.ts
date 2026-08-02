import api from "@/core/api/axios";
import type { ApiEnvelope } from "@/core/api/types";

import type {
  BrandListApiResponse,
  CarCreateDto,
  CarFilter,
  CarListResponse,
  CarDetails,
  CarUpdateDto,
} from "../models/car.model";

const RESOURCE = "/cars";

export const carService = {
  /* ───────── GET ALL ───────── */
  getAll(filter?: CarFilter) {
    return api.get<ApiEnvelope<CarListResponse>>(RESOURCE, {
      params: filter,
    });
  },

  /* ───────── GET BY ID ───────── */
  getById(id: number) {
    return api.get<ApiEnvelope<CarDetails>>(`${RESOURCE}/${id}`);
  },

  /* ───────── GET BRANDS ───────── */
  getBrands() {
    return api.get<ApiEnvelope<BrandListApiResponse["data"]>>(
      `${RESOURCE}/brands`,
    );
  },

  /* ───────── CREATE ───────── */
  create(payload: CarCreateDto) {
    return api.post<ApiEnvelope<CarDetails>>(RESOURCE, payload);
  },

  /* ───────── UPDATE ───────── */
  update(id: number, payload: CarUpdateDto) {
    return api.put<ApiEnvelope<CarDetails>>(`${RESOURCE}/${id}`, payload);
  },

  /* ───────── DELETE ───────── */
  remove(id: number) {
    return api.delete<ApiEnvelope<null>>(`${RESOURCE}/${id}`);
  },

  /* ───────── IMAGES ───────── */
  uploadImages(carId: number, files: File[]) {
    const formData = new FormData();

    files.forEach((file) => {
      formData.append("files", file, file.name);
    });

    return api.post<ApiEnvelope<string[]>>(
      `${RESOURCE}/${carId}/car-img`,
      formData,
    );
  },

  setPrimaryImage(carId: number, imageId: number) {
    return api.patch<ApiEnvelope<CarDetails>>(
      `${RESOURCE}/${carId}/car-img/${imageId}/set-primary`,
    );
  },

  deleteImage(carId: number, imageId: number) {
    return api.delete<ApiEnvelope<null>>(
      `${RESOURCE}/${carId}/car-img/${imageId}`,
    );
  },
};
