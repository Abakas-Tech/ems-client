// api/analytics.api.js
import { axiosInstance } from "../../../utils/axios";

// Build the query params for a given period — only the params each
// period actually uses, so the backend never receives extras:
//   yearly  -> period, year
//   monthly -> period, year, month
//   weekly  -> period, year, month, week (constant weeks 1-4 of the month)
export const buildDashboardParams = (filters) => {
  const base = { period: filters.period, year: filters.year };

  if (filters.period === "yearly") return base;

  const withMonth = { ...base, month: filters.month };
  if (filters.period === "monthly") return withMonth;

  return { ...withMonth, week: filters.week };
};

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

// Live weekly report (the client's "ሳምንታዊ ሪፖርት") — computed numbers.
// Params mirror the dashboard filter via buildDashboardParams.
// No params = all-time totals.
const fetchWeeklyReport = async (params = {}) => {
  try {
    const response = await axiosInstance.get("/analytics/weekly-report", {
      params,
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Fetch weekly report error",
    );
  }
};

export { fetchWeeklyReport };

export default fetchDashboardData;
