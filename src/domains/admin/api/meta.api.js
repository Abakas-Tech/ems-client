import axiosInstance from "../../../utils/axios";
// Get regions
export const getRegions = async () => {
  const response = await axiosInstance.get("/meta/regions");
  return response.data.data;
};
