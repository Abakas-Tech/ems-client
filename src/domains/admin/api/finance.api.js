import { axiosInstance } from "../../../utils/axios";

// Standardized list fetching
const fetchTransactions = async (params = {}) => {
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
const fetchTransactionDetails = async (id) => {
  try {
    const response = await axiosInstance.get(`/finance/transactions/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error fetching details");
  }
};

const createTransaction = async (data) => {
  try {
    const response = await axiosInstance.post(`/finance/transactions`, data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Submission failed");
  }
};

const updateTransaction = async (id, data) => {
  try {
    const response = await axiosInstance.patch(
      `/finance/transactions/${id}`,
      data,
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Submission failed");
  }
};

const deleteTransaction = async (id) => {
  try {
    const response = await axiosInstance.delete(`/finance/transactions/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Submission failed");
  }
};
const fetchFinanceSummary = async () => {
  try {
    const response = await axiosInstance.get(`/reports/finance`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error fetching summary");
  }
};
export {
  fetchTransactions,
  fetchTransactionDetails,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  fetchFinanceSummary,
};
