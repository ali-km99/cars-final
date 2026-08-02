import type { ApiPagedResult } from "@/core/api/types";

// ─── قائمة المستخدمين (GET /api/users) ───────────────────────────────────────
export interface UserListItem {
  id: number;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export type UserListResponse = ApiPagedResult<UserListItem>;

// ─── تفاصيل مستخدم (GET /api/users/{id}) ────────────────────────────────────
export interface UserDetail extends UserListItem {
  permissions: UserPermission[];
}

// ─── الصلاحية ─────────────────────────────────────────────────────────────────
export interface Permission {
  id: number;
  code: string; // مثال: Cars.View
  name: string; // مثال: عرض السيارات
  category: string; // مثال: Cars
}

export interface UserPermission {
  id: number;
  code: string;
  name: string;
  group: string;
}

// ─── DTOs ─────────────────────────────────────────────────────────────────────
export interface UserCreateDto {
  username: string;
  email: string;
  password: string;
  role: string;
  permissionIds: number[];
}

export interface UserUpdateDto {
  username: string;
  email: string;
  role: string;
}

export interface UserUpdatePermissionsDto {
  permissionIds: number[];
}

export interface UserFilter {
  search?: string;
  page?: number;
  pageSize?: number;
}

// ─── الأدوار المتاحة ──────────────────────────────────────────────────────────
export const USER_ROLES = [
  { value: "Admin", title: "مدير" },
  { value: "SuperAdmin", title: "مدير عام" },
  { value: "User", title: "مستخدم" },
] as const;
