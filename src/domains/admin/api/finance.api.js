import { axiosInstance } from "../../../utils/axios";

// Standardized list fetching
export const fetchTransactions = async (params = {}) => {
  try {
    const response = await axiosInstance.get(`/finance/transactions`, {
      params,
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Error fetching transactions",
    );
  }
};

// New: Fetch specific transaction details with User info
export const fetchTransactionDetails = async (id) => {
  try {
    const response = await axiosInstance.get(`/finance/transactions/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error fetching details");
  }
};


export const createTransaction = async (data) => {
  try {
    const response = await axiosInstance.post(`/finance/transactions`, data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Submission failed");
  }
};
