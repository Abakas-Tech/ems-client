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
    console.log(response);
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

// PASSPORT API

// Create passport
const createPassport = async (workerId, formData) => {
  try {
    const response = await axiosInstance.post(
      `/workers/${workerId}/passport`,
      formData,
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to create passport",
    );
  }
};

// Update passport
const updatePassport = async (workerId, formData) => {
  try {
    const response = await axiosInstance.patch(
      `/workers/${workerId}/passport`,
      formData,
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to update passport",
    );
  }
};

// Get passport details
const getPassportDetails = async (workerId) => {
  try {
    const response = await axiosInstance.get(`/workers/${workerId}/passport`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to get passport details",
    );
  }
};

// Delete passport
const deletePassport = async (workerId) => {
  try {
    const response = await axiosInstance.delete(
      `/workers/${workerId}/passport`,
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to delete passport",
    );
  }
};

// COC API

// Create COC
const createCoc = async (workerId, formData) => {
  try {
    const response = await axiosInstance.post(
      `/workers/${workerId}/coc`,
      formData,
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || "Failed to create COC",
    );
  }
};

// Update COC
const updateCoc = async (workerId, formData) => {
  try {
    const response = await axiosInstance.patch(
      `/workers/${workerId}/coc`,
      formData,
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || "Failed to update COC",
    );
  }
};

// Get COC details
const getCocDetails = async (workerId) => {
  try {
    const response = await axiosInstance.get(`/workers/${workerId}/coc`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to get COC details",
    );
  }
};

// Delete COC
const deleteCoc = async (workerId) => {
  try {
    const response = await axiosInstance.delete(`/workers/${workerId}/coc`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || "Failed to delete COC",
    );
  }
};

// MEDICAL API

// Create medical record
const createMedicalRecord = async (workerId, formData) => {
  try {
    const response = await axiosInstance.post(
      `/workers/${workerId}/medical`,
      formData,
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to create medical record",
    );
  }
};

// Update medical
const updateMedicalRecord = async (workerId, formData) => {
  try {
    const response = await axiosInstance.patch(
      `/workers/${workerId}/medical`,
      formData,
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to update medical record",
    );
  }
};

// Get medical details
const getMedicalDetails = async (workerId) => {
  try {
    const response = await axiosInstance.get(`/workers/${workerId}/medical`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to get medical details",
    );
  }
};

// Delete medical record
const deleteMedicalRecord = async (workerId) => {
  try {
    const response = await axiosInstance.delete(`/workers/${workerId}/medical`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to delete medical record",
    );
  }
};

export {
  deleteWorker,
  createWorker,
  listArchivedWorkers,
  deleteArchivedWorker,
  updateWorker,
  listWorkers,
  getWorkerProfile,
  getArchivedWorkerProfile,
  restoreWorker,
  createPassport,
  updatePassport,
  getPassportDetails,
  deletePassport,
  createCoc,
  updateCoc,
  getCocDetails,
  deleteCoc,
  createMedicalRecord,
  updateMedicalRecord,
  getMedicalDetails,
  deleteMedicalRecord,
};
