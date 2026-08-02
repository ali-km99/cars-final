import { defineStore } from "pinia";
import { ref } from "vue";
import { useUiStore } from "@/core/store/ui.store";
import { saleService } from "../services/sale.service";
import type { Sale, SaleCreateDto } from "../models/sale.model";

export const useSaleStore = defineStore("sales", () => {
  const sales = ref<Sale[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const uiStore = useUiStore();

  async function fetchSales() {
    loading.value = true;
    error.value = null;
    try {
      const { data: envelope } = await saleService.getAll();
      sales.value = envelope.data;
    } catch (err: any) {
      const message = err?.response?.data?.message || "فشل تحميل المبيعات";
      error.value = message;
      uiStore.showAlert(message, "error");
    } finally {
      loading.value = false;
    }
  }

  async function createSale(payload: SaleCreateDto) {
    try {
      const { data: envelope } = await saleService.create(payload);
      sales.value.unshift(envelope.data);
      uiStore.showAlert("تم إضافة عملية البيع بنجاح", "success");
      return envelope.data;
    } catch (err: any) {
      const message = err?.response?.data?.message || "فشل إضافة عملية البيع";
      uiStore.showAlert(message, "error");
      throw err;
    }
  }

  return { sales, loading, error, fetchSales, createSale };
});
