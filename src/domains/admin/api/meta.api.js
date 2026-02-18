import axiosInstance from "../../../utils/axios";
// Get regions
const getRegions = async () => {
  const response = await axiosInstance.get("/meta/regions");
  return response.data.data;
};

// Get worker status
const getWorkerStatuses = async () => {
  try {
    const response = await axiosInstance.get("/meta/worker-statuses");
    return response.data.data || [];
  } catch (error) {
    console.error("Failed to fetch statuses:", error);
    throw error;
  }
};

export {
    getRegions,
    getWorkerStatuses
}