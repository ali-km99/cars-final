import { defineStore } from "pinia";
import { ref } from "vue";
import { useUiStore } from "@/core/store/ui.store";
import { customerService } from "../services/customer.service";
import type { Customer, CustomerCreateDto } from "../models/customer.model";

export const useCustomerStore = defineStore("customers", () => {
  const customers = ref<Customer[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const uiStore = useUiStore();

  async function fetchCustomers() {
    loading.value = true;
    error.value = null;
    try {
      const { data: envelope } = await customerService.getAll();
      customers.value = envelope.data;
    } catch (err: any) {
      const message = err?.response?.data?.message || "فشل تحميل العملاء";
      error.value = message;
      uiStore.showAlert(message, "error");
    } finally {
      loading.value = false;
    }
  }

  async function createCustomer(payload: CustomerCreateDto) {
    try {
      const { data: envelope } = await customerService.create(payload);
      customers.value.unshift(envelope.data);
      uiStore.showAlert("تم إضافة العميل بنجاح", "success");
      return envelope.data;
    } catch (err: any) {
      const message = err?.response?.data?.message || "فشل إضافة العميل";
      uiStore.showAlert(message, "error");
      throw err;
    }
  }

  return { customers, loading, error, fetchCustomers, createCustomer };
});
