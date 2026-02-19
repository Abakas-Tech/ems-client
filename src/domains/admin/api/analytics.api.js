// api/analytics.api.js
import { axiosInstance } from "../../../utils/axios";

export const fetchDashboardData = async (params) => {
  // params: { period: 'yearly', year: 2026 } or { period: 'monthly', year: 2026, month: 1 }
  const response = await axiosInstance.get("/analytics/dashboard", { params });
  return response.data.data;
};

export const fetchFinanceSummary = async (params) => {
  const response = await axiosInstance.get("/finance/summary", { params });
  return response.data.data;
};
