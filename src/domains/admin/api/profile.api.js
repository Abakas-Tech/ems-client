import { axiosInstance } from "../../../utils/axios";

// Get Profile function
const getProfile = async () => {
  try {
    const response = await axiosInstance.get("/users/me/profile");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Profile fetch error");
  }
};

// Get Profile function
const updateProfile = async (payload) => {
  try {
    const response = await axiosInstance.put("/users/me/profile", payload);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Profile update error");
  }
};

export { getProfile, updateProfile };
