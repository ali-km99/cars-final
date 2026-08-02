import api from "@/core/api/axios";
import type { ApiEnvelope } from "@/core/api/types";

export interface DashboardStats {
  totalCars: number;
  availableCars: number;
  soldCars: number;
  inMaintenanceCars: number;
  inShipping: number;
  totalRevenue: number;
  totalProfit: number;
  totalMaintenanceCost: number;
  monthlySales: {
    month: string;
    count: number;
    revenue: number;
  }[];
  recentSales: {
    carTitle: string;
    customerName: string;
    soldPrice: number;
    profit: number;
    soldDate: string;
  }[];
}

export const dashboardService = {
  getStats() {
    return api.get<ApiEnvelope<DashboardStats>>("/dashboard/stats");
  },
};
