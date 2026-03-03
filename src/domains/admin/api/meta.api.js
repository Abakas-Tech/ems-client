import { axiosInstance } from "../../../utils/axios";

// Get all countries
const getCountries = async () => {
  try {
    const response = await axiosInstance.get("/meta/countries");
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

// Get regions
const getRegions = async () => {
  try {
    const response = await axiosInstance.get("/meta/regions");
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to fetch regions",
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

// Get worker status
const getWorkerStatuses = async () => {
  try {
    const response = await axiosInstance.get("/meta/worker-statuses");
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to fetch status",
    );
  }
};

export {
  getCountries,
  getCountryById,
  createCountry,
  updateCountry,
  deleteCountry,
  getRegions,
  getCities,
  getWorkerStatuses,
};
