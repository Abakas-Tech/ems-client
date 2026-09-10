import { axiosInstance } from "../../../utils/axios";

const createSale = async (payload) => {
  try {
    const response = await axiosInstance.post("/stock/sales", payload);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Log delivery error");
  }
};

const listSales = async () => {
  try {
    const response = await axiosInstance.get("/stock/sales");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Fetch sales error");
  }
};

const getCashSummary = async () => {
  try {
    const response = await axiosInstance.get("/stock/sales/cash-summary");
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Fetch cash summary error",
    );
  }
};

export { createSale, listSales, getCashSummary };
