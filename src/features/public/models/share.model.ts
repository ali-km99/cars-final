// ─── جهات التواصل ─────────────────────────────────────────────────────────────
export interface ContactEntry {
  label: string;
  value: string;
}

// ─── POST /api/cars/{id}/generate-share-link ──────────────────────────────────
export interface GenerateShareLinkRequest {
  contactAddress?: string;
  contacts?: ContactEntry[];
  expiresAt?: string | null;
}

export interface GenerateShareLinkResponse {
  url: string;
  token: string;
  createdAt: string;
}

// ─── PATCH /api/public-shares/batch-toggle ────────────────────────────────────
export interface BatchToggleRequest {
  ids: number[];
  isActive: boolean;
}

// ─── GET /api/cars/{id}/share-analytics ──────────────────────────────────────
export interface ShareAnalytics {
  totalViews: number;
  viewsOverTime: { date: string; count: number }[];
  links: ShareLinkAnalytics[];
}
export interface ShareLinkAnalytics {
  shareId: number;
  token: string;
  viewsCount: number;
}

// ─── GET /public/cars/{token} ─────────────────────────────────────────────────
export interface PublicCarData {
  title: string;
  images: string[];
  sellingPrice: number;
  exteriorColor?: string;
  interiorColor?: string;
  mileage?: number;
  mileageUnit?: string;
  bodyType?: string;
  numberOfSeats?: number;
  transmission?: string;
  condition?: string;
  fuelType?: string;
  engineSize?: string;
  features?: {
    technology: string[];
    interior: string[];
    exterior: string[];
  };
  contactAddress?: string;
  contacts: ContactEntry[];
}

// ─── حالات صفحة العميل العامة ─────────────────────────────────────────────────
export type PublicPageState =
  | "loading"
  | "ok"
  | "not-found"
  | "expired"
  | "error";
