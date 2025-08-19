import { axiosInstance } from "../../utils/axios";

// Get all images for a property
export const getPropertyImages = async (propertyId) => {
  try {
    const response = await axiosInstance.get(
      `/properties/${propertyId}/images`
    );
    return response.data;
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.message || error.message || "Unknown error",
    };
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
    return {
      success: false,
      message:
        error.response?.data?.message || error.message || "Unknown error",
    };
  }
};

// Add multiple images to a property
export const addPropertyImages = async (propertyId, formData) => {
  try {
    const token = localStorage.getItem("authToken");
    const response = await axiosInstance.post(
      `/properties/${propertyId}/images`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.message || error.message || "Unknown error",
    };
  }
};

// Update a single image for a property
export const updatePropertyImage = async (propertyId, imageId, formData) => {
  try {
    const token = localStorage.getItem("authToken");
    const response = await axiosInstance.put(
      `/properties/${propertyId}/images/${imageId}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.message || error.message || "Unknown error",
    };
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
    return {
      success: false,
      message:
        error.response?.data?.message || error.message || "Unknown error",
    };
  }
};
