import axiosInstance from "../../utils/axios";

// Fetch single property by ID
export const getPropertyById = async (id) => {
  const res = await axiosInstance.get(`/properties/${id}`);
  return res.data.data;
};

// Fetch images for a property
export const getPropertyImages = async (id) => {
  const res = await axiosInstance.get(`/properties/${id}/images`);
  return res.data.data.data;
};

// Fetch featured properties
export const getFeaturedProperties = async (params) => {
  const res = await axiosInstance.get("/properties", { params: params });
  return res.data.data.properties;
};
// Fetch Agent Profile
export const getAgentProfile = async () => {
  const res = await axiosInstance.get("/agent-profile");
  return res.data.data;
};
