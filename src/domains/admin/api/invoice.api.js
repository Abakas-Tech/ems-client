import { axiosInstance } from "../../../utils/axios";

// ─────────────────────────────────────────────────────────────
// INVOICES
// ─────────────────────────────────────────────────────────────

const fetchInvoices = async (params = {}) => {
  try {
    const response = await axiosInstance.get(`/invoices`, { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error fetching invoices");
  }
};

const fetchInvoiceDetails = async (id) => {
  try {
    const response = await axiosInstance.get(`/invoices/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Error fetching invoice details",
    );
  }
};

const createInvoice = async (data) => {
  try {
    const response = await axiosInstance.post(`/invoices`, data);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to create invoice",
    );
  }
};

const updateInvoice = async (id, data) => {
  try {
    const response = await axiosInstance.put(`/invoices/${id}`, data);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to update invoice",
    );
  }
};

const deleteInvoice = async (id) => {
  try {
    const response = await axiosInstance.delete(`/invoices/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to delete invoice",
    );
  }
};

const issueInvoice = async (id) => {
  try {
    const response = await axiosInstance.post(`/invoices/${id}/issue`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to issue invoice");
  }
};

const cancelInvoice = async (id) => {
  try {
    const response = await axiosInstance.post(`/invoices/${id}/cancel`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to cancel invoice",
    );
  }
};

// ─────────────────────────────────────────────────────────────
// INVOICE ITEMS
// ─────────────────────────────────────────────────────────────

// Apply one service/description + price to many selected workers at once.
// duplicate_action: 'skip' | 'update' | 'add' — see backend validator.
const massApplyInvoiceItems = async (invoiceId, data) => {
  try {
    const response = await axiosInstance.post(
      `/invoices/${invoiceId}/items/mass-apply`,
      data,
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to apply items");
  }
};

const updateInvoiceItem = async (invoiceId, itemId, data) => {
  try {
    const response = await axiosInstance.put(
      `/invoices/${invoiceId}/items/${itemId}`,
      data,
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to update item");
  }
};

const deleteInvoiceItem = async (invoiceId, itemId) => {
  try {
    const response = await axiosInstance.delete(
      `/invoices/${invoiceId}/items/${itemId}`,
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to delete item");
  }
};

// ─────────────────────────────────────────────────────────────
// INVOICE PAYMENTS
// Recorded directly into the existing financial_transactions table
// (category 'income', tagged with invoice_id) — no separate
// invoice_payments table, and no confirm/reject step. Recording IS
// adding it to Finance, same as any other transaction.
// ─────────────────────────────────────────────────────────────

const recordInvoicePayment = async (invoiceId, data) => {
  try {
    const response = await axiosInstance.post(
      `/invoices/${invoiceId}/payments`,
      data,
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to record payment",
    );
  }
};

// Returns the financial_transactions rows tagged with this invoice.
const fetchInvoicePayments = async (invoiceId) => {
  try {
    const response = await axiosInstance.get(`/invoices/${invoiceId}/payments`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error fetching payments");
  }
};

// ─────────────────────────────────────────────────────────────
// CUSTOMER LOOKUP (for the invoice's "Customer" field)
// ─────────────────────────────────────────────────────────────

// Reuses the existing GET /users/lookup endpoint (role_id 3 = partner),
// the same lightweight id+name lookup already used elsewhere for dropdowns.
const fetchCustomerOptions = async (params = {}) => {
  try {
    const response = await axiosInstance.get(`/users/lookup`, {
      params: { role_id: 3, ...params },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Error fetching customers",
    );
  }
};

export {
  // Invoices
  fetchInvoices,
  fetchInvoiceDetails,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  issueInvoice,
  cancelInvoice,

  // Items
  massApplyInvoiceItems,
  updateInvoiceItem,
  deleteInvoiceItem,

  // Payments
  recordInvoicePayment,
  fetchInvoicePayments,

  // Customers
  fetchCustomerOptions,
};
