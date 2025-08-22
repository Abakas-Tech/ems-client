import { axiosInstance } from "../../utils/axios";

// Get all properties (with optional query params)
export const getAllProperties = async (params = {}) => {
  try {
    const response = await axiosInstance.get("/properties", {
      params,
    });
    console.log(response)
    return response.data;
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.message || error.message || "Unknown error",
    };
  }
};

// Get property by ID
export const getPropertyById = async (id) => {
  try {
    const token = localStorage.getItem("authToken");
    const response = await axiosInstance.get(`/properties/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.message || error.message || "Unknown error",
    };
  }
};

// Create a property
export const createProperty = async (data) => {
  console.log(data);
  try {
    const response = await axiosInstance.post("/properties", data, {});
    return response.data;
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.message || error.message || "Unknown error",
    };
  }
};

// Update a property by ID
export const updateProperty = async (id, data) => {
  try {
    const token = localStorage.getItem("authToken");
    const response = await axiosInstance.put(`/properties/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.message || error.message || "Unknown error",
    };
  }
};

// Delete a property by ID
export const deleteProperty = async (id) => {
  try {
    const token = localStorage.getItem("authToken");
    const response = await axiosInstance.delete(`/properties/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.message || error.message || "Unknown error",
    };
  }
};
