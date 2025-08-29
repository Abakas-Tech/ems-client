import { axiosInstance } from "../../utils/axios";

export const fetchPropertiesAnalytics = async (filters = {}) => {
  try {
    const params = {};

    if (filters.page) params.page = parseInt(filters.page, 10);
    if (filters.limit) params.limit = parseInt(filters.limit, 10);

    if (filters.startDate && !isNaN(Date.parse(filters.startDate))) {
      params.startDate = new Date(filters.startDate).toISOString();
    }

    // ✅ Ensure title is a string, trim spaces, keep spaces in query
    if (filters.title !== undefined && filters.title !== null) {
      params.title = String(filters.title).trim();
    }

    if (filters.endDate && !isNaN(Date.parse(filters.endDate))) {
      params.endDate = new Date(filters.endDate).toISOString();
    }

    if (filters.sortBy) params.sortBy = filters.sortBy; // ✅ pass sortBy

    const response = await axiosInstance.get(`/analytics/properties`, {
      params: Object.keys(params).length > 0 ? params : undefined,
    });

    return response.data.data;
  } catch (error) {
    if (error.response?.status === 400) {
      throw new Error(JSON.stringify(error.response.data.message));
    }
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
