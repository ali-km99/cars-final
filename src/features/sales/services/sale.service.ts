import api from '@/core/api/axios'
import type { ApiEnvelope } from '@/core/api/types'
import type { Sale, SaleCreateDto } from '../models/sale.model'

const RESOURCE = '/sales'

export const saleService = {
  getAll() {
    return api.get<ApiEnvelope<Sale[]>>(RESOURCE)
  },

  create(payload: SaleCreateDto) {
    return api.post<ApiEnvelope<Sale>>(RESOURCE, payload)
  },
}
