import { defineStore } from "pinia";
import { ref } from "vue";
import { useUiStore } from "@/core/store/ui.store";
import { carService } from "../services/car.service";
import type {
  CarListItem,
  CarDetails,
  CarCreateDto,
  CarFilter,
  CarPagination,
  CarUpdateDto,
} from "../models/car.model";

export const useCarStore = defineStore("cars", () => {
  /* ───────── STATE ───────── */
  const cars = ref<CarListItem[]>([]);
  const pagination = ref<CarPagination | null>(null);
  const currentCar = ref<CarDetails | null>(null);

  const loading = ref(false);
  const error = ref<string | null>(null);

  const uiStore = useUiStore();

  /* ───────── GET ALL ───────── */
  async function fetchCars(filter?: CarFilter) {
    loading.value = true;
    error.value = null;

    try {
      const { data: envelope } = await carService.getAll(filter);
      const payload = envelope.data;

      cars.value = payload.items;
      pagination.value = {
        totalCount: payload.totalCount,
        page: payload.page,
        pageSize: payload.pageSize,
        totalPages: payload.totalPages,
      };
    } catch (err: any) {
      const message = err?.response?.data?.message || "فشل تحميل السيارات";
      error.value = message;
      uiStore.showAlert(message, "error");
    } finally {
      loading.value = false;
    }
  }

  /* ───────── GET BY ID ───────── */
  async function fetchCarById(id: number) {
    loading.value = true;
    error.value = null;

    try {
      const { data: envelope } = await carService.getById(id);
      currentCar.value = envelope.data;
    } catch (err: any) {
      const message =
        err?.response?.data?.message || "فشل تحميل تفاصيل السيارة";
      error.value = message;
      uiStore.showAlert(message, "error");
    } finally {
      loading.value = false;
    }
  }

  /* ───────── CREATE ───────── */
  async function createCar(payload: CarCreateDto) {
    try {
      const { data: envelope } = await carService.create(payload);

      // ملاحظة: API يرجع تفاصيل كاملة غالباً
      // لكن list يحتاج CarListItem فقط → نضيفها لو فيها نفس الشكل
      cars.value.unshift(envelope.data);

      uiStore.showAlert("تم إضافة السيارة بنجاح", "success");
      return envelope.data;
    } catch (err: any) {
      const message = err?.response?.data?.message || "فشل إضافة السيارة";
      uiStore.showAlert(message, "error");
      throw err;
    }
  }

  /* ───────── UPDATE ───────── */
  async function updateCar(id: number, payload: CarUpdateDto) {
    try {
      const { data: envelope } = await carService.update(id, payload);

      const idx = cars.value.findIndex((c) => c.id === id);
      if (idx !== -1) {
        cars.value[idx] = {
          ...cars.value[idx],
          ...envelope.data,
        };
      }

      // لو نفس السيارة المفتوحة في التفاصيل
      if (currentCar.value?.id === id) {
        currentCar.value = envelope.data;
      }

      uiStore.showAlert("تم تعديل بيانات السيارة بنجاح", "success");
      return envelope.data;
    } catch (err: any) {
      const message =
        err?.response?.data?.message || "فشل تعديل بيانات السيارة";
      uiStore.showAlert(message, "error");
      throw err;
    }
  }

  /* ───────── IMAGES ───────── */
  async function setPrimaryImage(carId: number, imageId: number) {
    try {
      const { data: envelope } = await carService.setPrimaryImage(
        carId,
        imageId,
      );

      if (currentCar.value?.id === carId) {
        currentCar.value = envelope.data;
      }

      uiStore.showAlert("تم تعيين الصورة الرئيسية بنجاح", "success");
      return envelope.data;
    } catch (err: any) {
      const message =
        err?.response?.data?.message || "فشل تعيين الصورة الرئيسية";
      uiStore.showAlert(message, "error");
      throw err;
    }
  }

  async function deleteImage(carId: number, imageId: number) {
    try {
      await carService.deleteImage(carId, imageId);

      if (currentCar.value?.id === carId) {
        await fetchCarById(carId);
      }

      uiStore.showAlert("تم حذف الصورة بنجاح", "success");
    } catch (err: any) {
      const message = err?.response?.data?.message || "فشل حذف الصورة";
      uiStore.showAlert(message, "error");
      throw err;
    }
  }

  /* ───────── DELETE ───────── */
  async function deleteCar(id: number) {
    try {
      await carService.remove(id);

      cars.value = cars.value.filter((c) => c.id !== id);

      uiStore.showAlert("تم حذف السيارة بنجاح", "success");
    } catch (err: any) {
      const message = err?.response?.data?.message || "فشل حذف السيارة";
      uiStore.showAlert(message, "error");
      throw err;
    }
  }

  return {
    cars,
    pagination,
    currentCar,
    loading,
    error,
    fetchCars,
    fetchCarById,
    createCar,
    updateCar,
    setPrimaryImage,
    deleteImage,
    deleteCar,
  };
});
