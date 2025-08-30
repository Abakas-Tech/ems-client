import { axiosInstance } from "../../../utils/axios";

// Get all images for a property
export const getPropertyImages = async (propertyId) => {
  try {
    const response = await axiosInstance.get(
      `/properties/${propertyId}/images`
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || "Unknown error"
    );
  }
};

// Get single image by propertyId and imageId
export const getPropertyImageById = async (propertyId, imageId) => {
  try {
    const token = localStorage.getItem("authToken");
    const response = await axiosInstance.get(
      `/properties/${propertyId}/images/${imageId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || "Unknown error"
    );
  }
};

// Add multiple images to a property
export const addPropertyImages = async (propertyId, formData) => {
  try {
    const response = await axiosInstance.post(
      `/properties/${propertyId}/images`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to upload images"
    );
  }
};

// Update multiple images for a property
export const updatePropertyImages = async (propertyId, formData) => {
  try {
    const response = await axiosInstance.put(
      `/properties/${propertyId}/images`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || "Unknown error"
    );
  }
};

// Delete a single image for a property
export const deletePropertyImage = async (propertyId, imageId) => {
  try {
    const token = localStorage.getItem("authToken");
    const response = await axiosInstance.delete(
      `/properties/${propertyId}/images/${imageId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || "Unknown error"
    );
  }
};

// Update altText for property images
export const updatePropertyImagesAltText = async (propertyId, payload) => {
  try {
    const response = await axiosInstance.patch(
      `/properties/${propertyId}/images/altText`,
      payload
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to update altText"
    );
  }
};

// Bulk delete altText for multiple images
export const deletePropertyImagesAltText = async (propertyId, payload) => {
  try {
    const response = await axiosInstance.delete(
      `/properties/${propertyId}/images/altText`,
      {
        data: payload,
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to delete altText"
    );
  }
};
