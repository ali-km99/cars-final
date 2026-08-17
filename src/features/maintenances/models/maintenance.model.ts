export type PaymentStatus = "Unpaid" | "PartiallyPaid" | "Paid";

export interface MaintenancePaymentDto {
  id: number;
  maintenanceId: number;
  amount: number;
  paymentDate: string;
  notes?: string;
  createdAt: string;
}

export interface Maintenance {
  id: number;
  carId: number;
  maintenanceCenterId: number;
  centerName: string;
  issueDescription: string;
  repairCost: number;
  totalPaid: number;
  remainingAmount: number;
  paymentStatus: PaymentStatus;
  createdAt: string;
  payments: MaintenancePaymentDto[];
}

export interface MaintenanceCreateDto {
  carId: number;
  maintenanceCenterId: number;
  issueDescription: string;
  repairCost: number;
  initialPaidAmount?: number;
  paymentNotes?: string;
}

export interface MaintenanceUpdateDto {
  issueDescription: string;
  repairCost: number;
  maintenanceCenterId?: number;
}

export interface CreateMaintenancePaymentDto {
  amount: number;
  notes?: string;
  paymentDate?: string;
}
