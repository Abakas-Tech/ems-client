import { axiosInstance } from "../../../utils/axios";

const getSummary = async () => {
  try {
    const response = await axiosInstance.get("/stock/dashboard/summary");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Fetch summary error");
  }
};

const getYearlyReport = async (year) => {
  try {
    const response = await axiosInstance.get(
      "/stock/dashboard/yearly-report",
      { params: { year } },
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Fetch yearly report error",
    );
  }
};

export { getSummary, getYearlyReport };
