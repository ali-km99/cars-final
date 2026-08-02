import { defineStore } from 'pinia'
import { ref } from 'vue'
import { transactionService } from '../services/transaction.service'
import type { Transaction } from '../models/transaction.model'

export const useTransactionStore = defineStore('transactions', () => {
  const transactions = ref<Transaction[]>([])
  const totalCount = ref(0)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchTransactions() {
    loading.value = true
    error.value = null
    try {
      const { data: envelope } = await transactionService.getAll()
      transactions.value = envelope.data.items
      totalCount.value = envelope.data.totalCount
    } catch (err: any) {
      error.value = err?.response?.data?.message || 'فشل تحميل العمليات المالية'
    } finally {
      loading.value = false
    }
  }

  return { transactions, totalCount, loading, error, fetchTransactions }
})
