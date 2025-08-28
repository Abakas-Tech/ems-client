import { axiosInstance } from "../../utils/axios";

// Get Profile function
export const getProfile = async () => {
  try {
    const response = await axiosInstance.get("/agent-profile");
    console.log(response.data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Profile fetch error");
  }
};

// Update Profile function
export const updateProfile = async (data) => {
  try {
    const response = await axiosInstance.put("/agent-profile", data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Profile update error");
  }
};
