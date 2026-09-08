import { axiosInstance } from "../../../utils/axios";

const listLoginActivity = async (params = {}) => {
  try {
    const response = await axiosInstance.get("/login-activity", { params });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to fetch login activity",
    );
  }
};

// NEW — single record, used by the notification-bell click-through and by
// direct links / page refresh on the activity detail page.
const getLoginActivityById = async (id) => {
  try {
    const response = await axiosInstance.get(`/login-activity/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to fetch login activity",
    );
  }
};

const listAuditLog = async (params = {}) => {
  try {
    const response = await axiosInstance.get("/audit-logs", { params });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to fetch audit log",
    );
  }
};

// NEW — single record, used by the notification-bell click-through and by
// direct links / page refresh on the activity detail page.
const getAuditLogById = async (id) => {
  try {
    const response = await axiosInstance.get(`/audit-logs/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to fetch audit log",
    );
  }
};

const deleteLoginActivity = async (id) => {
  try {
    const response = await axiosInstance.delete(`/login-activity/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Login record delete error",
    );
  }
};

const deleteAuditLog = async (id) => {
  try {
    const response = await axiosInstance.delete(`/audit-logs/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Audit log delete error");
  }
};

const deleteAllLoginActivity = async () => {
  try {
    const response = await axiosInstance.delete("/login-activity");
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Login records delete error",
    );
  }
};

const deleteAllAuditLog = async () => {
  try {
    const response = await axiosInstance.delete("/audit-logs");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Audit log delete error");
  }
};

export {
  listLoginActivity,
  getLoginActivityById,
  listAuditLog,
  getAuditLogById,
  deleteLoginActivity,
  deleteAuditLog,
  deleteAllLoginActivity,
  deleteAllAuditLog,
};
