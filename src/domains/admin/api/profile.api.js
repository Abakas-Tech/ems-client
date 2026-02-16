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

