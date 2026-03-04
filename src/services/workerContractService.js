import { axiosInstance } from "../utils/axios";

// Create contract
export const createWorkerContract = async (workerId, formData) => {
  try {
    const response = await axiosInstance.post(
      `/workers/${workerId}/contract`,
      formData
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to create contract"
    );
  }
};

// Update contract
export const updateWorkerContract = async (workerId, contractId, formData) => {
  try {
    const response = await axiosInstance.patch(
      `/contract/${workerId}/${contractId}`,
      formData
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to update contract"
    );
  }
};

// Get contract details
export const getWorkerContract = async (workerId, contractId) => {
  try {
    const response = await axiosInstance.get(
      `/contract/${workerId}/${contractId}`
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to get contract"
    );
  }
};

// Delete contract
export const deleteWorkerContract = async (workerId, contractId) => {
  try {
    const response = await axiosInstance.delete(
      `/contract/${workerId}/${contractId}`
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to delete contract"
    );
  }
};