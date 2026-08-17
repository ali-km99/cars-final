export interface MaintenanceCenter {
  id: number;
  name: string;
  notes?: string;
}

export interface MaintenanceCenterCreateDto {
  name: string;
  notes?: string;
}

export type MaintenanceCenterUpdateDto = MaintenanceCenterCreateDto;
