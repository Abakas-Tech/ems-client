import { axiosInstance } from "../../../utils/axios";



// Assign skill to worker
const assignWorkerSkill = async (workerId, data) => {
  try {
    const response = await axiosInstance.post(
      `/workers/meta/${workerId}/skills`,
      data,
    );

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Assign skill error");
  }
};

// List worker skills
const getWorkerSkills = async (workerId) => {
  try {
    const response = await axiosInstance.get(
      `/workers/meta/${workerId}/skills`,
    );

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Fetch skills error");
  }
};

// Remove worker skill
const deleteWorkerSkill = async (workerId, skill) => {
  try {
    const response = await axiosInstance.delete(
      `/workers/meta/${workerId}/skills/${encodeURIComponent(skill)}`,
    );

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Delete skill error");
  }
};



// Add language
const addWorkerLanguage = async (workerId, data) => {
  try {
    const response = await axiosInstance.post(
      `/workers/meta/${workerId}/languages`,
      data,
    );

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Add language error");
  }
};

// List languages
const getWorkerLanguages = async (workerId) => {
  try {
    const response = await axiosInstance.get(
      `/workers/meta/${workerId}/languages`,
    );

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Fetch languages error");
  }
};

// Update language
// Backend identifies the old language by its actual string value.
const updateWorkerLanguage = async (workerId, oldLanguage, data) => {
  try {
    const response = await axiosInstance.patch(
      `/workers/meta/${workerId}/languages/${encodeURIComponent(oldLanguage)}`,
      data,
    );

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Update language error");
  }
};

// Delete language
const deleteWorkerLanguage = async (workerId, language) => {
  try {
    const response = await axiosInstance.delete(
      `/workers/meta/${workerId}/languages/${encodeURIComponent(language)}`,
    );

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Delete language error");
  }
};

// ==================== WORKER JOB POSITIONS ====================

// Add position
const addWorkerPosition = async (workerId, data) => {
  try {
    const response = await axiosInstance.post(
      `/workers/meta/${workerId}/positions`,
      data,
    );

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Add position error");
  }
};

// List positions
const getWorkerPositions = async (workerId) => {
  try {
    const response = await axiosInstance.get(
      `/workers/meta/${workerId}/positions`,
    );

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Fetch positions error");
  }
};

// NOTE:
// There is NO update position endpoint in the backend.
// Therefore updateWorkerPosition has been removed.

// Delete position
const deleteWorkerPosition = async (workerId, positionId) => {
  try {
    const response = await axiosInstance.delete(
      `/workers/meta/${workerId}/positions/${positionId}`,
    );

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Delete position error");
  }
};



// Get worker status history
const getWorkerCurrentStatus = async (workerId) => {
  try {
    const response = await axiosInstance.get(
      `/workers/meta/${workerId}/statuses`,
    );

    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch worker statuses",
    );
  }
};

// Assign status to worker
const assignWorkerStatus = async (workerId, statusId) => {
  try {
    const response = await axiosInstance.post(
      `/workers/meta/${workerId}/statuses`,
      {
        status_id: statusId,
      },
    );

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to assign status");
  }
};

// Update worker status
const updateWorkerStatus = async (workerId, statusId) => {
  try {
    const response = await axiosInstance.patch(
      `/workers/meta/${workerId}/status`,
      {
        status_id: statusId,
      },
    );

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Update status error");
  }
};

// Delete status history record
// Backend expects this route parameter as the history ID,
// even though the route calls it status_id.
const deleteWorkerStatus = async (workerId, historyId) => {
  try {
    const response = await axiosInstance.delete(
      `/workers/meta/${workerId}/statuses/${historyId}`,
    );

    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to delete worker status",
    );
  }
};



// Add experience
const addWorkerExperience = async (workerId, data) => {
  try {
    const response = await axiosInstance.post(
      `/workers/meta/${workerId}/experiences`,
      data,
    );

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Add experience error");
  }
};

// List experiences
const getWorkerExperiences = async (workerId) => {
  try {
    const response = await axiosInstance.get(
      `/workers/meta/${workerId}/experiences`,
    );

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Fetch experiences error");
  }
};

// Update experience
const updateWorkerExperience = async (workerId, experienceId, data) => {
  try {
    const response = await axiosInstance.patch(
      `/workers/meta/${workerId}/experiences/${experienceId}`,
      data,
    );

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Update experience error");
  }
};

// Delete experience
const deleteWorkerExperience = async (workerId, experienceId) => {
  try {
    const response = await axiosInstance.delete(
      `/workers/meta/${workerId}/experiences/${experienceId}`,
    );

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Delete experience error");
  }
};



export {
  // Skills
  assignWorkerSkill,
  getWorkerSkills,
  deleteWorkerSkill,

  // Languages
  addWorkerLanguage,
  getWorkerLanguages,
  updateWorkerLanguage,
  deleteWorkerLanguage,

  // Positions
  addWorkerPosition,
  getWorkerPositions,
  deleteWorkerPosition,

  // Status
  getWorkerCurrentStatus,
  assignWorkerStatus,
  updateWorkerStatus,
  deleteWorkerStatus,

  // Experiences
  addWorkerExperience,
  getWorkerExperiences,
  updateWorkerExperience,
  deleteWorkerExperience,
};
