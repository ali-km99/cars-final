import type { PaymentStatus } from "./maintenance.model";

export interface MaintenanceDebtCarDto {
  carId: number;
  carLabel: string;
  debt: number;
}

export interface MaintenanceCenterDebtDto {
  centerId: number;
  centerName: string;
  totalRepairCost: number;
  totalPaid: number;
  totalDebt: number;
  unpaidCount: number;
  partiallyPaidCount: number;
  paidCount: number;
  cars: MaintenanceDebtCarDto[];
}

export interface MaintenanceDebtItemDto {
  maintenanceId: number;
  carId: number;
  carLabel: string;
  maintenanceCenterId: number;
  centerName: string;
  issueDescription: string;
  repairCost: number;
  totalPaid: number;
  remainingAmount: number;
  paymentStatus: PaymentStatus;
  createdAt: string;
}

export interface MaintenanceDebtReportDto {
  totalRepairCost: number;
  totalPaid: number;
  totalDebt: number;
  unpaidCount: number;
  partiallyPaidCount: number;
  paidCount: number;
  items: MaintenanceDebtItemDto[];
}

export interface MaintenanceDebtFilter {
  centerId?: number;
  carId?: number;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}
