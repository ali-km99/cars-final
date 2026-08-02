import { API_HOST } from "@/core/api/axios";

export function formatCurrency(value: number): string {
  const formatted = new Intl.NumberFormat("ar-LY", {
    style: "currency",
    currency: "LYD",
    maximumFractionDigits: 0,
  }).format(value);

  return formatted
    .replace("د.ل.", "د.ل") // نحذف النقطة الأخيرة
    .replace(/\u200F/g, ""); // نحذف العلامة المخفية
}

export function formatDate(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-UK", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).format(date);
}

export function calculateProfit(
  sellingPrice: number,
  costPrice: number,
  shippingCost: number,
  repairCosts = 0,
): number {
  return sellingPrice - costPrice - shippingCost - repairCosts;
}

/**
 * يحوّل مسار صورة نسبي (مثل "/images/cars/abc.png") إلى رابط مطلق
 * باستخدام جذر سيرفر الـ API. لو الرابط مطلق بالفعل (http/https) يرجعه كما هو.
 */
export function resolveImageUrl(
  path: string | null | undefined,
): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_HOST}${path.startsWith("/") ? path : `/${path}`}`;
}
