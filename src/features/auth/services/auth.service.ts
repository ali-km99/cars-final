import api from '@/core/api/axios'
import type { ApiEnvelope } from '@/core/api/types'
import type { AuthResponseData, LoginDto } from '../models/auth.model'

export const authService = {
  login(payload: LoginDto) {
    // الباك اند يرجع: { success, message, data: { id, username, accessToken, ... } }
    return api.post<ApiEnvelope<AuthResponseData>>('/auth/login', payload)
  },
}
