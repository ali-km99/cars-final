import api from "@/core/api/axios";
import type { ApiEnvelope } from "@/core/api/types";
import type {
  Expense,
  ExpenseCategory,
  ExpenseCreateDto,
  ExpenseFilter,
  ExpenseListResponse,
  ExpenseUpdateDto,
} from "../models/expense.model";

const RESOURCE = "/expenses";

export const expenseService = {
  getAll(filter?: ExpenseFilter) {
    return api.get<ApiEnvelope<ExpenseListResponse>>(RESOURCE, {
      params: filter,
    });
  },

  getById(id: number) {
    return api.get<ApiEnvelope<Expense>>(`${RESOURCE}/${id}`);
  },

  create(payload: ExpenseCreateDto) {
    return api.post<ApiEnvelope<Expense>>(RESOURCE, payload);
  },

  update(id: number, payload: ExpenseUpdateDto) {
    return api.put<ApiEnvelope<Expense>>(`${RESOURCE}/${id}`, payload);
  },

  remove(id: number) {
    return api.delete<ApiEnvelope<null>>(`${RESOURCE}/${id}`);
  },

  // ─── التصنيفات ──────────────────────────────────────────────────────────
  getCategories() {
    return api.get<ApiEnvelope<ExpenseCategory[]>>(`${RESOURCE}/categories`);
  },

  createCategory(name: string) {
    return api.post<ApiEnvelope<ExpenseCategory>>(`${RESOURCE}/categories`, {
      name,
    });
  },
};
