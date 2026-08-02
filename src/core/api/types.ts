/**
 * الشكل العام لكل استجابات الباك اند:
 * { success: boolean, message: string, data: T }
 */
export interface ApiEnvelope<T> {
  success: boolean
  message: string
  data: T
}

/** شكل النتائج المُرقّمة (pagination) كما يرجعها الباك اند داخل data */
export interface ApiPagedResult<T> {
  items: T[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ApiListResponse<T> {
  data: T[]
  total: number
  page?: number
  pageSize?: number
}

export interface ApiError {
  message: string
  statusCode: number
  errors?: Record<string, string[]>
}
