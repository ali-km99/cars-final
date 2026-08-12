import type { ApiPagedResult } from "@/core/api/types";

// ─── التصنيف ────────────────────────────────────────────────────────────────
export interface ExpenseCategory {
  id: number;
  name: string;
}

// ─── المصروف كما يرجعه GET /api/expenses ────────────────────────────────────
export interface Expense {
  id: number;
  categoryId: number;
  categoryName: string;
  amount: number;
  description?: string | null;
  date: string;
  createdAt: string;
}

// ─── DTOs ─────────────────────────────────────────────────────────────────────
export interface ExpenseCreateDto {
  categoryId: number;
  amount: number;
  description?: string;
  date?: string;
}

export type ExpenseUpdateDto = ExpenseCreateDto;

export interface ExpenseFilter {
  categoryId?: number;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

export type ExpenseListResponse = ApiPagedResult<Expense>;
