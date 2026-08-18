export interface MaintenanceCenterPhone {
  id: number;
  label: string;
  phoneNumber: string;
}

export interface MaintenanceCenter {
  id: number;
  name: string;
  notes?: string;
  phones: MaintenanceCenterPhone[];
}

// ─── الشكل المستخدم داخل الفورم (بدون id — id تلقائي من السيرفر) ─────────
export interface MaintenanceCenterPhoneInput {
  label: string;
  phoneNumber: string;
}

export interface MaintenanceCenterCreateDto {
  name: string;
  notes?: string;
  phones?: MaintenanceCenterPhoneInput[];
}

export type MaintenanceCenterUpdateDto = MaintenanceCenterCreateDto;
