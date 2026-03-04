import { axiosInstance } from "../utils/axios";

// Create travel record
export const createTravelRecord = async (workerId, formData) => {
  try {
    const response = await axiosInstance.post(
      `/workers/${workerId}/travel`,
      formData
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to create travel record"
    );
  }
};

// Update travel record
export const updateTravelRecord = async (workerId, formData) => {
  try {
    const response = await axiosInstance.patch(
      `/workers/${workerId}/travel`,
      formData
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to update travel record"
    );
  }
};

// Get travel record
export const getTravelRecord = async (workerId) => {
  try {
    const response = await axiosInstance.get(`/workers/${workerId}/travel`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to get travel record"
    );
  }
};

// Delete travel record
export const deleteTravelRecord = async (workerId) => {
  try {
    const response = await axiosInstance.delete(`/workers/${workerId}/travel`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to delete travel record"
    );
  }
};