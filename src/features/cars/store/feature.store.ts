import { defineStore } from "pinia";
import { ref } from "vue";
import { useUiStore } from "@/core/store/ui.store";
import { featureService } from "../services/feature.service";
import type {
  FeatureDto,
  FeatureDtoListApiResponse,
} from "../models/car.model";

export const useFeatureStore = defineStore("features", () => {
  const features = ref<FeatureDto[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const uiStore = useUiStore();

  async function fetchFeatures() {
    loading.value = true;
    error.value = null;

    try {
      const { data: envelope } = await featureService.getAll();
      const payload = envelope.data as FeatureDtoListApiResponse["data"];

      features.value = Array.isArray(payload) ? payload : [];
    } catch (err: any) {
      const message = err?.response?.data?.message || "فشل تحميل الكماليات";
      error.value = message;
      uiStore.showAlert(message, "error");
    } finally {
      loading.value = false;
    }
  }

  async function createFeature(payload: Omit<FeatureDto, "id">) {
    try {
      const { data: envelope } = await featureService.create(payload);
      features.value.unshift(envelope.data);
      uiStore.showAlert("تم إضافة الكمالية بنجاح", "success");
      return envelope.data;
    } catch (err: any) {
      const message = err?.response?.data?.message || "فشل إضافة الكمالية";
      uiStore.showAlert(message, "error");
      throw err;
    }
  }

  async function updateFeature(id: number, payload: Partial<FeatureDto>) {
    try {
      const { data: envelope } = await featureService.update(id, payload);
      const index = features.value.findIndex((feature) => feature.id === id);
      if (index !== -1) {
        features.value[index] = envelope.data;
      }
      uiStore.showAlert("تم تعديل الكمالية بنجاح", "success");
      return envelope.data;
    } catch (err: any) {
      const message = err?.response?.data?.message || "فشل تعديل الكمالية";
      uiStore.showAlert(message, "error");
      throw err;
    }
  }

  async function removeFeature(id: number) {
    try {
      await featureService.remove(id);
      features.value = features.value.filter((feature) => feature.id !== id);
      uiStore.showAlert("تم حذف الكمالية بنجاح", "success");
    } catch (err: any) {
      const message = err?.response?.data?.message || "فشل حذف الكمالية";
      uiStore.showAlert(message, "error");
      throw err;
    }
  }

  return {
    features,
    loading,
    error,
    fetchFeatures,
    createFeature,
    updateFeature,
    removeFeature,
  };
});
