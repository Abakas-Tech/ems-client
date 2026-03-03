import { axiosInstance } from "../../../utils/axios";

//  countries api
const getCountries = async (params = {}) => {
  try {
   const response = await axiosInstance.get("/meta/countries",{ params});
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to fetch countries",
    );
  }
};

// Get a country by ID
const getCountryById = async (id) => {
  try {
    const response = await axiosInstance.get(`/meta/countries/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to fetch country",
    );
  }
};

// Create a new country
const createCountry = async (data) => {
  try {
    const response = await axiosInstance.post("/meta/countries", data);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to create country",
    );
  }
};

// Update a country by ID
const updateCountry = async (id, data) => {
  try {
    const response = await axiosInstance.put(`/meta/countries/${id}`, data);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to update country",
    );
  }
};

// Delete a country by ID
const deleteCountry = async (id) => {
  try {
    const response = await axiosInstance.delete(`/meta/countries/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to delete country",
    );
  }
};

//regions api
// Get regions
const getRegions = async (params = {}) => {
  try {
    const response = await axiosInstance.get("/meta/regions", { params });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to fetch regions",
    );
  }
};

// Get region by ID
const getRegionById = async (id) => {
  try {
    const response = await axiosInstance.get(`/meta/regions/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to fetch region",
    );
  }
};

// Create region
const createRegion = async (data) => {
  try {
    const response = await axiosInstance.post("/meta/regions", data);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to create region",
    );
  }
};

// Update region
const updateRegion = async (id, data) => {
  try {
    const response = await axiosInstance.put(`/meta/regions/${id}`, data);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to update region",
    );
  }
};

// Delete region
const deleteRegion = async (id) => {
  try {
    const response = await axiosInstance.delete(`/meta/regions/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to delete region",
    );
  }
};


//cities api
// Get city by ID
const getCityById = async (id) => {
  try {
    const response = await axiosInstance.get(`/meta/cities/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to fetch city",
    );
  }
};


// Get cities
const getCities = async (region_id, name = "") => {
  if (!region_id) return [];

  try {
    const response = await axiosInstance.get("/meta/cities", {
      params: {
        region_id,
        ...(name ? { name } : {}),
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to fetch cities",
    );
  }
};

// Create city
const createCity = async (data) => {
  try {
    const response = await axiosInstance.post("/meta/cities", data);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to create city",
    );
  }
};

// Update city
const updateCity = async (id, data) => {
  try {
    const response = await axiosInstance.put(`/meta/cities/${id}`, data);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to update city",
    );
  }
};

// Delete city
const deleteCity = async (id) => {
  try {
    const response = await axiosInstance.delete(`/meta/cities/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to delete city",
    );
  }
};

// skills api
// Get all skills
const getSkills = async (params = {}) => {
  try {
    const response = await axiosInstance.get("/meta/skills", { params });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to fetch skills",
    );
  }
};

// Get skill by ID
const getSkillById = async (id) => {
  try {
    const response = await axiosInstance.get(`/meta/skills/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to fetch skill",
    );
  }
};

// Create skill
const createSkill = async (data) => {
  try {
    const response = await axiosInstance.post("/meta/skills", data);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to create skill",
    );
  }
};

// Update skill
const updateSkill = async (id, data) => {
  try {
    const response = await axiosInstance.put(`/meta/skills/${id}`, data);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to update skill",
    );
  }
};

// Delete skill
const deleteSkill = async (id) => {
  try {
    const response = await axiosInstance.delete(`/meta/skills/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to delete skill",
    );
  }
};

// job positions api
// Get all job positions
const getJobPositions = async (params = {}) => {
  try {
    const response = await axiosInstance.get("/meta/job-positions", { params });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to fetch job positions",
    );
  }
};

// Get job position by ID
const getJobPositionById = async (id) => {
  try {
    const response = await axiosInstance.get(`/meta/job-positions/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to fetch job position",
    );
  }
};

// Create job position
const createJobPosition = async (data) => {
  try {
    const response = await axiosInstance.post("/meta/job-positions", data);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to create job position",
    );
  }
};

// Update job position
const updateJobPosition = async (id, data) => {
  try {
    const response = await axiosInstance.put(
      `/meta/job-positions/${id}`,
      data,
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to update job position",
    );
  }
};

// Delete job position
const deleteJobPosition = async (id) => {
  try {
    const response = await axiosInstance.delete(
      `/meta/job-positions/${id}`,
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to delete job position",
    );
  }
};

// language api

// Get all languages
const getLanguages = async (params = {}) => {
  try {
    const response = await axiosInstance.get("/meta/languages", { params });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to fetch languages",
    );
  }
};


// Get language by ID
const getLanguageById = async (id) => {
  try {
    const response = await axiosInstance.get(`/meta/languages/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to fetch language",
    );
  }
};

// Create language
const createLanguage = async (data) => {
  try {
    const response = await axiosInstance.post("/meta/languages", data);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to create language",
    );
  }
};

// Update language
const updateLanguage = async (id, data) => {
  try {
    const response = await axiosInstance.put(`/meta/languages/${id}`, data);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to update language",
    );
  }
};

// Delete language
const deleteLanguage = async (id) => {
  try {
    const response = await axiosInstance.delete(`/meta/languages/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to delete language",
    );
  }
};

// worker status api
// Get worker status by ID
const getWorkerStatusById = async (id) => {
  try {
    const response = await axiosInstance.get(
      `/meta/worker-statuses/${id}`,
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to fetch worker status",
    );
  }
};

// Get worker status
const getWorkerStatuses = async (params={}) => {
  try {
    const response = await axiosInstance.get("/meta/worker-statuses", { params });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to fetch status",
    );
  }
};

// Create worker status
const createWorkerStatus = async (data) => {
  try {
    const response = await axiosInstance.post(
      "/meta/worker-statuses",
      data,
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to create worker status",
    );
  }
};


// Delete worker status
const deleteWorkerStatus = async (id) => {
  try {
    const response = await axiosInstance.delete(
      `/meta/worker-statuses/${id}`,
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to delete worker status",
    );
  }
};

// Update worker status
const updateWorkerStatus = async (id, data) => {
  try {
    const response = await axiosInstance.put(
      `/meta/worker-statuses/${id}`,
      data,
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to update worker status",
    );
  }
};




export {
  // countries
  getCountries,
  getCountryById,
  createCountry,
  updateCountry,
  deleteCountry,
  // regions
  getRegions,
  getRegionById,
  createRegion,
  updateRegion,
  deleteRegion,
  // cities
  getCities,
  getCityById,
  createCity,
  updateCity,
  deleteCity,
    // Skills
  getSkills,
  getSkillById,
  createSkill,
  updateSkill,
  deleteSkill,
  // Job Positions
  getJobPositions,
  getJobPositionById,
  createJobPosition,
  updateJobPosition,
  deleteJobPosition,
  // Languages
  getLanguages,
  getLanguageById,
  createLanguage,
  updateLanguage,
  deleteLanguage,
  // Worker Status
  getWorkerStatuses,
  getWorkerStatusById,
  createWorkerStatus,
  updateWorkerStatus,
  deleteWorkerStatus,
};