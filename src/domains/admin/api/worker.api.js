import { axiosInstance } from "../../../utils/axios";

// Create worker
const createWorker = async (formData) => {
  try {
    const response = await axiosInstance.post("/workers", formData);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to create worker",
    );
  }
};

// List archived workers (paginated + filters)
const listArchivedWorkers = async (params = {}) => {
  try {
    const response = await axiosInstance.get("/workers/archived", { params });
    return response.data.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to list archived workers",
    );
  }
};

// Delete archived worker (hard delete)
const deleteArchivedWorker = async (id) => {
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
const getArchivedWorkerProfile = async (id) => {
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
const restoreWorker = async (id) => {
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

// Update worker
const updateWorker = async (Payload, id) => {
  try {
    const response = await axiosInstance.patch(`/workers/${id}`, Payload);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to update worker",
    );
  }
};

// Get single active worker profile
const getWorkerProfile = async (id) => {
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
const listWorkers = async (params = {}) => {
  try {
    const response = await axiosInstance.get("/workers", { params });
    return response.data.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to list workers",
    );
  }
};

// Delete / archive worker
const deleteWorker = async (id, hard = false) => {
  try {
    const response = await axiosInstance.delete(`/workers/${id}`, {
      params: { hard },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to delete worker",
    );
  }
};

export {
  deleteWorker,
  // personalInformation,
  createWorker,
  listArchivedWorkers,
  deleteArchivedWorker,
  updateWorker,
  listWorkers,
  getWorkerProfile,
  getArchivedWorkerProfile,
  restoreWorker,
};
