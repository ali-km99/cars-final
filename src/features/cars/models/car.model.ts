export interface CarStatus {
  id: number;
  name: "Ready" | "Maintenance" | "Shipping" | "Sold" | string;
}

export interface CarImage {
  id: number;
  imageUrl: string;
  isPrimary: boolean;
}

export interface Feature {
  id: number;
  name: string;
}

export interface FeatureDto {
  id: number;
  name: string | null;
  category?: string | null;
  usageCount?: number;
}

export interface FeatureDtoListApiResponse {
  success: boolean;
  message: string;
  data: FeatureDto[];
}

export interface BrandListApiResponse {
  success: boolean;
  message: string;
  data: string[];
}

/* ───────────── GET ALL (List Item) ───────────── */
export interface CarListItem {
  id: number;
  brand: string;
  model: string;
  year: number;

  exteriorColor: string;
  sellingPrice: number;

  statusName: string;

  primaryImageUrl?: string | null;

  condition?: string | null;
  bodyType?: string | null;

  mileage?: number | null;
  mileageUnit?: string | null;

  createdAt: string;
}

/* نخلي الكارد يعتمد عليه مباشرة */
export type CarCard = CarListItem;

/* ───────────── GET BY ID (Details) ───────────── */
export interface CarDetails {
  id: number;
  brand: string;
  model: string;
  year: number;

  exteriorColor: string;
  interiorColor?: string | null;

  costPrice?: number;
  shippingCost?: number;
  sellingPrice: number;
  profit?: number;
  totalRepairCost?: number;

  vinNumber?: string | null;

  mileage?: number | null;
  mileageUnit?: string | null;

  bodyType?: string | null;
  numberOfSeats?: number | null;
  transmission?: string | null;

  condition?: string | null;
  bodyCondition?: string | null;

  fuelType?: string | null;
  engineSize?: number | null;

  specs?: string | null;

  hasLicense: boolean;
  hasInsurance: boolean;
  hasCustomsClearance: boolean;

  paymentMethod?: string | null;

  statusId?: number;
  statusName: string;

  notes?: string;

  createdAt: string;

  images?: CarImage[];

  features?: {
    technology: string[];
    interior: string[];
    exterior: string[];
  };

  maintenances?: any[];
}

/* ───────────── Pagination ───────────── */
import type { ApiPagedResult } from "@/core/api/types";

export type CarListResponse = ApiPagedResult<CarListItem>;
export type CarPagination = Omit<ApiPagedResult<CarListItem>, "items">;

/* ───────────── DTOs ───────────── */
export interface CarCreateDto {
  brand: string;
  model: string;
  year: number;
  color: string;
  costPrice: number;
  shippingCost: number;
  sellingPrice: number;
  statusId: number;
  notes?: string;
  featureIds?: number[];
  exteriorColor: string;
  interiorColor?: string | null;
  vinNumber?: string | null;

  mileage?: number | null;
  mileageUnit?: string | null;

  bodyType?: string | null;
  numberOfSeats?: number | null;
  transmission?: string | null;

  condition?: string | null;
  bodyCondition?: string | null;
  hasLicense?: boolean;
  hasInsurance?: boolean;
  hasCustomsClearance?: boolean;
  fuelType?: string | null;
  engineSize?: number | null;

  specs?: string | null;
}

export interface CarUpdateDto extends Partial<CarCreateDto> {
  id: number;
}

/* ───────────── Filters ───────────── */
export interface CarFilter {
  SearchTerm?: string;
  Brand?: string;
  YearFrom?: number;
  YearTo?: number;
  PriceFrom?: number;
  PriceTo?: number;
  StatusId?: number;
  BodyType?: string;
  Transmission?: string;
  Condition?: string;
  FuelType?: string;
  Specs?: string;
  Page?: number;
  PageSize?: number;
}
