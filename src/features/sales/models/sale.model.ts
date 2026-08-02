/**
 * شكل عنصر البيع كما يرجعه GET /api/sales (DTO جاهز للعرض من السيرفر).
 * لاحظ: لا يحتوي على carId/customerId/notes، فقط بيانات مُجهّزة للعرض.
 */
export interface Sale {
  id: number
  carTitle: string
  customerName: string
  soldPrice: number
  profit: number
  soldDate: string
}

/** شكل البيانات المُرسلة عند تسجيل عملية بيع جديدة (POST /api/sales) */
export interface SaleCreateDto {
  carId: number
  customerId: number
  soldPrice: number
  soldDate: string
  notes?: string
}
