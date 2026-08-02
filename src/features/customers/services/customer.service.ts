import api from '@/core/api/axios'
import type { ApiEnvelope } from '@/core/api/types'
import type { Customer, CustomerCreateDto } from '../models/customer.model'

const RESOURCE = '/customers'

export const customerService = {
  getAll() {
    return api.get<ApiEnvelope<Customer[]>>(RESOURCE)
  },

  getById(id: number) {
    return api.get<ApiEnvelope<Customer>>(`${RESOURCE}/${id}`)
  },

  create(payload: CustomerCreateDto) {
    return api.post<ApiEnvelope<Customer>>(RESOURCE, payload)
  },
}
