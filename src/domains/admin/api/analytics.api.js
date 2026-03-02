// api/analytics.api.js
import { axiosInstance } from "../../../utils/axios";

const fetchDashboardData = async (params) => {
  try {
    const response = await axiosInstance.get("/analytics/dashboard", {
      params,
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Fetch dashboard data error",
    );
  }
};

export default fetchDashboardData;
