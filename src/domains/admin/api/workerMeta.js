import { axiosInstance } from "../../../utils/axios";

// skill apis

// Assign skill to worker
const assignWorkerSkill = async (workerId, data) => {
  try {
    const response = await axiosInstance.post(
      `/worker-meta/${workerId}/skills`,
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
    const response = await axiosInstance.get(`/worker-meta/${workerId}/skills`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Fetch skills error");
  }
};

// Remove worker skill
const deleteWorkerSkill = async (workerId, skillId) => {
  try {
    const response = await axiosInstance.delete(
      `/worker-meta/${workerId}/skills/${skillId}`,
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
      `/worker-meta/${workerId}/languages`,
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
      `/worker-meta/${workerId}/languages`,
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
      `/worker-meta/${workerId}/languages/${languageId}`,
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
      `/worker-meta/${workerId}/languages/${languageId}`,
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
      `/worker-meta/${workerId}/positions`,
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
      `/worker-meta/${workerId}/positions`,
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
      `/worker-meta/${workerId}/positions/${positionId}`,
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
      `/worker-meta/${workerId}/positions/${positionId}`,
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Delete position error");
  }
};

// status api

// Update worker status
const updateWorkerStatus = async (workerId, data) => {
  try {
    const response = await axiosInstance.patch(
      `/worker-meta/${workerId}/status`,
      data,
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Update status error");
  }
};

// worker country apis

// Add country
const addWorkerCountry = async (workerId, data) => {
  try {
    const response = await axiosInstance.post(
      `/worker-meta/${workerId}/countries`,
      data,
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Add country error");
  }
};

// List countries
const getWorkerCountries = async (workerId) => {
  try {
    const response = await axiosInstance.get(
      `/worker-meta/${workerId}/countries`,
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Fetch countries error");
  }
};

// Remove country
const deleteWorkerCountry = async (workerId, countryId) => {
  try {
    const response = await axiosInstance.delete(
      `/worker-meta/${workerId}/countries/${countryId}`,
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Delete country error");
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
  // status api
  updateWorkerStatus,
  // worker country apis
  addWorkerCountry,
  getWorkerCountries,
  deleteWorkerCountry,
};
