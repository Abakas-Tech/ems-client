import { axiosInstance } from "../../../utils/axios";

// Create a worker with personal information and all related sections in one call
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

// Update a worker with personal information and all related sections in one call
const updateWorker = async (id, formData) => {
  try {
    const response = await axiosInstance.patch(`/workers/${id}`, formData);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to update worker",
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

// Get single active worker profile (full aggregated profile, used to prefill the edit form)
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

// Get worker data formatted for CV generation (personal info, passport,
// skills, languages, experience, photos - everything the CV templates need).
// Matches: router.get("/:id", ...) in the workerCV router.
// NOTE: adjust the base path below ("/worker-cv") if this router is mounted
// under a different prefix in your app.js/index.js (app.use("<prefix>", router)).
const getWorkerCVData = async (id) => {
  try {
    const response = await axiosInstance.get(`/worker-cv/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to get worker CV data",
    );
  }
};

// Ask the backend to generate the CV PDF for a given partner and upload it
// (admin/employee only). Matches: router.post("/:id/generate-cv", ...).
// This is the server-side counterpart to handleGenerateAndUpload() in
// CVThree.jsx - use this instead once client-side PDF generation there is
// swapped out for a backend-generated CV.
const generateCvForPartner = async (id, payload) => {
  try {
    const response = await axiosInstance.post(
      `/worker-cv/${id}/generate-cv`,
      payload,
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || "Failed to generate CV",
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

const listWorkersForPartners = async (params = {}) => {
  try {
    const response = await axiosInstance.get("/workers/partners", { params });
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

export {
  createWorker,
  updateWorker,
  listWorkers,
  listWorkersForPartners,
  getWorkerProfile,
  getWorkerCVData,
  generateCvForPartner,
  listArchivedWorkers,
  deleteArchivedWorker,
  getArchivedWorkerProfile,
  restoreWorker,
  deleteWorker,
};
