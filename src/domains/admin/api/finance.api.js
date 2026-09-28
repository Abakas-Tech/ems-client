
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

// Fetch specific transaction details with User info
const fetchTransactionDetails = async (id) => {
  try {
    const response = await axiosInstance.get(`/finance/transactions/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Error fetching details",
    );
  }
};

const createTransaction = async (data) => {
  try {
    const response = await axiosInstance.post(
      `/finance/transactions`,
      data,
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Submission failed",
    );
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
    throw new Error(
      error.response?.data?.message || "Submission failed",
    );
  }
};

const deleteTransaction = async (id) => {
  try {
    const response = await axiosInstance.delete(
      `/finance/transactions/${id}`,
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Submission failed",
    );
  }
};

// ─────────────────────────────────────────────────────────────
// FINANCE SUMMARY
// ─────────────────────────────────────────────────────────────

// Route:
// GET /finance/summary
const fetchFinanceSummary = async (params = {}) => {
  try {
    const response = await axiosInstance.get(`/finance/summary`, {
      params,
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Error fetching summary",
    );
  }
};

// ─────────────────────────────────────────────────────────────
// FINANCIAL PERIODS
// ─────────────────────────────────────────────────────────────

// Get the currently open financial period.
// This is the live period where new transactions are recorded.
const fetchCurrentPeriod = async () => {
  try {
    const response = await axiosInstance.get(
      `/finance/periods/current`,
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        "Error fetching current period",
    );
  }
};

// List all financial periods.
// Supports:
// { page, limit }
const fetchPeriods = async (params = {}) => {
  try {
    const response = await axiosInstance.get(`/finance/periods`, {
      params,
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        "Error fetching periods",
    );
  }
};

// Get one financial period by ID.
const fetchPeriodDetails = async (id) => {
  try {
    const response = await axiosInstance.get(
      `/finance/periods/${id}`,
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        "Error fetching period details",
    );
  }
};

// Get transactions belonging to one specific period.
//
// Supports the same filters as fetchTransactions:
// category, date_from, date_to, page, limit
const fetchPeriodTransactions = async (id, params = {}) => {
  try {
    const response = await axiosInstance.get(
      `/finance/periods/${id}/transactions`,
      {
        params,
      },
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        "Error fetching period transactions",
    );
  }
};

// Get financial summary for one specific period.
const fetchPeriodSummary = async (id) => {
  try {
    const response = await axiosInstance.get(
      `/finance/periods/${id}/summary`,
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        "Error fetching period summary",
    );
  }
};

// ─────────────────────────────────────────────────────────────
// CLOSE FINANCIAL PERIOD
// ─────────────────────────────────────────────────────────────

// Close the currently open financial period.
//
// data:
// {
//   audit_reference: optional,
//   closing_note: required
// }
//
// The backend automatically:
// - closes the current period
// - records closed_at
// - records closed_by
// - creates the next period
// - automatically assigns the next period number
//
// No title or description is required.
const closePeriod = async (data = {}) => {
  try {
    const response = await axiosInstance.post(
      `/finance/periods/close`,
      data,
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        "Failed to close period",
    );
  }
};

// ─────────────────────────────────────────────────────────────
// DELETE FINANCIAL PERIOD
// ─────────────────────────────────────────────────────────────

// Delete a financial period.
//
// The backend/database cascade will also delete all transactions
// belonging to that period.
//
// This operation is admin-only.
const deletePeriod = async (id) => {
  try {
    const response = await axiosInstance.delete(
      `/finance/periods/${id}`,
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        "Failed to delete financial period",
    );
  }
};

// ─────────────────────────────────────────────────────────────
// CLOSED PERIOD — FINAL SUMMARY SPLIT
// ─────────────────────────────────────────────────────────────
// Routes: GET/POST/PUT/DELETE /finance/periods/:id/split
// The split stores Deposit + Government (entered by the user) and Partner
// Splitting, which the backend always computes as the remainder of the
// period's final summary (net profit). Viewing is open to finance users;
// create/update/delete are admin-only.

// Errors keep the HTTP status (err.status) so a 404 ("no split yet") can
// be told apart from a real failure.
const splitError = (error, fallback) => {
  const err = new Error(error.response?.data?.message || fallback);
  err.status = error.response?.status;
  return err;
};

const fetchPeriodSplit = async (id) => {
  try {
    const response = await axiosInstance.get(`/finance/periods/${id}/split`);
    return response.data;
  } catch (error) {
    throw splitError(error, "Failed to load period split");
  }
};

const createPeriodSplit = async (id, data) => {
  try {
    const response = await axiosInstance.post(
      `/finance/periods/${id}/split`,
      data,
    );
    return response.data;
  } catch (error) {
    throw splitError(error, "Failed to save period split");
  }
};

const updatePeriodSplit = async (id, data) => {
  try {
    const response = await axiosInstance.put(
      `/finance/periods/${id}/split`,
      data,
    );
    return response.data;
  } catch (error) {
    throw splitError(error, "Failed to update period split");
  }
};

const deletePeriodSplit = async (id) => {
  try {
    const response = await axiosInstance.delete(
      `/finance/periods/${id}/split`,
    );
    return response.data;
  } catch (error) {
    throw splitError(error, "Failed to delete period split");
  }
};

export {
  // Transactions
  fetchTransactions,
  fetchTransactionDetails,
  createTransaction,
  updateTransaction,
  deleteTransaction,

  // Finance summary
  fetchFinanceSummary,

  // Financial periods
  fetchCurrentPeriod,
  fetchPeriods,
  fetchPeriodDetails,
  fetchPeriodTransactions,
  fetchPeriodSummary,

  // Period actions
  closePeriod,
  deletePeriod,

  // Closed period split
  fetchPeriodSplit,
  createPeriodSplit,
  updatePeriodSplit,
  deletePeriodSplit,
};
