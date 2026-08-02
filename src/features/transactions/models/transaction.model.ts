import type { ApiPagedResult } from '@/core/api/types'

export type TransactionType = 'Income' | 'Expense'
export type RelatedEntityType = 'Car' | 'Maintenance' | 'Sale'

export interface Transaction {
  id: number
  type: TransactionType
  amount: number
  relatedEntity: RelatedEntityType
  relatedId: number
  description: string
  date: string
}

export interface TransactionCreateDto {
  type: TransactionType
  amount: number
  relatedEntity: RelatedEntityType
  relatedId: number
  description: string
  date: string
}

/** استجابة GET /api/transactions المغلّفة بـ pagination */
export type TransactionListResponse = ApiPagedResult<Transaction>
