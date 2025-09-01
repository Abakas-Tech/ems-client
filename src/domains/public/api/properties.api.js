import { axiosInstance } from "../../../utils/axios";

// Get all properties (with optional query params)
export const getAllProperties = async (params = {}) => {
  try {
    const response = await axiosInstance.get("/properties", { params });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to fetch properties"
    );
  }
};

// Get property by ID
export const getPropertyById = async (id) => {
  try {
    const response = await axiosInstance.get(`/properties/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to fetch property"
    );
  }
};

// Create a property
export const createProperty = async (data) => {
  try {
    const response = await axiosInstance.post("/properties", data);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to create property"
    );
  }
};

// Update a property by ID
export const updateProperty = async (id, data) => {
  try {
    const response = await axiosInstance.put(`/properties/${id}`, data);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to update property"
    );
  }
};
// Toggle property featured status
export const togglePropertyFeatured = async (id, isFeatured) => {
  try {
    const response = await axiosInstance.patch(
      `/properties/${id}/feature/${isFeatured}`
    );
    console.log(response.data)
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to toggle featured status"
    );
  }
};

// Delete a property by ID
export const deleteProperty = async (id) => {
  try {
    const response = await axiosInstance.delete(`/properties/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to delete property"
    );
  }
};
