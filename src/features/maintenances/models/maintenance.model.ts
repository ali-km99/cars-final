export interface Maintenance {
  id: number
  carId: number
  issueDescription: string
  repairCost: number
  createdAt: string
}

export interface MaintenanceCreateDto {
  carId: number
  issueDescription: string
  repairCost: number
}
