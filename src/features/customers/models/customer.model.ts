export interface Customer {
  id: number
  name: string
  phone: string
  notes?: string
  totalPurchases: number
}

export interface CustomerCreateDto {
  name: string
  phone: string
  notes?: string
}
