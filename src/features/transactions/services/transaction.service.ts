import api from '@/core/api/axios'
import type { ApiEnvelope } from '@/core/api/types'
import type { TransactionListResponse } from '../models/transaction.model'

export const transactionService = {
  getAll() {
    return api.get<ApiEnvelope<TransactionListResponse>>('/transactions')
  },
}
