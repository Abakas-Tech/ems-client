import { axiosInstance } from "../../../utils/axios";

export const fetchPropertiesAnalytics = async (params = {}) => {
  try {
    const response = await axiosInstance.get(`/analytics/properties`, {
      params: Object.keys(params).length > 0 ? params : undefined,
    });
    return response?.data?.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch property analytics"
    );
  }
};

export const fetchPropertiesCount = async () => {
  try {
    const response = await axiosInstance.get(`/analytics/count/properties`);
    return response?.data?.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch property analytics"
    );
  }
};
export const fetchAppointmentAnalytics = async () => {
  try {
    const response = await axiosInstance.get(`/analytics/appointments`);
    return response.data.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch appointment analytics"
    );
  }
};

export const fetchFileAnalytics = async () => {
  try {
    const response = await axiosInstance.get(`/analytics/files`);
    return response.data.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch file analytics"
    );
  }
};
