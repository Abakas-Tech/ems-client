// api/analytics.api.js
import { axiosInstance } from "../../../utils/axios";

export const fetchDashboardData = async (params) => {
  // params: { period: 'yearly', year: 2026 } or { period: 'monthly', year: 2026, month: 1 }
  const response = await axiosInstance.get("/analytics/dashboard", { params });
  return response.data.data;
};
