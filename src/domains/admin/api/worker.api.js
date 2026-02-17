import axiosInstance from "../../../../utils/axios";

// Create new worker with photos
export const createWorker = async (formData) => {
  try {
    const response = await axiosInstance.post("/workers", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to create worker",
    );
  }
};

// List workers with pagination and filters
export const getWorkers = async (params = {}) => {
  try {
    const response = await axiosInstance.get("/workers", { params });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to fetch workers list",
    );
  }
};

// Get single worker profile (full aggregated)
export const getWorker = async (workerId) => {
  try {
    const response = await axiosInstance.get(`/workers/${workerId}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to fetch worker profile",
    );
  }
};

// List archived workers with pagination and filters
export const getArchivedWorkers = async (params = {}) => {
  try {
    const response = await axiosInstance.get("/workers/archived", { params });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to fetch archived workers",
    );
  }
};

// Get single archived worker profile
export const getArchivedWorker = async (workerId) => {
  try {
    const response = await axiosInstance.get(`/workers/archived/${workerId}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to fetch archived worker profile",
    );
  }
};

// Update worker profile with photos
export const updateWorker = async (workerId, formData) => {
  try {
    const response = await axiosInstance.patch(
      `/workers/${workerId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to update worker",
    );
  }
};

// Archive worker (soft delete)
export const archiveWorker = async (workerId) => {
  try {
    const response = await axiosInstance.delete(`/workers/${workerId}`, {
      params: { hard: "false" },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to archive worker",
    );
  }
};

// Permanently delete archived worker (hard delete)
export const deleteArchivedWorker = async (workerId) => {
  try {
    const response = await axiosInstance.delete(
      `/workers/archived/${workerId}`,
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to permanently delete archived worker",
    );
  }
};

// Restore archived worker (set is_active = 1)
export const restoreWorker = async (workerId) => {
  try {
    const response = await axiosInstance.patch(`/workers/${workerId}/restore`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to restore worker",
    );
  }
};
