import { axiosInstance } from "../../../utils/axios";

// skill apis

// Assign skill to worker
const assignWorkerSkill = async (worker_id, data) => {
  try {
    const response = await axiosInstance.post(
      `/workers/meta/${worker_id}/skills`,
      data,
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Assign skill error");
  }
};

// List worker skills
const getWorkerSkills = async (worker_id) => {
  try {
    const response = await axiosInstance.get(
      `/workers/meta/${worker_id}/skills`,
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Fetch skills error");
  }
};

// Remove worker skill
const deleteWorkerSkill = async (worker_id, skill_id) => {
  try {
    const response = await axiosInstance.delete(
      `/workers/meta/${worker_id}/skills/${skill_id}`,
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Delete skill error");
  }
};

// language apis
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
const updateWorkerLanguage = async (workerId, languageId, data) => {
  try {
    const response = await axiosInstance.patch(
      `/workers/meta/${workerId}/languages/${languageId}`,
      data,
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Update language error");
  }
};

// Delete language
const deleteWorkerLanguage = async (workerId, languageId) => {
  try {
    const response = await axiosInstance.delete(
      `/workers/meta/${workerId}/languages/${languageId}`,
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Delete language error");
  }
};

// position apis

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

// Update position
const updateWorkerPosition = async (workerId, positionId, data) => {
  try {
    const response = await axiosInstance.patch(
      `/workers/meta/${workerId}/positions/${positionId}`,
      data,
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Update position error");
  }
};

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

// status api
// Get current status of a worker
const getWorkerCurrentStatus = async (workerId) => {
  try {
    const response = await axiosInstance.get(
      `/workers/meta/${workerId}/statuses`,
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch worker status",
    );
  }
};

// Assign a status to a worker
const assignWorkerStatus = async (workerId, statusId) => {
  try {
    const response = await axiosInstance.post(
      `/workers/meta/${workerId}/statuses`,
      { status_id: statusId },
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to assign status");
  }
};

// Delete/revoke a status from a worker
const deleteWorkerStatus = async (workerId, statusId) => {
  try {
    const response = await axiosInstance.delete(
      `/workers/meta/${workerId}/statuses/${statusId}`,
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to delete worker status",
    );
  }
};

// Update worker status
// export const updateWorkerStatuse = async (workerId, statusId) => {
//   try {
//     const response = await axiosInstance.patch(
//       `/workers/meta/${workerId}/status`,
//       { status_id: statusId },
//     );
//     return response.data;
//   } catch (error) {
//     throw new Error(error.response?.data?.message || "Update status error");
//   }
// };

// worker country apis
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

// Remove experience
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
  // skill apis
  assignWorkerSkill,
  getWorkerSkills,
  deleteWorkerSkill,
  // language apis
  addWorkerLanguage,
  getWorkerLanguages,
  updateWorkerLanguage,
  deleteWorkerLanguage,
  // position apis
  addWorkerPosition,
  getWorkerPositions,
  updateWorkerPosition,
  deleteWorkerPosition,
  // status apis
  getWorkerCurrentStatus,
  assignWorkerStatus,
  deleteWorkerStatus,
  // updateWorkerStatuses,
  // worker experience apis
  addWorkerExperience,
  getWorkerExperiences,
  deleteWorkerExperience,
};
