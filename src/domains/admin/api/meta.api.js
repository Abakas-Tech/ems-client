import axiosInstance from "../../../utils/axios";
// Get regions
const getRegions = async () => {
  try {
    const response = await axiosInstance.get("/meta/regions");
    return response.data.data;
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
    return response.data.data;
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
    return response.data.data || [];
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to fetch status",
    );
  }
};

export { getRegions, getCities, getWorkerStatuses };
