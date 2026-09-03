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
// Matches: router.get("/:id", ...) in workerCV.route.js, mounted at
// "/workers/cv" in the main index route file.
// Optional `partnerId` is sent as ?partnerId=... - the controller reads this
// as `previewPartnerId` and, per confirmation, uses it to flag whether this
// CV has already been shared with that specific partner.
const getWorkerCVData = async (id, partnerId) => {
  try {
    const response = await axiosInstance.get(`/workers/cv/${id}`, {
      params: partnerId ? { partnerId } : undefined,
    });
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
// (admin/employee only). Matches: router.post("/:id/generate-cv", ...) in
// workerCV.route.js, mounted at "/workers/cv" in the main index route file.
// This is the server-side counterpart to handleGenerateAndUpload() in
// CVThree.jsx - use this instead once client-side PDF generation there is
// swapped out for a backend-generated CV.
const generateCvForPartner = async (id, payload) => {
  try {
    const response = await axiosInstance.post(
      `/workers/cv/${id}/generate-cv`,
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

const listSharedCvsForPartner = async () => {
  try {
    const response = await axiosInstance.get("/workers/cv/shared/list");
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || "Failed to list shared CVs",
    );
  }
};

const setPartnerCvAccess = async (id, payload) => {
  try {
    const response = await axiosInstance.patch(
      `/workers/cv/${id}/partner-access`,
      payload,
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to update partner access",
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
  listSharedCvsForPartner,
  setPartnerCvAccess,
};
