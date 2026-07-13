import { axiosInstance } from "../../../utils/axios";

const registerWorkerCore = async (payload) => {
  try {
    const response = await axiosInstance.post("/workers/register", payload);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to register worker core",
    );
  }
};

const getWorkerBasic = async (id) => {
  try {
    const response = await axiosInstance.get(`/workers/${id}/basic`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to get worker basic info",
    );
  }
};

const updateWorkerBasic = async (id, payload) => {
  try {
    const response = await axiosInstance.patch(`/workers/${id}/basic`, payload);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to update worker basic info",
    );
  }
};

// Personal Information

const createPersonalInfo = async (id, payload) => {
  try {
    const response = await axiosInstance.post(
      `/workers/${id}/personal-info`,
      payload,
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to create personal information",
    );
  }
};

// get worker personal info
const getPersonalInfo = async (id) => {
  try {
    const response = await axiosInstance.get(`/workers/${id}/personal-info`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to get personal information",
    );
  }
};

// update worker personal info
const updatePersonalInfo = async (id, payload) => {
  try {
    const response = await axiosInstance.patch(
      `/workers/${id}/personal-info`,
      payload,
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to update personal information",
    );
  }
};

// delete worker personal info
const deletePersonalInfo = async (id) => {
  try {
    const response = await axiosInstance.delete(`/workers/${id}/personal-info`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to delete personal information",
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
const deleteMedical = async (workerId) => {
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

// Create LMIS
const createLmis = async (workerId, formData) => {
  try {
    const response = await axiosInstance.post(
      `/workers/${workerId}/lmis`,
      formData,
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to create LMIS information",
    );
  }
};

// Update LMIS
const updateLmis = async (workerId, formData) => {
  try {
    const response = await axiosInstance.patch(
      `/workers/${workerId}/lmis`,
      formData,
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to update LMIS information",
    );
  }
};

// Get LMIS details
const getLmisDetails = async (workerId) => {
  try {
    const response = await axiosInstance.get(`/workers/${workerId}/lmis`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to get LMIS information",
    );
  }
};

// Delete LMIS
const deleteLmis = async (workerId) => {
  try {
    const response = await axiosInstance.delete(`/workers/${workerId}/lmis`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to delete LMIS information",
    );
  }
};

// Create Travel Record
const createTravel = async (workerId, formData) => {
  try {
    const response = await axiosInstance.post(
      `/workers/${workerId}/travel`,
      formData,
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to create travel record",
    );
  }
};

// Update Travel Record (Partial)
const updateTravel = async (workerId, formData) => {
  try {
    const response = await axiosInstance.patch(
      `/workers/${workerId}/travel`,
      formData,
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to update travel record",
    );
  }
};

// Get Travel Details
const getTravelDetails = async (workerId) => {
  try {
    const response = await axiosInstance.get(`/workers/${workerId}/travel`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to get travel record",
    );
  }
};

// Delete Travel Record
const deleteTravel = async (workerId) => {
  try {
    const response = await axiosInstance.delete(`/workers/${workerId}/travel`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to delete travel record",
    );
  }
};

// Create a new contract for a worker
const createContract = async (workerId, formData) => {
  try {
    const response = await axiosInstance.post(
      `/workers/${workerId}/contract`,
      formData,
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to create contract",
    );
  }
};

// Update an existing contract (partial)
const updateContract = async (workerId, formData) => {
  try {
    const response = await axiosInstance.patch(
      `/workers/${workerId}/contract`,
      formData,
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to update contract",
    );
  }
};

// Get contract details by worker and contract ID
const getContractDetails = async (workerId, contractId) => {
  try {
    const response = await axiosInstance.get(
      `/workers/${workerId}/${contractId}`,
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to get contract details",
    );
  }
};

// Delete a contract
const deleteContract = async (workerId) => {
  try {
    const response = await axiosInstance.delete(
      `/workers/${workerId}/contract`,
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to delete contract",
    );
  }
};

// Create guarantor information for a worker
const createGuarantor = async (workerId, formData) => {
  try {
    const response = await axiosInstance.post(
      `/workers/${workerId}/guarantor`,
      formData,
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to create guarantor information",
    );
  }
};

// Update existing guarantor information (partial)
const updateGuarantor = async (workerId, formData) => {
  try {
    const response = await axiosInstance.patch(
      `/workers/${workerId}/guarantor`,
      formData,
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to update guarantor information",
    );
  }
};

// Get guarantor details for a worker
const getGuarantorDetails = async (workerId) => {
  try {
    const response = await axiosInstance.get(`/workers/${workerId}/guarantor`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to get guarantor details",
    );
  }
};

// Delete guarantor information
const deleteGuarantor = async (workerId) => {
  try {
    const response = await axiosInstance.delete(
      `/workers/${workerId}/guarantor`,
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to delete guarantor information",
    );
  }
};

// CREATE VISA
const createVisa = async (workerId, visaData) => {
  try {
    const response = await axiosInstance.post(
      `/workers/${workerId}/visa`,
      visaData,
    );

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Create visa error");
  }
};

// UPDATE VISA
const updateVisa = async (workerId, visaData) => {
  try {
    const response = await axiosInstance.patch(
      `/workers/${workerId}/visa`,
      visaData,
    );

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Update visa error");
  }
};

// GET VISA
const getVisa = async (workerId) => {
  try {
    const response = await axiosInstance.get(`/workers/${workerId}/visa`);

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Fetch visa error");
  }
};

// DELETE VISA
const deleteVisa = async (workerId) => {
  try {
    const response = await axiosInstance.delete(`/workers/${workerId}/visa`);

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Delete visa error");
  }
};
const getWorkerCVData = async (workerId) => {
  try {
    const response = await axiosInstance.get(`/workers/cv/${workerId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to get CV data");
  }
};
export {
  registerWorkerCore,
  getWorkerBasic,
  updateWorkerBasic,
  createPersonalInfo,
  getPersonalInfo,
  updatePersonalInfo,
  deletePersonalInfo,
  deleteWorker,
  // createWorker,
  listArchivedWorkers,
  deleteArchivedWorker,
  // updateWorker,
  listWorkers,
  listWorkersForPartners,
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
  //lmis
  createLmis,
  updateLmis,
  getLmisDetails,
  deleteLmis,
  //travel
  createTravel,
  updateTravel,
  getTravelDetails,
  deleteTravel,
  //contract
  createContract,
  updateContract,
  getContractDetails,
  deleteContract,
  //guarantor
  createGuarantor,
  updateGuarantor,
  getGuarantorDetails,
  deleteGuarantor,
  //visa
  createVisa,
  updateVisa,
  getVisa,
  deleteVisa,
  deleteMedical,
  // cv
  getWorkerCVData,
};
