import { axiosInstance } from "../../../utils/axios";

// Get Profile function
export const getProfile = async () => {
  try {
    const response = await axiosInstance.get("/users/me/profile");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Profile fetch error");
  }
};
// Get Profile function
export const updateProfile = async (payload) => {
  console.log(payload)
  try {
    const response = await axiosInstance.put("/users/me/profile", payload);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Profile update error");
  }
};
