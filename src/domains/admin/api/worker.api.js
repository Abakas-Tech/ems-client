import axiosInstance from "../../../utils/axios";

// Create new worker account
export const createWorker = async (payload) => {
  try {
    const response = await axiosInstance.post("/workers", payload);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to create worker",
    );
  }
};

// Create worker personal information
export const createWorkerPersonalInfo = async (workerId, formData) => {
  try {
    const response = await axiosInstance.post(
      `/workers/${workerId}/personal-info`,
      formData,
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to create worker personal info",
    );
  }
};

// List archived workers (paginated + filters)
export const listArchivedWorkers = async (params = {}) => {
  try {
    const response = await axiosInstance.get("/workers/archived", { params });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to list archived workers",
    );
  }
};

// Delete archived worker (hard delete)
export const deleteArchivedWorker = async (id) => {
  try {
    const response = await axiosInstance.delete(`/workers/archived/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to delete archived worker",
    );
  }
};

// Get single archived worker profile
export const getArchivedWorkerProfile = async (id) => {
  try {
    const response = await axiosInstance.get(`/workers/archived/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to get archived worker profile",
    );
  }
};

// Restore archived worker 
export const restoreWorker = async (id) => {
  try {
    const response = await axiosInstance.patch(`/workers/${id}/restore`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to restore worker",
    );
  }
};

// Update worker account info
export const updateWorker = async (workerId, payload) => {
  try {
    const response = await axiosInstance.patch(`/workers/${workerId}`, payload);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to update worker",
    );
  }
};

// UpdATE worker personal info
export const updateWorkerPersonalInfo = async (workerId, formData) => {
  try {
    const response = await axiosInstance.patch(
      `/workers/${workerId}/personal-info`,
      formData,
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to update worker personal info",
    );
  }
};

// Get single active worker profile
export const getWorkerProfile = async (id) => {
  try {
    const response = await axiosInstance.get(`/workers/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to get worker profile",
    );
  }
};

// List workers with pagination and filters
export const listWorkers = async (params = {}) => {
  try {
    const response = await axiosInstance.get("/workers", { params });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to list workers",
    );
  }
};

// Delete / archive worker
export const deleteWorker = async (id) => {
  try {
    const response = await axiosInstance.delete(`/workers/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to delete worker",
    );
  }
};
