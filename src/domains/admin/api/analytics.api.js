import { axiosInstance } from "../../../utils/axios";

// Helper to safely extract error message
const getErrorMessage = (error, fallback) => {
  const message = error.response?.data?.message;
  if (!message) return fallback;
  return typeof message === "string" ? message : JSON.stringify(message);
};

//  Properties Analytics
export const fetchPropertiesAnalytics = async (params = {}) => {
  try {
    const response = await axiosInstance.get(`/analytics/properties`, {
      params: Object.keys(params).length > 0 ? params : undefined,
    });
    return response?.data?.data;
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "Failed to fetch property analytics")
    );
  }
};

//  Properties Count
export const fetchPropertiesCount = async () => {
  try {
    const response = await axiosInstance.get(`/analytics/count/properties`);
    return response?.data?.data;
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "Failed to fetch property analytics")
    );
  }
};

//  Appointment Analytics
export const fetchAppointmentAnalytics = async () => {
  try {
    const response = await axiosInstance.get(`/analytics/appointments`);
    return response.data.data;
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "Failed to fetch appointment analytics")
    );
  }
};

//  File Analytics
export const fetchFileAnalytics = async () => {
  try {
    const response = await axiosInstance.get(`/analytics/files`);
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Failed to fetch file analytics"));
  }
};
