import api from "@/core/api/axios";
import type { ApiEnvelope } from "@/core/api/types";
import type {
  Permission,
  UserCreateDto,
  UserDetail,
  UserFilter,
  UserListResponse,
  UserUpdateDto,
  UserUpdatePermissionsDto,
} from "../models/user.model";

const RESOURCE = "/users";

export const userService = {
  // ─── المستخدمون ────────────────────────────────────────────────────────────
  getAll(filter?: UserFilter) {
    return api.get<ApiEnvelope<UserListResponse>>(RESOURCE, { params: filter });
  },

  getById(id: number) {
    return api.get<ApiEnvelope<UserDetail>>(`${RESOURCE}/${id}`);
  },

  create(payload: UserCreateDto) {
    return api.post<ApiEnvelope<UserDetail>>(RESOURCE, payload);
  },

  update(id: number, payload: UserUpdateDto) {
    return api.put<ApiEnvelope<UserDetail>>(`${RESOURCE}/${id}`, payload);
  },

  remove(id: number) {
    return api.delete(`${RESOURCE}/${id}`);
  },

  // ─── الصلاحيات ─────────────────────────────────────────────────────────────
  getAllPermissions() {
    return api.get<ApiEnvelope<Permission[]>>("/permissions");
  },

  getUserPermissions(userId: number) {
    return api.get<ApiEnvelope<Permission[]>>(
      `${RESOURCE}/${userId}/permissions`,
    );
  },

  updateUserPermissions(userId: number, payload: UserUpdatePermissionsDto) {
    return api.patch<ApiEnvelope<null>>(
      `${RESOURCE}/${userId}/permissions`,
      payload,
    );
  },
};
