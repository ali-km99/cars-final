import { defineStore } from "pinia";
import { ref } from "vue";
import { useUiStore } from "@/core/store/ui.store";
import { expenseService } from "../services/expense.service";
import type {
  Expense,
  ExpenseCategory,
  ExpenseCreateDto,
  ExpenseFilter,
  ExpenseUpdateDto,
} from "../models/expense.model";
import type { ApiPagedResult } from "@/core/api/types";

export const useExpenseStore = defineStore("expenses", () => {
  const uiStore = useUiStore();

  // ─── State ────────────────────────────────────────────────────────────────
  const expenses = ref<Expense[]>([]);
  const pagination = ref<Omit<ApiPagedResult<unknown>, "items"> | null>(null);
  const categories = ref<ExpenseCategory[]>([]);
  const loading = ref(false);
  const loadingCategories = ref(false);
  const savingCategory = ref(false);
  const error = ref<string | null>(null);

  // ─── المصروفات ────────────────────────────────────────────────────────────
  async function fetchExpenses(filter?: ExpenseFilter) {
    loading.value = true;
    error.value = null;
    try {
      const { data: envelope } = await expenseService.getAll(filter);
      expenses.value = envelope.data.items;
      pagination.value = {
        totalCount: envelope.data.totalCount,
        page: envelope.data.page,
        pageSize: envelope.data.pageSize,
        totalPages: envelope.data.totalPages,
      };
    } catch (err: any) {
      const message = err?.response?.data?.message || "فشل تحميل المصروفات";
      error.value = message;
      uiStore.showAlert(message, "error");
    } finally {
      loading.value = false;
    }
  }

  async function createExpense(payload: ExpenseCreateDto) {
    try {
      const { data: envelope } = await expenseService.create(payload);
      uiStore.showAlert("تم إضافة المصروف بنجاح", "success");
      return envelope.data;
    } catch (err: any) {
      const message = err?.response?.data?.message || "فشل إضافة المصروف";
      uiStore.showAlert(message, "error");
      throw err;
    }
  }

  async function updateExpense(id: number, payload: ExpenseUpdateDto) {
    try {
      const { data: envelope } = await expenseService.update(id, payload);
      const idx = expenses.value.findIndex((e) => e.id === id);
      if (idx !== -1) {
        expenses.value[idx] = envelope.data;
      }
      uiStore.showAlert("تم تعديل المصروف بنجاح", "success");
      return envelope.data;
    } catch (err: any) {
      const message = err?.response?.data?.message || "فشل تعديل المصروف";
      uiStore.showAlert(message, "error");
      throw err;
    }
  }

  async function removeExpense(id: number) {
    try {
      await expenseService.remove(id);
      expenses.value = expenses.value.filter((e) => e.id !== id);
      uiStore.showAlert("تم حذف المصروف بنجاح", "success");
    } catch (err: any) {
      const message = err?.response?.data?.message || "فشل حذف المصروف";
      uiStore.showAlert(message, "error");
      throw err;
    }
  }

  // ─── التصنيفات ────────────────────────────────────────────────────────────
  async function fetchCategories() {
    loadingCategories.value = true;
    try {
      const { data: envelope } = await expenseService.getCategories();
      categories.value = envelope.data;
    } catch (err: any) {
      uiStore.showAlert(
        err?.response?.data?.message || "فشل تحميل تصنيفات المصروفات",
        "error",
      );
    } finally {
      loadingCategories.value = false;
    }
  }

  async function createCategory(name: string) {
    savingCategory.value = true;
    try {
      const { data: envelope } = await expenseService.createCategory(name);
      categories.value.push(envelope.data);
      categories.value.sort((a, b) => a.name.localeCompare(b.name, "ar"));
      uiStore.showAlert("تم إضافة التصنيف بنجاح", "success");
      return envelope.data;
    } catch (err: any) {
      const message = err?.response?.data?.message || "فشل إضافة التصنيف";
      uiStore.showAlert(message, "error");
      throw err;
    } finally {
      savingCategory.value = false;
    }
  }

  return {
    expenses,
    pagination,
    categories,
    loading,
    loadingCategories,
    savingCategory,
    error,
    fetchExpenses,
    createExpense,
    updateExpense,
    removeExpense,
    fetchCategories,
    createCategory,
  };
});
